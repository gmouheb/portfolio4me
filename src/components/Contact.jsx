import { useState } from "react";
import { apiRequest } from "../lib/api";

const defaultLinks = [
  { label: "Email", href: "mailto:ghabrimouheb@gmail.com" },
  { label: "Phone", href: "tel:+21650823254" },
];

export default function Contact({
  title = "Contact",
  description = "Open to cloud, DevOps, and platform engineering opportunities in remote or hybrid environments.",
  links = defaultLinks,
  details = ["Ariana, Tunisia", "ghabrimouheb@gmail.com", "+216 50 823 254"],
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");

    try {
      await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setStatus("Message sent successfully.");
    } catch (error) {
      setStatus(error.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 rounded-[2rem] border border-[var(--border)] bg-[color:var(--bg-card)] p-8 md:grid-cols-[0.95fr,1.05fr] md:p-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
            Reach Out
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text-subtle)]">
            {details.map((detail) => (
              <span key={detail} className="rounded-full border border-[var(--border)] px-4 py-2">
                {detail}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--secondary)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-[color:var(--bg-main)] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-[var(--text-muted)]">Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
                placeholder="Your name"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[var(--text-muted)]">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm text-[var(--text-muted)]">Subject</span>
            <input
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
              placeholder="Project, opportunity, or quick hello"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[var(--text-muted)]">Message</span>
            <textarea
              required
              rows="6"
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
              placeholder="Tell me what you would like to discuss."
            />
          </label>

          {status ? <p className="text-sm text-[var(--secondary)]">{status}</p> : null}

          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
