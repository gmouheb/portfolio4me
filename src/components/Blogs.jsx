function BlogCard({ item }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)]">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-52 w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--text-main)]">{item.title}</h3>
            {item.publishedAt ? (
              <p className="mt-1 text-sm text-[var(--text-subtle)]">{item.publishedAt}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{item.excerpt}</p>
        {item.linkUrl ? (
          <div className="mt-5">
            <a
              href={item.linkUrl}
              className="text-sm text-[var(--secondary)] transition hover:opacity-80"
            >
              Read more
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Blogs({ items = [] }) {
  return (
    <section id="blogs" className="mx-auto max-w-6xl px-6 py-20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
          Writing
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Blogs</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <BlogCard key={`${item.title}-${item.publishedAt}`} item={item} />
        ))}
      </div>
    </section>
  );
}
