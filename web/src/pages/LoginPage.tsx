import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { email: "marie@fleurs.shop", name: "Marie Dupont" },
  { email: "thomas@fleurs.shop", name: "Thomas Martin" },
  { email: "emma@fleurs.shop", name: "Emma Bernard" },
];
const DEMO_PASSWORD = "Fleurs2026!";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Identifiants invalides"
          : "Connexion impossible, réessayez",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            🌿 Fleurie
          </h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            Connectez-vous pour découvrir nos fleurs
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          className="card space-y-4 p-6"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie@fleurs.shop"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="card p-4">
          <p className="mb-2 text-sm font-medium">Comptes de démonstration</p>
          <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
            Mot de passe commun : <code className="font-mono">{DEMO_PASSWORD}</code> —
            cliquez pour pré-remplir.
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                {account.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
