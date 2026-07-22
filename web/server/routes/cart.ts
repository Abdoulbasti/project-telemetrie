import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware";

export const cartRouter = Router();
cartRouter.use("/api/cart", requireAuth);

async function getOrCreateCartId(userId: number): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [userId],
  );
  return rows[0].id;
}

async function readCart(userId: number) {
  const cartId = await getOrCreateCartId(userId);
  const { rows: items } = await pool.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.price_cents, p.image_url, p.stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id`,
    [cartId],
  );
  const total_cents = items.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0,
  );
  return { items, total_cents };
}

cartRouter.get("/api/cart", async (req, res) => {
  res.json(await readCart(req.session.userId!));
});

// Étape 3 du tunnel : add_to_cart
cartRouter.post("/api/cart/items", async (req, res) => {
  const userId = req.session.userId!;
  const productId = Number(req.body?.productId);
  const quantity = Number(req.body?.quantity ?? 1);
  if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ error: "Produit ou quantité invalide" });
    return;
  }

  const { rows: products } = await pool.query(
    "SELECT id FROM products WHERE id = $1",
    [productId],
  );
  if (!products[0]) {
    res.status(404).json({ error: "Produit introuvable" });
    return;
  }

  const cartId = await getOrCreateCartId(userId);
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [cartId, productId, quantity],
  );
  res.status(201).json(await readCart(userId));
});

cartRouter.patch("/api/cart/items/:productId", async (req, res) => {
  const userId = req.session.userId!;
  const productId = Number(req.params.productId);
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
    res.status(400).json({ error: "Produit ou quantité invalide" });
    return;
  }

  const cartId = await getOrCreateCartId(userId);
  if (quantity < 1) {
    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId],
    );
  } else {
    await pool.query(
      "UPDATE cart_items SET quantity = $3 WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId, quantity],
    );
  }
  res.json(await readCart(userId));
});

cartRouter.delete("/api/cart/items/:productId", async (req, res) => {
  const userId = req.session.userId!;
  const cartId = await getOrCreateCartId(userId);
  await pool.query(
    "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
    [cartId, Number(req.params.productId)],
  );
  res.json(await readCart(userId));
});
