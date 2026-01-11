
export type VisitorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT';
export type VisitorType = 'Guest' | 'Delivery' | 'Maintenance' | 'Staff';

export interface Society {
  id: string;
  name: string;
  city: string;
}

export interface Resident {
  id: string;
  society_id: string;
  flat_number: string;
  name: string;
  whatsapp_number: string;
}

export interface VisitorEntry {
  id: string;
  society_id: string;
  resident_id?: string;
  flat_number: string;
  visitor_name: string;
  purpose: string;
  status: VisitorStatus;
  visitor_type: VisitorType;
  created_at: string;
}

export interface Staff {
  id: string;
  society_id: string;
  name: string;
  role: string;
  phone: string;
  flats: string[];
  photo?: string;
  status: 'In' | 'Out';
  last_check_in?: string;
}

export interface Notice {
  id: string;
  society_id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}
