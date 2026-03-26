export function LoadingScreen({
  title = 'Загрузка...',
  text,
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
        <div className="text-lg font-semibold text-white">{title}</div>
        {text ? <div className="mt-2 text-sm text-slate-300">{text}</div> : null}
      </div>
    </div>
  );
}
