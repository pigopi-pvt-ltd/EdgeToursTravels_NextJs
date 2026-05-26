
export interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  name: string;
  contact: string;
  price?: string | number;
  status: string;
  createdAt: string;
  driverResponse?: 'accepted' | 'rejected' | null;
  driverId?: { _id: string; name: string } | null;
  vehicleId?: { _id: string; cabNumber: string; modelName: string } | null;
  type: 'oneTime' | 'longTerm';
  otp?: string;
  otpExpiry?: string;
}

export interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

export interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
  isAvailable: boolean;
}