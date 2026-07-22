import { Link } from "react-router-dom";
import { formatPrice } from "../api";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-1 p-4">
        <h3 className="font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(product.price_cents)}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {product.stock} en stock
          </span>
        </div>
      </div>
    </Link>
  );
}
