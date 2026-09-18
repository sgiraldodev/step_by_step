export const APP_COLORS = [
  { id: 'blue', label: 'Azul' },
  { id: 'green', label: 'Verde' },
  { id: 'teal', label: 'Turquesa' },
  { id: 'cyan', label: 'Celeste' },
  { id: 'orange', label: 'Naranja' },
  { id: 'pink', label: 'Rosado' },
  { id: 'lilac', label: 'Lila' },
  { id: 'violet', label: 'Violeta' },
  { id: 'red', label: 'Rojo' },
  { id: 'slate', label: 'Gris' },
] as const;

export type AppColor = (typeof APP_COLORS)[number]['id'];
export const APP_COLOR_STORAGE_KEY = 'step-color';

export function validAppColor(value: string | undefined | null): AppColor {
  return APP_COLORS.find((color) => color.id === value)?.id ?? 'blue';
}

export const APP_COLOR_INIT_SCRIPT = `try{const colors=${JSON.stringify(APP_COLORS.map((color) => color.id))};const c=localStorage.getItem('${APP_COLOR_STORAGE_KEY}');document.documentElement.dataset.color=colors.includes(c)?c:'blue'}catch{document.documentElement.dataset.color='blue'}`;
