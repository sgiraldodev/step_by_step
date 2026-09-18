'use client';
import { Button } from '@/components/ui/button';

import { useEffect, useState, type FormEvent } from 'react';
import { BarChart3, Clock3, Timer } from 'lucide-react';
import { statisticsApi, type Statistics, type Tag } from '@/modules/focus/tasks';
import { businessDay } from '@/modules/focus/timer';
import { TagChip } from '@/modules/focus/components/tag-selector';

export function formatTime(seconds: number): string {
  const value = Math.round(seconds);
  const hours = Math.floor(value / 3600),
    minutes = Math.floor((value % 3600) / 60),
    rest = value % 60;
  return hours
    ? `${hours} h ${minutes} min${rest ? ` ${rest} s` : ''}`
    : minutes
      ? `${minutes} min${rest ? ` ${rest} s` : ''}`
      : `${rest} s`;
}
function initialDates() {
  const to = businessDay();
  const start = new Date(`${to}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 29);
  return { from: start.toISOString().slice(0, 10), to, tag: '' };
}

export default function StatisticsView({ tags, revision }: { tags: Tag[]; revision: number }) {
  const [range, setRange] = useState(initialDates);
  const [draft, setDraft] = useState(range);
  const [report, setReport] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    setReport(null);
    setActive(null);
    statisticsApi
      .get(range.from, range.to, range.tag)
      .then((value) => {
        if (current) setReport(value);
      })
      .catch((e) => {
        if (current)
          setError(e instanceof Error ? e.message : 'No se pudieron cargar las estadísticas.');
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [range, revision]);
  function apply(e: FormEvent) {
    e.preventDefault();
    if (draft.from > draft.to || (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000 > 366) {
      setError('Selecciona un rango válido de hasta 367 días.');
      return;
    }
    setRange({ ...draft });
  }
  const slices = report?.by_tag.filter((row) => row.seconds > 0) ?? [];
  const chosen = slices.find((row) => row.id === active);

  const maxDay = Math.max(1, ...(report?.by_day.map((row) => row.seconds) ?? []));
  return (
    <section aria-label="Estadísticas" className="space-y-6">
      <div className="panel p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <BarChart3 size={22} className="text-[var(--accent-text)]" />
          Tu tiempo, en perspectiva
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Descubre a qué dedicas tus bloques de concentración.
        </p>
        <form onSubmit={apply} className="mt-6 flex flex-wrap items-end gap-4">
          <label className="text-xs font-medium">
            Desde
            <input
              aria-label="Fecha desde"
              type="date"
              required
              value={draft.from}
              onChange={(e) => setDraft({ ...draft, from: e.target.value })}
              className="mt-2 block rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5"
            />
          </label>
          <label className="text-xs font-medium">
            Hasta
            <input
              aria-label="Fecha hasta"
              type="date"
              required
              min={draft.from}
              value={draft.to}
              onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              className="mt-2 block rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5"
            />
          </label>
          <label className="text-xs font-medium">
            Etiqueta
            <select
              aria-label="Etiqueta de estadísticas"
              value={draft.tag}
              onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
              className="mt-2 block max-w-60 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5"
            >
              <option value="">Todas las etiquetas</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="text-xs" disabled={loading}>
            Ver estadísticas
          </Button>
        </form>
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Fechas inclusivas, hora de Colombia. Cada bloque se registra en el día en que lo cierras.
          No incluye pausas, descansos ni bloques aún abiertos.
        </p>
        {range.tag && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            El filtro selecciona los bloques que contienen esta etiqueta. El gráfico reparte su
            tiempo entre todas las etiquetas de esos bloques.
          </p>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[var(--error-bg)] p-4 text-sm text-[var(--error-text)]"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="panel p-10 text-center text-sm text-[var(--muted)]">
          Calculando tu tiempo…
        </p>
      ) : (
        report && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Tiempo de enfoque',
                  value: formatTime(report.total_seconds),
                  icon: Clock3,
                },
                { label: 'Bloques registrados', value: report.blocks, icon: Timer },
                { label: 'Tareas trabajadas', value: report.tasks, icon: BarChart3 },
              ].map(({ label, value, icon: Icon }) => (
                <div className="panel p-5" key={label}>
                  <Icon size={18} className="mb-3 text-[var(--accent-text)]" />
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                  <p className="mt-2 text-lg font-semibold md:text-2xl">{value}</p>
                </div>
              ))}
            </div>
            {report.has_legacy_effort && (
              <p className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-xs leading-5 text-[var(--secondary)]">
                Los ciclos anteriores a esta función se conservan en tus tareas. Como no tenían
                duración registrada, no se incluyen en estos gráficos.
              </p>
            )}
            {!report.total_seconds ? (
              <div className="panel px-6 py-16 text-center">
                <BarChart3 size={36} className="mx-auto mb-4 text-[var(--faint)]" />
                <h3 className="font-semibold">Todavía no hay tiempo registrado en este rango</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Termina un bloque de enfoque o amplía las fechas para ver tus estadísticas.
                </p>
              </div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="panel p-6">
                  <h3 className="font-semibold">Tiempo por etiqueta</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    Si una tarea tiene varias etiquetas, el tiempo se divide por igual entre ellas.
                  </p>
                  <div className="relative mx-auto my-6 h-64 w-64">
                    <svg
                      viewBox="0 0 200 200"
                      className="h-full w-full"
                      aria-label="Gráfico de torta del tiempo por etiqueta"
                      role="group"
                    >
                      {slices.map((row, index) => {
                        const fraction = row.seconds / report.total_seconds;
                        const before = slices
                          .slice(0, index)
                          .reduce(
                            (total, slice) => total + slice.seconds / report.total_seconds,
                            0,
                          );
                        return (
                          <circle
                            key={row.id}
                            cx="100"
                            cy="100"
                            r="76"
                            fill="none"
                            stroke={row.color}
                            strokeWidth={active === row.id ? 32 : 27}
                            pathLength="100"
                            strokeDasharray={`${fraction * 100} ${100 - fraction * 100}`}
                            strokeDashoffset={-before * 100}
                            transform="rotate(-90 100 100)"
                            tabIndex={0}
                            role="button"
                            aria-label={`${row.name}: ${formatTime(row.seconds)}, ${(fraction * 100).toFixed(1)}%`}
                            onMouseEnter={() => setActive(row.id)}
                            onMouseLeave={() => setActive(null)}
                            onFocus={() => setActive(row.id)}
                            onBlur={() => setActive(null)}
                            onClick={() => setActive(active === row.id ? null : row.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActive(active === row.id ? null : row.id);
                              }
                            }}
                          >
                            <title>
                              {row.name}: {formatTime(row.seconds)}
                            </title>
                          </circle>
                        );
                      })}
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-14 text-center">
                      <span className="text-xs text-[var(--muted)] break-words">
                        {chosen?.name || 'Enfoque total'}
                      </span>
                      <strong className="mt-2 text-xl">
                        {formatTime(chosen?.seconds ?? report.total_seconds)}
                      </strong>
                    </div>
                  </div>
                  <table className="w-full text-left text-xs">
                    <caption className="sr-only">Distribución de tiempo por etiquetas</caption>
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                        <th className="pb-3">Etiqueta</th>
                        <th className="pb-3 text-right">Tiempo</th>
                        <th className="pb-3 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.by_tag.map((row) => (
                        <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-3">
                            <TagChip tag={row} />
                          </td>
                          <td className="py-3 text-right">{formatTime(row.seconds)}</td>
                          <td className="py-3 text-right">
                            {((row.seconds / report.total_seconds) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel p-6">
                  <h3 className="font-semibold">Enfoque por día</h3>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Tiempo real de los bloques registrados en cada fecha.
                  </p>
                  <div className="mt-6 max-h-[520px] space-y-4 overflow-y-auto">
                    {report.by_day.map((row) => (
                      <div key={row.date}>
                        <div className="mb-2 flex justify-between gap-3 text-xs">
                          <time dateTime={row.date}>
                            {new Date(`${row.date}T12:00:00Z`).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </time>
                          <span>{formatTime(row.seconds)}</span>
                        </div>
                        <div
                          className="h-3 overflow-hidden rounded-full bg-[var(--surface-subtle)]"
                          role="img"
                          aria-label={`${row.date}: ${formatTime(row.seconds)}`}
                        >
                          <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{ width: `${(row.seconds / maxDay) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}
    </section>
  );
}
