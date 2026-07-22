import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            🌿 Fleurie
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
              end
            >
              Catalogue
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `relative rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
            >
              Panier 🛒
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-xs font-bold text-white dark:bg-emerald-500 dark:text-neutral-950">
                  {count}
                </span>
              )}
            </NavLink>

            <button
              type="button"
              onClick={toggleDark}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm transition hover:border-emerald-700 dark:border-neutral-700 dark:hover:border-emerald-400"
              title={dark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <span className="hidden text-sm text-neutral-500 sm:inline dark:text-neutral-400">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        🌿 Fleurie — projet télémétrie ESGI (tunnel d&apos;achat de démonstration)
      </footer>
    </div>
  );
}
