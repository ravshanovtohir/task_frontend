import axios from "axios";
import { useAuth } from "./auth";
import type { ApiResponse } from "./types";
// Backend URI-versioning is enabled, but controllers are version-neutral: routes begin at /auth, /staff and /payments.
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://task-backend-pa1x.onrender.com",
});
api.interceptors.request.use((c) => {
  const t = useAuth.getState().access;
  if (t) c.headers.Authorization = `Bearer ${t}`;
  c.headers["Accept-Language"] = "uz";
  return c;
});
api.interceptors.response.use(
  (r) => r,
  async (e) => {
    const q = e.config;
    if (
      e.response?.status === 401 &&
      !q?._retry &&
      useAuth.getState().refresh
    ) {
      q._retry = true;
      try {
        const r = await axios.post<
          ApiResponse<{ access_token: string; refresh_token: string }>
        >(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: useAuth.getState().refresh,
        });
        useAuth.getState().tokens(r.data.data);
        q.headers.Authorization = `Bearer ${r.data.data.access_token}`;
        return api(q);
      } catch {
        useAuth.getState().clear();
        location.assign("/login");
      }
    }
    return Promise.reject(e);
  },
);
export const errorText = (e: unknown) =>
  axios.isAxiosError(e)
    ? e.response?.data?.message || "So‘rov bajarilmadi."
    : "Kutilmagan xatolik.";
