
export type UserRole = 'admin' | 'counsellor' | 'learner';
export type CounsellorStatus = 'pending' | 'approved' | 'disapproved';
export type Gender = 'male' | 'female' | 'other';

export interface Notification {
  id: string;
  userId: string; // Recipient
  title: string;
  message: string;
  type: 'booking' | 'registration' | 'info' | 'report';
  timestamp: Date;
  read: boolean;
  bookingId?: string;
}

export interface PopiaData {
  id_or_dob: string;
  isForeign?: boolean;
  passportNo?: string;
  guardianName: string;
  guardianRelationship: string;
  guardianContact: string;
  guardianEmail: string;
  guardianPassportNo?: string;
  popiaConsent: boolean;
  popiaSignature: string;
  popiaDate: string;
  popiaLocation: string;
}

export interface User extends Partial<PopiaData> {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  avatarSeed?: string;
  gender?: Gender;
  specialty?: string;
  qualifications?: string;
  department?: string;
  year?: number;
  availableSlots?: string[];
  status?: CounsellorStatus;
  rating?: number;
  reviewCount?: number;
  cvFileName?: string;
  profilePhoto?: string;
  meetingLink?: string;
  trustedCounsellors?: string[]; // Array of counsellor IDs
  password?: string; // Hashed password
}

export interface Booking {
  id: string;
  learnerId: string;
  counsellorId: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'missed';
  anonymous: boolean;
  rating?: number;
  meetingLink?: string;
  attended?: boolean;
  reminderSent?: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  senderId?: string;
  id: string;
  timestamp: number;
}
