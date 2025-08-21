// src/types/index.ts
export type Patient = {
  id: string;
  clinic_id: string;
  full_name: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  clinic_id: string;
  date: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'canceled';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  patient_id: string;
  clinic_id: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'transfer';
  payment_date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
};

export type DentalRecord = {
  id: string;
  patient_id: string;
  clinic_id: string;
  tooth_number: number;
  condition: string;
  notes?: string;
  images?: string[];
  treatment_date: string;
  next_appointment?: string;
  created_at: string;
};

export type ToothCondition = {
  condition: string;
  treatment_date: string;
  notes?: string;
  images?: string[];
};