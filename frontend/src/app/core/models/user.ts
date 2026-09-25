export interface User {
  id?: number;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
  address: string;
  createdAt?: string;
}