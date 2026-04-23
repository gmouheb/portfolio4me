export default function Hero({
  eyebrow = "Cloud / DevSecOps Engineer",
  title = "Building secure, reliable infrastructure and products.",
  description = "I design scalable systems, automate delivery, and keep security close to the development lifecycle.",
  primaryAction = { label: "View Projects", href: "#projects" },
  secondaryAction = { label: "Get In Touch", href: "#contact" },
}) {
  return (
    <section
      id="home"
      className="border-b border-[var(--border)] bg-gradient-to-b from-[color:var(--bg-elevated)] via-[color:var(--bg-main)] to-transparent"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-24 md:py-32">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--secondary)]">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-main)] md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href={primaryAction.href}
            className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            {primaryAction.label}
          </a>
          <a
            href={secondaryAction.href}
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--secondary)]"
          >
            {secondaryAction.label}
          </a>
        </div>
      </div>
    </section>
  );
}
