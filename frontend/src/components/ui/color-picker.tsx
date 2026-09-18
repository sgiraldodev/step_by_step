'use client';

import { useEffect, useId, useState } from 'react';
import { APP_COLORS, APP_COLOR_STORAGE_KEY, validAppColor, type AppColor } from './app-colors';

export default function ColorPicker() {
  const id = useId();
  const [selected, setSelected] = useState<AppColor>('blue');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSelected(validAppColor(document.documentElement.dataset.color));
  }, []);

  function choose(color: AppColor) {
    document.documentElement.setAttribute('data-color', color);
    setSelected(color);
    try {
      localStorage.setItem(APP_COLOR_STORAGE_KEY, color);
      setMessage(`Color ${APP_COLORS.find((option) => option.id === color)?.label} guardado.`);
    } catch {
      setMessage('Color aplicado. Este navegador no permite guardarlo para la próxima visita.');
    }
  }

  return (
    <fieldset aria-describedby={`${id}-help`}>
      <legend className="text-sm font-medium">Color de la aplicación</legend>
      <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-[var(--muted)]">
        Elige tu favorito. El cambio se aplica y se guarda al seleccionarlo.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {APP_COLORS.map((color) => (
          <label key={color.id} className="cursor-pointer">
            <input
              type="radio"
              name={`${id}-color`}
              value={color.id}
              checked={selected === color.id}
              onChange={() => choose(color.id)}
              className="peer sr-only"
            />
            <span className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-3 text-xs text-[var(--secondary)] peer-checked:border-[var(--accent-text)] peer-checked:bg-[var(--accent-soft)] peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent-text)]">
              <span
                aria-hidden="true"
                data-color={color.id}
                className="color-swatch h-5 w-5 rounded-full"
              />
              {color.label}
            </span>
          </label>
        ))}
      </div>
      <p role="status" className="mt-2 text-xs text-[var(--muted)]">
        {message}
      </p>
    </fieldset>
  );
}
