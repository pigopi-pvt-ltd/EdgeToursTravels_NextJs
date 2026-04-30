import { getAuthToken, clearAuthData } from './auth';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiClient<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...rest } = options;

  // Use a plain object with string keys
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge custom headers
  if (headers) {
    Object.assign(requestHeaders, headers);
  }

  if (requireAuth) {
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        clearAuthData();
        window.location.href = '/login';
      }
      throw new Error('No authentication token');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...rest,
    headers: requestHeaders,
  };

  try {
    const response = await fetch(endpoint, config);
    const contentType = response.headers.get('content-type');
    let data: any = {};

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
      }
      // If it's not JSON but response is OK (unlikely for our APIs), just return the text or empty object
      return text as any;
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          clearAuthData();
          window.location.href = '/login';
        }
        throw new Error('Session expired – please login again');
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data as T;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Public API client (no authentication required)
 */
export async function publicApiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, requireAuth: false });
}

export default apiClient;