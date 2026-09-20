'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const GIFS = [
  { file: 'high-five', description: 'Jim y Dwight chocan las manos en The Office' },
  { file: 'celebration', description: 'Dwight celebra con un gorro de fiesta en The Office' },
  { file: 'birthday', description: 'Jim y Dwight celebran un cumpleaños en The Office' },
  { file: 'happy-dance', description: 'Erin baila de alegría en The Office' },
  { file: 'wedding-dance', description: 'Un baile de celebración en The Office' },
  { file: 'victory', description: 'Una celebración de victoria en The Office' },
  { file: 'right-choice', description: 'Una escena de The Office sobre elegir bien' },
  { file: 'pyramid-scheme', description: 'La explicación de un esquema piramidal en The Office' },
  { file: 'silent', description: 'Una reacción sobre guardar silencio en The Office' },
  { file: 'stunned', description: 'Una reacción de sorpresa en The Office' },
  { file: 'oh-god', description: 'Una reacción de exclamación en The Office' },
  { file: 'complainer', description: 'Una escena de The Office sobre las quejas' },
  { file: 'cant-afford', description: 'Una escena de The Office sobre un gasto inesperado' },
  { file: 'wuphf', description: 'Ryan explica WUPHF en The Office' },
  { file: 'message', description: 'Una escena de The Office sobre un mensaje pendiente' },
];

export default function OfficeGif() {
  const [gif] = useState(() => GIFS[Math.floor(Math.random() * GIFS.length)]);
  const [paused, setPaused] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [failed, setFailed] = useState(false);

  return (
    <figure className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
      <figcaption className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Un momento de The Office
      </figcaption>
      {failed ? (
        <p role="status" className="py-8 text-sm text-[var(--muted)]">
          No se pudo cargar el GIF. ¡Buen trabajo con este bloque!
        </p>
      ) : (
        <>
          <Image
            src={`/gifs/the-office/${gif.file}.${paused ? 'png' : 'gif'}`}
            alt={gif.description}
            width={480}
            height={270}
            unoptimized
            className="aspect-video w-full rounded-lg object-contain"
            onError={() => setFailed(true)}
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2"
            onClick={() => setPaused(!paused)}
          >
            {paused ? 'Reproducir GIF' : 'Pausar GIF'}
          </Button>
        </>
      )}
    </figure>
  );
}
