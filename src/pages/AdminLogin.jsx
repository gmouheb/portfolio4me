import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/admin/Field";
import ThemeToggle from "../components/ThemeToggle";
import { ADMIN_BASE_PATH, ADMIN_FORGOT_PASSWORD_PATH } from "../lib/admin";
import { apiRequest } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        await apiRequest("/auth/me");

        if (!cancelled) {
          navigate(location.state?.from?.pathname || ADMIN_BASE_PATH, { replace: true });
        }
      } catch {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [location.state?.from?.pathname, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      navigate(location.state?.from?.pathname || ADMIN_BASE_PATH, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-[var(--text-subtle)]">
        Restoring session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-6 py-16 text-[var(--text-main)]">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <ThemeToggle />
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--secondary)]">Private Workspace</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[var(--text-main)] md:text-6xl">
            Portfolio control panel for content, layout, and updates.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            Use the private console to update your public profile, refine project copy, and keep
            experience data current without touching source files.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Profile editing",
              "Experience updates",
              "Project publishing",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-4 text-sm text-[var(--text-main)]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[color:var(--bg-card)] p-8 shadow-2xl shadow-slate-200/40 backdrop-blur dark:shadow-cyan-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">Secure Login</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Admin Access</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-subtle)]">
            Sign in to manage profile, skills, experience, and projects.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Field
              label="Username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="admin"
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="••••••••"
            />
            <p className="text-xs leading-6 text-[var(--text-subtle)]">
              Session stays active with a secure cookie until you log out or it expires.
            </p>
            {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
            <Link
              to={ADMIN_FORGOT_PASSWORD_PATH}
              className="block text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
            >
              Forgot password?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
