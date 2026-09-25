import type { ReactNode } from "react";
import { Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import type { RoleKey } from "../types";

type AccessProps = { roles?: RoleKey[] };

/** Route-level protection required by the technical assignment. */
export function PrivateRoutes({ roles }: AccessProps) {
  const access = useAuth((state) => state.access);
  const user = useAuth((state) => state.user);
  const has = useAuth((state) => state.has);
  const location = useLocation();

  if (!access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !user) {
    return (
      <main className="center" aria-label="Yuklanmoqda">
        <Spin size="large" />
      </main>
    );
  }
  return roles && !has(roles) ? <Navigate to="/403" replace /> : <Outlet />;
}

/** Hides an individual UI control when the active user lacks the given role. */
export function PrivateComponent({
  roles,
  children,
  fallback = null,
}: AccessProps & { children: ReactNode; fallback?: ReactNode }) {
  const has = useAuth((state) => state.has);
  return has(roles || []) ? children : fallback;
}
