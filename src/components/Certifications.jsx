function CertificationCard({ item }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-6">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="mb-6 h-40 w-full rounded-2xl object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-main)]">{item.name}</h3>
          <p className="mt-1 text-sm text-[var(--secondary)]">{item.issuer}</p>
        </div>
        <p className="text-sm text-[var(--text-subtle)]">{item.date}</p>
      </div>

      {item.credentialUrl ? (
        <div className="mt-5">
          <a
            href={item.credentialUrl}
            className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
          >
            View Credential
          </a>
        </div>
      ) : null}
    </article>
  );
}

export default function Certifications({ items = [] }) {
  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
          Credentials
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Certifications</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <CertificationCard key={`${item.name}-${item.issuer}-${item.date}`} item={item} />
        ))}
      </div>
    </section>
  );
}
