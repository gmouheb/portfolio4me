export default function AdminCard({ title, subtitle, children, onDelete }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-rose-400/30 px-3 py-1 text-xs font-medium text-rose-200 transition hover:border-rose-300"
          >
            Delete
          </button>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}
