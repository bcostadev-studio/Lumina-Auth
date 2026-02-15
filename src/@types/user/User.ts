export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}
