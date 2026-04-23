export default function Footer({
  name = "Portfolio",
  note = "Built with React and Tailwind CSS.",
}) {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[var(--text-subtle)] md:flex-row md:items-center md:justify-between">
        <p>{name}</p>
        <p>{note}</p>
      </div>
    </footer>
  );
}
