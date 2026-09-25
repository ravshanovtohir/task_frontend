import { create } from "zustand";
import type { RoleKey, User, UserRole } from "./types";
type S = {
  access: string | null;
  refresh: string | null;
  user: User | null;
  tokens: (x: { access_token: string; refresh_token: string }) => void;
  setUser: (x: User | null) => void;
  clear: () => void;
  has: (x: RoleKey[]) => boolean;
};
const read = () => {
  try {
    return JSON.parse(localStorage.getItem("rb") || "{}");
  } catch {
    localStorage.removeItem("rb");
    return {};
  }
};
const d = read();
const roleKey = (x: UserRole): RoleKey =>
  typeof x === "string" ? x : "role" in x ? x.role.key : x.key;
export const useAuth = create<S>((set, get) => ({
  access: d.access || null,
  refresh: d.refresh || null,
  // Permissions must always come from a fresh /auth/me call after a reload.
  // Keeping only tokens avoids showing a page with an outdated role.
  user: null,
  tokens: (x) => {
    const n = { access: x.access_token, refresh: x.refresh_token };
    localStorage.setItem("rb", JSON.stringify(n));
    set({ access: n.access, refresh: n.refresh });
  },
  setUser: (user) => set({ user }),
  clear: () => {
    localStorage.removeItem("rb");
    set({ access: null, refresh: null, user: null });
  },
  has: (r) => !!get().user?.roles?.some((x) => r.includes(roleKey(x))),
}));
