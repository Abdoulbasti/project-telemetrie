import { useEffect, useState } from "react";
import { api } from "../api";
import { Loader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Product[]>("/api/products")
      .then(setProducts)
      .catch(() => setError("Impossible de charger le catalogue"));
  }, []);

  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;
  if (!products) {
    return (
      <div className="flex justify-center py-16">
        <Loader label="Chargement du catalogue…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nos fleurs</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {products.length} variétés fraîchement cueillies
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
