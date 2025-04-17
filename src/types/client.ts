
export interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAssigned?: boolean;
  assignmentId?: string;
  assignmentStartDate?: string;
  assignmentEndDate?: string;
}
