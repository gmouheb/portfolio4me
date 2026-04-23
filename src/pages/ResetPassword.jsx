import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { ADMIN_LOGIN_PATH } from "../lib/admin";
import { apiRequest } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    if (!token) {
      setStatus("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setStatus("Password must be at least 12 characters long and include a letter and a number.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setStatus(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-6 py-16 text-[var(--text-main)]">
      <div className="mx-auto max-w-xl space-y-6 rounded-[2rem] border border-[var(--border)] bg-[color:var(--bg-card)] p-8 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40">
        <ThemeToggle />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">Recovery</p>
          <h1 className="mt-4 text-3xl font-semibold">Reset Password</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Set a new password for your admin account.
          </p>
          <p className="mt-2 text-xs leading-6 text-[var(--text-subtle)]">
            Use at least 12 characters and include both letters and numbers.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-main)]">New Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-main)]">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
            />
          </label>

          {status ? <p className="text-sm text-[var(--secondary)]">{status}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link to={ADMIN_LOGIN_PATH} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]">
          Back to login
        </Link>
      </div>
    </div>
  );
}
