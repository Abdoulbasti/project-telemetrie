import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, formatPrice } from "../api";
import { Loader } from "../components/Loader";
import { useCart } from "../context/CartContext";
import type { Order } from "../types";

// Gateway de paiement fictive : volontairement absente de `window` pour
// provoquer un TypeError non catché 1 fois sur 3 (remontée GlitchTip à venir)
interface PaymentGateway {
  confirm(orderId: number): void;
}

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const order = (location.state as { order?: Order } | null)?.order;

  const [shippingName, setShippingName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Arrivée directe sur /checkout sans commande initiée : retour au panier
  if (!order) return <Navigate to="/cart" replace />;

  async function handlePay() {
    if (!order) return;
    setPaying(true);
    setError(null);

    // Simulation du traitement bancaire : loader pendant quelques secondes
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Bouton volontairement défaillant : 1 paiement sur 3 échoue avec un
    // TypeError levé dans une promesse jamais catchée (unhandledrejection),
    // que GlitchTip capturera lors de la phase suivante du projet.
    if (Math.random() < 1 / 3) {
      Promise.resolve().then(() => {
        const gateway = (window as Window & { fleuriePay?: PaymentGateway })
          .fleuriePay;
        gateway!.confirm(order.id); // TypeError : fleuriePay est undefined
      });
      setPaying(false);
      setError(
        "Le paiement a été refusé par la banque. Aucune somme n'a été débitée — veuillez réessayer.",
      );
      return;
    }

    try {
      const paid = await api<Order>("/api/checkout/pay", {
        method: "POST",
        body: JSON.stringify({
          orderId: order.id,
          shippingName,
          shippingAddress: `${address}, ${postalCode} ${city}`,
        }),
      });
      await refresh(); // le panier a été vidé côté serveur
      navigate(`/confirmation/${paid.id}`, { replace: true });
    } catch {
      setPaying(false);
      setError("Une erreur est survenue lors de la validation, réessayez");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Livraison &amp; paiement</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handlePay();
        }}
        className="space-y-6"
      >
        <fieldset className="card space-y-4 p-6" disabled={paying}>
          <legend className="sr-only">Adresse de livraison</legend>
          <h2 className="font-semibold text-emerald-700 dark:text-emerald-400">
            1. Adresse de livraison
          </h2>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nom complet
            </label>
            <input
              id="name"
              required
              className="input"
              autoComplete="name"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              placeholder="Marie Dupont"
            />
          </div>
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              Adresse
            </label>
            <input
              id="address"
              required
              className="input"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 rue des Lilas"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postal" className="mb-1 block text-sm font-medium">
                Code postal
              </label>
              <input
                id="postal"
                required
                className="input"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[0-9]{5}"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="75011"
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium">
                Ville
              </label>
              <input
                id="city"
                required
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-6" disabled={paying}>
          <legend className="sr-only">Paiement</legend>
          <h2 className="font-semibold text-emerald-700 dark:text-emerald-400">
            2. Paiement (simulation)
          </h2>
          <div>
            <label htmlFor="card" className="mb-1 block text-sm font-medium">
              Numéro de carte
            </label>
            <input
              id="card"
              required
              className="input font-mono"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="mb-1 block text-sm font-medium">
                Expiration
              </label>
              <input
                id="expiry"
                required
                className="input font-mono"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="12/28"
              />
            </div>
            <div>
              <label htmlFor="cvc" className="mb-1 block text-sm font-medium">
                CVC
              </label>
              <input
                id="cvc"
                required
                className="input font-mono"
                inputMode="numeric"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </div>
        </fieldset>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {paying ? (
          <div className="card flex flex-col items-center gap-2 p-6">
            <Loader label="Paiement en cours, ne fermez pas la page…" />
          </div>
        ) : (
          <button type="submit" className="btn-primary w-full py-3 text-base">
            Payer {formatPrice(order.total_cents)}
          </button>
        )}
      </form>
    </div>
  );
}
