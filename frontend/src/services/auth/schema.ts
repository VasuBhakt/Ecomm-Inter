export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface SigninRequest {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  email: string;
}
