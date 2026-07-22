import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatPrice } from "../api";
import { Loader } from "../components/Loader";
import { useCart } from "../context/CartContext";
import type { Order } from "../types";

export function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart) {
    return (
      <div className="flex justify-center py-16">
        <Loader label="Chargement du panier…" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-1 text-4xl">🛒</p>
        <p className="mb-4 text-lg">Votre panier est vide</p>
        <Link to="/" className="btn-primary">
          Découvrir nos fleurs
        </Link>
      </div>
    );
  }

  // checkout_start : le panier est figé dans une commande "pending"
  async function handleCheckoutStart() {
    setStarting(true);
    setError(null);
    try {
      const order = await api<Order>("/api/checkout/start", {
        method: "POST",
        body: JSON.stringify({}),
      });
      navigate("/checkout", { state: { order } });
    } catch {
      setError(
        "Le service de commande est momentanément indisponible — veuillez réessayer.",
      );
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Mon panier</h1>

      <div className="card divide-y divide-neutral-200 dark:divide-neutral-800">
        {cart.items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-16 w-20 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link
                to={`/products/${item.product_id}`}
                className="font-medium hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatPrice(item.price_cents)} l&apos;unité
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700">
              <button
                type="button"
                className="px-2.5 py-1 font-bold hover:text-emerald-700 dark:hover:text-emerald-400"
                onClick={() => void updateItem(item.product_id, item.quantity - 1)}
                aria-label="Diminuer"
              >
                −
              </button>
              <span className="min-w-7 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                type="button"
                className="px-2.5 py-1 font-bold hover:text-emerald-700 dark:hover:text-emerald-400"
                onClick={() => void updateItem(item.product_id, item.quantity + 1)}
                aria-label="Augmenter"
              >
                +
              </button>
            </div>

            <span className="w-24 text-right font-semibold">
              {formatPrice(item.price_cents * item.quantity)}
            </span>
            <button
              type="button"
              onClick={() => void removeItem(item.product_id)}
              className="text-neutral-400 transition hover:text-red-600 dark:hover:text-red-400"
              aria-label={`Retirer ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card flex items-center justify-between p-4">
        <span className="text-lg font-medium">Total</span>
        <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
          {formatPrice(cart.total_cents)}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-3">
        <Link to="/" className="btn-secondary">
          Continuer mes achats
        </Link>
        <button
          type="button"
          onClick={() => void handleCheckoutStart()}
          disabled={starting}
          className="btn-primary"
        >
          {starting ? "Préparation…" : "Passer la commande"}
        </button>
      </div>
    </div>
  );
}
