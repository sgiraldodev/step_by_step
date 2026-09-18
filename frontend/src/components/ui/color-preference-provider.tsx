'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { APP_COLORS, validAppColor, type AppColor } from './app-colors';

type ColorPreference = {
  selected: AppColor;
  busy: boolean;
  message: string;
  choose: (color: AppColor) => Promise<void>;
};
const ColorPreferenceContext = createContext<ColorPreference | null>(null);
export const useColorPreference = () => useContext(ColorPreferenceContext);

export default function ColorPreferenceProvider({
  initialColor,
  onSave,
  children,
}: {
  initialColor?: AppColor;
  onSave: (color: AppColor) => Promise<unknown>;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(validAppColor(initialColor));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const mounted = useRef(false);
  const saving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      document.documentElement.dataset.color = 'blue';
    };
  }, []);
  useEffect(() => {
    if (saving.current) return;
    const color = validAppColor(initialColor);
    setSelected(color);
    document.documentElement.dataset.color = color;
  }, [initialColor]);

  async function choose(color: AppColor) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage('Guardando tu color…');
    const previous = selected;
    setSelected(color);
    document.documentElement.dataset.color = color;
    try {
      await onSave(color);
      if (mounted.current)
        setMessage(
          `Color ${APP_COLORS.find((option) => option.id === color)?.label} guardado en tu cuenta.`,
        );
    } catch (error) {
      if (mounted.current) {
        setSelected(previous);
        document.documentElement.dataset.color = previous;
        setMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo guardar tu color. Inténtalo nuevamente.',
        );
      }
    } finally {
      saving.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <ColorPreferenceContext.Provider value={{ selected, busy, message, choose }}>
      {children}
    </ColorPreferenceContext.Provider>
  );
}
