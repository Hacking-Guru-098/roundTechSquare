import { api } from "./axios";
import type { ApiOk } from "../types/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function signup(params: { name: string; email: string; password: string }) {
  const res = await api.post<ApiOk<AuthResponse>>("/auth/signup", params);
  return res.data.data;
}

export async function login(params: { email: string; password: string }) {
  const res = await api.post<ApiOk<AuthResponse>>("/auth/login", params);
  return res.data.data;
}
