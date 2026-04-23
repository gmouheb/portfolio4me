import ThemeToggle from "./ThemeToggle";

const defaultLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({
  brand = "Portfolio",
  links = defaultLinks,
  ctaLabel = "Contact",
  ctaHref = "#contact",
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--bg-card)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#home"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-main)]"
        >
          {brand}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <a
            href={ctaHref}
            className="rounded-full border border-[var(--secondary)]/40 bg-[var(--primary-soft)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:text-[var(--text-main)] dark:bg-transparent"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
