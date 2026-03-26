export function ErrorAlert({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {text}
    </div>
  );
}
