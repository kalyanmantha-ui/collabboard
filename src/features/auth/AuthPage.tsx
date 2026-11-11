import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Input } from "paper-ui";
import { useAuth } from "../../lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../api";
import { AppButton } from "../../components/AppButton";
import styles from "./AuthPage.module.css";

const validEmail = (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? undefined : "Enter a valid email address.");
const validPassword = (v: string) => (v.length >= 8 ? undefined : "Use at least 8 characters.");

export function AuthPage() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (ready && user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? "/boards"} replace />;
  return (
    <main className={styles.page}>
      <div className={styles.logo}>
        <span className={styles.mark} aria-hidden="true" />
        CollabBoard
      </div>
      <div className={styles.cards}>
        <SignInForm />
        <SignUpForm />
      </div>
      <p className={styles.demo}>
        <bdi>Demo only, no backend. Sign in with <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>, or create any account.</bdi>
      </p>
    </main>
  );
}

function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <h1>Sign in</h1>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} validation={validEmail} autoComplete="email" />
      <div className={`field${error ? " has-error" : ""}`}>
        <Input label="Password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} autoComplete="current-password" />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <AppButton variant="primary" type="submit" block isLoading={busy}>
        Sign in
      </AppButton>
      <button type="button" className={styles.link} onClick={() => setError("Password reset isn't available in this demo.")}>
        Forgot your password
      </button>
    </form>
  );
}

function SignUpForm() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || validEmail(email) || validPassword(password)) {
      setError(!name.trim() ? "Enter your name." : validEmail(email) ?? validPassword(password) ?? null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signUp(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <h1>Create your account</h1>
      <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} autoComplete="name" placeholder="Kalyan Mantha" />
      <Input label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} validation={validEmail} autoComplete="email" placeholder="name@company.com" />
      <div className="field">
        <Input label="Password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} validation={validPassword} autoComplete="new-password" />
        <p className="field-hint"><bdi>Use at least 8 characters.</bdi></p>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <AppButton type="submit" block isLoading={busy}>
        Create account
      </AppButton>
    </form>
  );
}
