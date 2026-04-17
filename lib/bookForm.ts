import { publicApiClient } from './apiClient';

export interface BookingFormData {
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  userId?: string;        // optional, if user is logged in
  price?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking?: any;
  error?: string;
}

/**
 * Submits the booking form data to the existing API
 * ✅ Uses /api/bookings (not /api/admin/book-form)
 */
export async function submitBooking(formData: BookingFormData): Promise<BookingResponse> {
  try {
    const data = await publicApiClient('/api/bookings', {   // ← correct endpoint
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return {
      success: true,
      message: 'Booking request submitted successfully!',
      booking: data.booking,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error.message,
    };
  }
}