export default function About({
  title = "About",
  description = "I focus on cloud platforms, secure delivery pipelines, and operational simplicity. My work centers on turning infrastructure into a reliable product with clear standards, automation, and measurable outcomes.",
  highlights = [
    "Infrastructure as code",
    "CI/CD automation",
    "Cloud security practices",
  ],
}) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-[1fr,1.2fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
            Profile
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">{title}</h2>
        </div>

        <div className="space-y-6">
          <p className="text-base leading-8 text-[var(--text-muted)]">{description}</p>
          <div className="flex flex-wrap gap-3">
            {highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-[var(--border)] bg-[color:var(--bg-card)] px-4 py-2 text-sm text-[var(--text-main)]"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
