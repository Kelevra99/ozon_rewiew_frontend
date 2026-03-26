import { asText, isRecord } from '@/lib/data';

export function KeyValueGrid({
  data,
  preferredKeys,
}: {
  data: unknown;
  preferredKeys?: string[];
}) {
  if (!isRecord(data)) return null;

  const keys = preferredKeys?.length
    ? preferredKeys.filter((key) => key in data)
    : Object.keys(data);

  if (!keys.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {keys.map((key) => (
        <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{key}</div>
          <div className="mt-2 break-words text-sm leading-6 text-white">{asText(data[key])}</div>
        </div>
      ))}
    </div>
  );
}
