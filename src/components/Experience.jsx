function ExperienceItem({ item }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-main)]">{item.role}</h3>
          <p className="mt-1 text-sm text-[var(--secondary)]">{item.company}</p>
        </div>
        <p className="text-sm text-[var(--text-subtle)]">{item.period}</p>
      </div>

      <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
        {item.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </article>
  );
}

export default function Experience({ items = [] }) {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
          Career Path
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Experience</h2>
      </div>

      <div className="mt-10 grid gap-6">
        {items.map((item) => (
          <ExperienceItem key={`${item.company}-${item.role}`} item={item} />
        ))}
      </div>
    </section>
  );
}
