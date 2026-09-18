import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Step by step · Tu espacio de enfoque',
  description: 'Organiza tus tareas y trabaja con intención, un Pomodoro a la vez.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('step-theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
