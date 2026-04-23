function ProjectCard({ project }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[color:var(--bg-card)] p-6">
      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="mb-6 h-52 w-full rounded-2xl object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--text-main)]">{project.title}</h3>
        <p className="text-sm leading-7 text-[var(--text-muted)]">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-4 pt-4 text-sm">
        {project.githubUrl ? (
          <a className="text-[var(--secondary)] transition hover:opacity-80" href={project.githubUrl}>
            GitHub
          </a>
        ) : null}
        {project.liveUrl ? (
          <a className="text-[var(--text-muted)] transition hover:text-[var(--text-main)]" href={project.liveUrl}>
            Live Demo
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Projects({ projects = [] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--secondary)]">
          Selected Work
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-[var(--text-main)]">Projects</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
