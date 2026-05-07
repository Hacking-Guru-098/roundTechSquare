import axios from "axios";
import { getAuthToken } from "../services/storage";

// For Android emulator use: http://10.0.2.2:5000
// For iOS simulator use: http://localhost:5000
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    // Axios headers type differs between platforms/builds; handle both shapes.
    if (config.headers && typeof (config.headers as unknown as { set?: unknown }).set === "function") {
      (config.headers as unknown as { set: (k: string, v: string) => void }).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${token}` } as typeof config.headers;
    }
  }
  return config;
});

