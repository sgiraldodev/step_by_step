'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/modules/auth/auth';

export default function EmailCodeForm({
  purpose,
  initialEmail,
  onVerified,
}: {
  purpose: 'registration' | 'recovery';
  initialEmail: string;
  onVerified: (email: string, token: string) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (expiresAt === null) return;
    const update = () => setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  async function send() {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await (purpose === 'registration'
        ? authApi.sendRegistrationCode(email.trim())
        : authApi.sendCode(email.trim()));
      const deadline = Date.parse(result.expires_at);
      setExpiresAt(deadline);
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      setCode('');
      setMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el correo.');
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (expiresAt === null) return send();
    if (remaining <= 0) {
      setError('El código venció. Solicita uno nuevo.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await (purpose === 'registration'
        ? authApi.verifyRegistrationCode(email.trim(), code)
        : authApi.verifyCode(email.trim(), code));
      onVerified(email.trim(), result.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo validar el código.');
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    'mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-3 text-sm';
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-xs font-semibold">
        Correo electrónico
        <input
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          readOnly={expiresAt !== null}
          disabled={busy}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </label>
      {expiresAt !== null && (
        <>
          <label className="block text-xs font-semibold">
            Código de 4 dígitos
            <input
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              required
              value={code}
              disabled={busy || remaining <= 0}
              onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ''))}
              className={inputClass}
            />
          </label>
          <p className="text-sm text-[var(--muted)]">
            {remaining > 0
              ? `Vence en ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
              : 'El código venció. Solicita uno nuevo.'}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-[var(--accent-text)]">
            <button type="button" disabled={busy} onClick={send}>
              Reenviar código
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setExpiresAt(null);
                setCode('');
                setError('');
                setMessage('');
              }}
            >
              Cambiar correo
            </button>
          </div>
        </>
      )}
      {message && (
        <p role="status" className="text-sm text-[var(--accent-text)]">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--error-text)]">
          {error}
        </p>
      )}
      <Button
        type="submit"
        loading={busy}
        disabled={expiresAt !== null && remaining <= 0}
        className="w-full text-sm"
      >
        {busy ? 'Un momento…' : expiresAt === null ? 'Enviar código al correo' : 'Validar código'}
      </Button>
    </form>
  );
}
