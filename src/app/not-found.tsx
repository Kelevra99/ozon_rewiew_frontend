import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="text-3xl font-semibold text-white">Страница не найдена</div>
        <p className="mt-3 text-sm text-slate-400">
          Проверь адрес или вернись в кабинет.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-medium text-slate-950"
        >
          В кабинет
        </Link>
      </div>
    </div>
  );
}
