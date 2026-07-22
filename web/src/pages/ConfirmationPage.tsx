import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatPrice } from "../api";
import { Loader } from "../components/Loader";
import type { OrderDetail } from "../types";

export function ConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<OrderDetail>(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch(() => setError("Commande introuvable"));
  }, [orderId]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4">{error}</p>
        <Link to="/" className="btn-primary">
          Retour au catalogue
        </Link>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex justify-center py-16">
        <Loader label="Chargement de la confirmation…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="space-y-2">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-950">
          ✅
        </span>
        <h1 className="text-2xl font-bold">Merci pour votre commande !</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Le paiement de la commande{" "}
          <span className="font-mono font-semibold">#{order.id}</span> a bien été
          accepté.
        </p>
      </div>

      <div className="card divide-y divide-neutral-200 text-left dark:divide-neutral-800">
        {order.items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 p-4">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-14 w-18 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.quantity} × {formatPrice(item.unit_price_cents)}
              </p>
            </div>
            <span className="font-semibold">
              {formatPrice(item.quantity * item.unit_price_cents)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="font-medium">Total payé</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(order.total_cents)}
          </span>
        </div>
      </div>

      {order.shipping_address && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Livraison : {order.shipping_name} — {order.shipping_address}
        </p>
      )}

      <Link to="/" className="btn-primary">
        Retour au catalogue
      </Link>
    </div>
  );
}
