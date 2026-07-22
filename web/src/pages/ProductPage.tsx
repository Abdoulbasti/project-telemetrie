import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatPrice } from "../api";
import { Loader } from "../components/Loader";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

export function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg">Cette fleur n&apos;existe pas 🥀</p>
        <Link to="/" className="btn-primary">
          Retour au catalogue
        </Link>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex justify-center py-16">
        <Loader label="Chargement de la fiche produit…" />
      </div>
    );
  }

  async function handleAdd() {
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <img
        src={product.image_url}
        alt={product.name}
        className="card h-80 w-full object-cover md:h-[26rem]"
      />

      <div className="space-y-5">
        <nav className="text-sm text-neutral-500 dark:text-neutral-400">
          <Link to="/" className="hover:text-emerald-700 dark:hover:text-emerald-400">
            Catalogue
          </Link>{" "}
          / {product.name}
        </nav>

        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
          {formatPrice(product.price_cents)}
        </p>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">
          {product.description}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {product.stock} exemplaires en stock
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700">
            <button
              type="button"
              className="px-3 py-2 font-bold hover:text-emerald-700 dark:hover:text-emerald-400"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="min-w-8 text-center font-medium">{quantity}</span>
            <button
              type="button"
              className="px-3 py-2 font-bold hover:text-emerald-700 dark:hover:text-emerald-400"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={adding}
            className="btn-primary flex-1"
          >
            {adding ? "Ajout…" : "Ajouter au panier"}
          </button>
        </div>

        {added && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span>✓ Ajouté au panier</span>
            <Link to="/cart" className="font-semibold underline">
              Voir le panier
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
