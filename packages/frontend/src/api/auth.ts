import client from "./client";
import type { User } from "../types";

export async function register(data: {
  email: string;
  name: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const res = await client.post("/auth/register", data);
  return res.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const res = await client.post("/auth/login", data);
  return res.data;
}
