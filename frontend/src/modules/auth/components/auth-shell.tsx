'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, LockKeyhole, Timer } from 'lucide-react';
import { authApi, type User } from '@/modules/auth/auth';
import Pomodoro from '@/modules/focus/components/pomodoro';
import ThemeToggle from '@/components/ui/theme-toggle';
import LandingPage from './landing-page';
import ColorPreferenceProvider from '@/components/ui/color-preference-provider';

type Mode = 'login' | 'register' | 'recover' | 'reset';
export default function AuthShell({ showLanding = false }: { showLanding?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [recovery, setRecovery] = useState('');
  const [newCode, setNewCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [claim, setClaim] = useState(false);
  const [status, setStatus] = useState({ setup_required: false, email_recovery: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (window.location.hash === '#registro') setMode('register');
    const setup = fragment.get('setup'),
      token = fragment.get('reset');
    if (setup || token) window.history.replaceState(null, '', window.location.pathname);
    if (setup) {
      setSetupCode(setup);
      setClaim(true);
      setMode('register');
    }
    if (token) {
      setResetToken(token);
      setMode('reset');
    }
    authApi
      .status()
      .then(setStatus)
      .catch(() => {});
    if (token || setup) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!user) return;
    let current = true;
    const check = () =>
      authApi
        .me()
        .then((value) => {
          if (current)
            setUser((previous) =>
              previous?.id === value.id && previous?.app_color === value.app_color
                ? previous
                : value,
            );
        })
        .catch(() => {
          if (current) setUser(null);
        });
    const expired = () => setUser(null);
    const sync = (event: StorageEvent) => {
      if (event.key === 'step-current-user') void check();
    };
    const interval = setInterval(check, 60000);
    window.addEventListener('focus', check);
    window.addEventListener('storage', sync);
    window.addEventListener('step-session-expired', expired);
    return () => {
      current = false;
      clearInterval(interval);
      window.removeEventListener('focus', check);
      window.removeEventListener('storage', sync);
      window.removeEventListener('step-session-expired', expired);
    };
  }, [user]);
  function announce(value: string) {
    try {
      localStorage.setItem('step-current-user', value);
    } catch {}
  }
  function change(value: Mode) {
    setMode(value);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmation('');
    setRecovery('');
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setMessage('');
    if (mode !== 'login' && password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const value = await authApi.login(email, password);
        setUser(value);
        announce(value.id);
        setPassword('');
      } else if (mode === 'register') {
        const value = await authApi.register(name, email, password, claim ? setupCode : undefined);
        setUser(value.user);
        setNewCode(value.recovery_code);
        announce(value.user.id);
        setPassword('');
      } else {
        const value = await authApi.reset({
          password,
          ...(resetToken ? { token: resetToken } : { email, recovery_code: recovery }),
        });
        setNewCode(value.recovery_code);
        setUser(null);
        setMessage(value.message);
        setResetToken('');
        setPassword('');
        announce('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible continuar.');
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await authApi.logout();
    setUser(null);
    setPassword('');
    change('login');
    announce('');
  }
  const inputClass =
    'mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-3 text-sm';
  if (!ready)
    return (
      <main className="grid min-h-screen place-items-center">
        <p role="status" className="text-sm text-[var(--muted)]">
          Abriendo tu espacio…
        </p>
      </main>
    );
  if (user && !newCode)
    return (
      <ColorPreferenceProvider
        key={user.id}
        initialColor={user.app_color}
        onSave={async (color) => {
          const updated = await authApi.saveColor(color);
          setUser((previous) => (previous?.id === updated.id ? updated : previous));
        }}
      >
        <Pomodoro user={user} onLogout={logout} />
      </ColorPreferenceProvider>
    );
  if (showLanding && !newCode && !claim && (mode === 'login' || mode === 'register'))
    return (
      <main>
        <LandingPage />
      </main>
    );
  return (
    <main>
      <section
        id="acceso"
        className="flex min-h-screen scroll-mt-6 flex-col items-center justify-center px-5 py-10"
        aria-label="Acceso a tu espacio"
      >
        <div className="mb-6 flex w-full max-w-md items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
            <Timer className="text-[var(--accent-text)]" />
            Step by step
          </Link>
          <ThemeToggle />
        </div>
        <section className="panel w-full max-w-md p-7">
          {newCode ? (
            <>
              <KeyRound size={30} className="mb-4 text-[var(--accent-text)]" />
              <h1 className="text-2xl font-semibold">Guarda tu código de recuperación</h1>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Es personal y se muestra una sola vez. Permite restablecer tu contraseña si la
                olvidas. Guárdalo en un lugar seguro y no lo compartas.
              </p>
              <code className="mt-5 block select-all break-all rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-sm">
                {newCode}
              </code>
              <button
                type="button"
                className="mt-4 text-sm text-[var(--accent-text)] underline"
                onClick={() => {
                  const blob = new Blob(
                    [
                      `Step by step · Código personal de recuperación\nCorreo: ${email}\n${newCode}\n`,
                    ],
                    { type: 'text/plain' },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'step-by-step-recuperacion.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Descargar código
              </button>
              {message && (
                <p role="status" className="mt-4 text-sm">
                  {message}
                </p>
              )}
              <Button
                type="button"
                className="mt-6 w-full text-sm"
                onClick={() => {
                  setNewCode('');
                  if (!user) change('login');
                }}
              >
                Ya lo guardé · {user ? 'Entrar a mi espacio' : 'Iniciar sesión'}
              </Button>
            </>
          ) : (
            <>
              <LockKeyhole size={28} className="mb-4 text-[var(--accent-text)]" />
              <h1 className="text-2xl font-semibold">
                {mode === 'login'
                  ? 'Bienvenido a tu espacio'
                  : mode === 'register'
                    ? 'Crea tu cuenta'
                    : 'Recupera tu acceso'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {mode === 'login'
                  ? 'Tus tareas, rutinas y tiempo, en un espacio privado.'
                  : mode === 'register'
                    ? 'Cada cuenta tiene sus propias tareas, etiquetas y estadísticas.'
                    : resetToken
                      ? 'Elige una nueva contraseña. El enlace solo puede usarse una vez.'
                      : 'Usa el código personal que recibiste al crear tu cuenta.'}
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === 'register' && (
                  <label className="block text-xs font-semibold">
                    Tu nombre
                    <input
                      aria-label="Nombre"
                      autoComplete="name"
                      required
                      minLength={1}
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                    <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">
                      Como quieres que te demos la bienvenida. Ejemplo: Santiago Giraldo.
                    </span>
                  </label>
                )}
                {!resetToken && (
                  <label className="block text-xs font-semibold">
                    Correo electrónico
                    <input
                      aria-label="Correo electrónico"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                )}
                {mode === 'recover' && (
                  <label className="block text-xs font-semibold">
                    Código personal de recuperación
                    <input
                      aria-label="Código de recuperación"
                      required
                      value={recovery}
                      onChange={(e) => setRecovery(e.target.value)}
                      className={inputClass}
                      maxLength={200}
                    />
                  </label>
                )}
                <label className="block text-xs font-semibold">
                  {mode === 'recover' || mode === 'reset' ? 'Nueva contraseña' : 'Contraseña'}
                  <input
                    aria-label="Contraseña"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={mode === 'login' ? 1 : 10}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  {mode !== 'login' && (
                    <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">
                      Mínimo 10 caracteres.
                    </span>
                  )}
                </label>
                {mode !== 'login' && (
                  <label className="block text-xs font-semibold">
                    Repite la contraseña
                    <input
                      aria-label="Repetir contraseña"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={10}
                      maxLength={128}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                )}
                {mode === 'register' && status.setup_required && (
                  <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4">
                    <label className="flex items-start gap-2 text-xs leading-5">
                      <input
                        type="checkbox"
                        checked={claim}
                        onChange={(e) => setClaim(e.target.checked)}
                        className="mt-1 accent-[var(--accent)]"
                      />
                      Conservar las tareas existentes de esta instalación
                    </label>
                    {claim && (
                      <label className="mt-3 block text-xs">
                        Código de instalación
                        <input
                          aria-label="Código de instalación"
                          type="password"
                          required
                          value={setupCode}
                          onChange={(e) => setSetupCode(e.target.value)}
                          className={inputClass}
                        />
                      </label>
                    )}
                  </div>
                )}
                {error && (
                  <p role="alert" className="text-sm text-[var(--error-text)]">
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="text-sm text-[var(--accent-text)]">
                    {message}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="w-full text-sm">
                  {busy
                    ? 'Un momento…'
                    : mode === 'login'
                      ? 'Iniciar sesión'
                      : mode === 'register'
                        ? 'Crear cuenta'
                        : 'Restablecer contraseña'}
                </Button>
              </form>
              <div className="mt-6 flex flex-wrap justify-between gap-3 text-xs text-[var(--accent-text)]">
                {mode === 'login' ? (
                  <>
                    <button onClick={() => change('register')}>Crear una cuenta</button>
                    <button onClick={() => change('recover')}>Olvidé mi contraseña</button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setResetToken('');
                      change('login');
                    }}
                  >
                    Volver al inicio de sesión
                  </button>
                )}
              </div>
              {mode === 'recover' && status.email_recovery && (
                <button
                  disabled={busy || !email.trim()}
                  type="button"
                  className="mt-4 text-xs text-[var(--accent-text)] underline"
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      setMessage((await authApi.forgot(email)).message);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'No se pudo enviar el correo.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Enviarme un enlace por correo
                </button>
              )}
            </>
          )}
        </section>
        <p className="mt-6 text-xs text-[var(--muted)]">Un paso a la vez. Un espacio para ti.</p>
      </section>
    </main>
  );
}
