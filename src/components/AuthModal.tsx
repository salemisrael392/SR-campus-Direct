import React, { useEffect, useRef, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  email_verified: boolean;
  profile_picture_url: string | null;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

interface AuthModalProps {
  onClose: () => void;
  onAuthenticated: (token: string, user: AuthUser) => void;
}

type AuthMode = 'login' | 'register';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
).replace(/\/+$/, '');

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < (mode === 'register' ? 8 : 1)) {
      setError(
        mode === 'register'
          ? 'Your password must contain at least 8 characters.'
          : 'Please enter your password.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const payload =
        mode === 'login'
          ? { email: normalizedEmail, password }
          : { name: name.trim(), email: normalizedEmail, password };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | AuthResponse
        | { detail?: string }
        | null;

      if (!response.ok) {
        const detail =
          data && 'detail' in data && typeof data.detail === 'string'
            ? data.detail
            : 'We could not complete your request. Please try again.';
        throw new Error(detail);
      }

      if (!data || !('access_token' in data) || !data.user) {
        throw new Error('The server returned an unexpected response.');
      }

      onAuthenticated(data.access_token, data.user);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Unable to reach the server. Check that the Campus Companion API is running.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-900 via-blue-600 to-sky-400" />

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close sign-in window"
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
        >
          <span aria-hidden="true" className="text-2xl leading-none">×</span>
        </button>

        <div className="px-6 pb-7 pt-7 sm:px-8 sm:pb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[27px]"
              >
                school
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                SR University
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Campus Companion
              </p>
            </div>
          </div>

          <h2
            id="auth-modal-title"
            className="pr-8 text-2xl font-bold tracking-tight text-slate-900"
          >
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === 'login'
              ? 'Sign in to access your personal timetable and student features.'
              : 'Register with your university email to get started.'}
          </p>

          <div
            aria-label="Authentication option"
            className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              aria-pressed={mode === 'login'}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              aria-pressed={mode === 'register'}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create account
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="auth-name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                University email
              </label>
              <input
                ref={emailInputRef}
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@sru.edu.in"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                required
                minLength={mode === 'register' ? 8 : 1}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  mode === 'login'
                    ? 'Enter your password'
                    : 'At least 8 characters'
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Please wait…
                </>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Your account helps keep your personal timetable private.
          </p>
        </div>
      </section>
    </div>
  );
};
