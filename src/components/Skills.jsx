function SkillGroup({ title, items }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-6">
      <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[color:var(--bg-main)] px-3 py-2 text-sm text-[var(--text-muted)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills({ groups = [] }) {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
            Expertise
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Skills</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[var(--text-subtle)]">
          Small, reusable groups make this section easy to adapt for static data
          now and API data later.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <SkillGroup key={group.title} title={group.title} items={group.items} />
        ))}
      </div>
    </section>
  );
}
