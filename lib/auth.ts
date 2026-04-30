
export interface LoginCredentials {
  email?: string;
  mobileNumber?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  mobileNumber: string;
  name?: string;
  role?: 'admin' | 'driver' | 'employee' | 'customer';
  driverDetails?: any;
  employeeDetails?: any;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    mobileNumber: string;
    name?: string;
    role: 'admin' | 'driver' | 'employee' | 'customer';
    profileCompleted: boolean;
    createdAt: string;
    modules?: string[]; 
  };
  token: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data as T;
}

export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(response);
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
}

export function storeAuthData(token: string, user: AuthResponse['user']) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function clearAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export function getStoredUser(): AuthResponse['user'] | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function updateProfile(name: string) {
  const token = getAuthToken();
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

// Driver-specific (if user is driver)
export async function getDriverDetails() {
  const token = getAuthToken();
  const res = await fetch('/api/user/driver-details', { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function updateDriverDetails(details: any) {
  const token = getAuthToken();
  const res = await fetch('/api/user/driver-details', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(details),
  });
  return res.json();
}

export async function submitKYC(formData: FormData) {
  const token = getAuthToken();
  const res = await fetch('/api/user/kyc', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}