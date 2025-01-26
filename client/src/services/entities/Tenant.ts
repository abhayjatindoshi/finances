import { User } from "./User";

export interface Tenant {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  users: User[];
}