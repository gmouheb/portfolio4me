export default function Field({ label, as = "input", ...props }) {
  const Element = as;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text-main)]">{label}</span>
      <Element
        {...props}
        className="w-full rounded-2xl border border-[var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--secondary)]"
      />
    </label>
  );
}
