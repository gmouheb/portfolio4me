import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { ADMIN_LOGIN_PATH } from "../lib/admin";
import { apiRequest } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const data = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus(data.message);
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
          <h1 className="mt-4 text-3xl font-semibold">Forgot Password</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Enter your admin email. A reset link will be sent to that address.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-main)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
              placeholder="your-email@example.com"
            />
          </label>

          {status ? <p className="text-sm text-[var(--secondary)]">{status}</p> : null}
          <p className="text-xs leading-6 text-[var(--text-subtle)]">
            If the address matches an admin account, you will receive a single-use email link.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to={ADMIN_LOGIN_PATH} className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]">
          Back to login
        </Link>
      </div>
    </div>
  );
}
