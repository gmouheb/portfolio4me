import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ADMIN_LOGIN_PATH } from "../lib/admin";
import { apiRequest } from "../lib/api";

export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        await apiRequest("/auth/me");

        if (!cancelled) {
          setStatus("valid");
        }
      } catch {
        if (!cancelled) {
          setStatus("missing");
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-[var(--text-subtle)]">
        Restoring session...
      </div>
    );
  }

  if (status === "missing") {
    return <Navigate to={ADMIN_LOGIN_PATH} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
