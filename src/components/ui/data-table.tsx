import { asText, isRecord } from '@/lib/data';

export function DataTable({
  rows,
  preferredColumns,
}: {
  rows: unknown[];
  preferredColumns?: string[];
}) {
  const recordRows = rows.filter(isRecord);
  if (!recordRows.length) return null;

  const firstRow = recordRows[0];
  const columns = preferredColumns?.length
    ? preferredColumns.filter((column) => column in firstRow)
    : Object.keys(firstRow).slice(0, 8);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium text-slate-300">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recordRows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="border-t border-white/8">
                {columns.map((column) => (
                  <td key={column} className="max-w-[280px] px-4 py-3 align-top text-white">
                    <div className="line-clamp-3 break-words">{asText(row[column])}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
