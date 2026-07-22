import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api";
import type { Cart } from "../types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  count: number;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  const refresh = useCallback(async () => {
    setCart(await api<Cart>("/api/cart"));
  }, []);

  useEffect(() => {
    if (user) {
      refresh().catch(() => setCart(null));
    } else {
      setCart(null);
    }
  }, [user, refresh]);

  async function addItem(productId: number, quantity = 1) {
    setCart(
      await api<Cart>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      }),
    );
  }

  async function updateItem(productId: number, quantity: number) {
    setCart(
      await api<Cart>(`/api/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),
    );
  }

  async function removeItem(productId: number) {
    setCart(
      await api<Cart>(`/api/cart/items/${productId}`, { method: "DELETE" }),
    );
  }

  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, count, refresh, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé sous CartProvider");
  return ctx;
}
