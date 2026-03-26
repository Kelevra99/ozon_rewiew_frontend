export function EmptyState({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/3 px-6 py-10 text-center">
      <div className="text-base font-medium text-white">{title}</div>
      {text ? <div className="mt-2 text-sm text-slate-400">{text}</div> : null}
    </div>
  );
}
