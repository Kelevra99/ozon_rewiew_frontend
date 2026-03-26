export function JsonBlock({
  title = 'Raw JSON',
  data,
}: {
  title?: string;
  data: unknown;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white">{title}</div>
      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
