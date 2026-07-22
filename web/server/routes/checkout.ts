import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware";

export const checkoutRouter = Router();
checkoutRouter.use(["/api/checkout", "/api/orders"], requireAuth);

// Étape 4 du tunnel : checkout_start — fige le panier dans une commande "pending"
checkoutRouter.post("/api/checkout/start", async (req, res) => {
  // Échec volontaire (1 fois sur 2) : erreur backend pour la future
  // remontée d'alertes GlitchTip (SDK Node). Aucune commande n'est créée.
  if (Math.random() < 0.5) {
    throw new Error("Échec simulé du service de commande (checkout_start)");
  }

  const userId = req.session.userId!;
  const { shippingName = "", shippingAddress = "" } = req.body ?? {};

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: items } = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price_cents
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE c.user_id = $1`,
      [userId],
    );
    if (items.length === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "Le panier est vide" });
      return;
    }

    const total = items.reduce(
      (sum, item) => sum + item.price_cents * item.quantity,
      0,
    );
    const { rows: orders } = await client.query(
      `INSERT INTO orders (user_id, status, total_cents, shipping_name, shipping_address)
       VALUES ($1, 'pending', $2, $3, $4)
       RETURNING id, status, total_cents, created_at`,
      [userId, total, shippingName, shippingAddress],
    );
    const order = orders[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price_cents],
      );
    }
    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// Étape 5 du tunnel : checkout_success — paiement validé, panier vidé
checkoutRouter.post("/api/checkout/pay", async (req, res) => {
  const userId = req.session.userId!;
  const orderId = Number(req.body?.orderId);
  const { shippingName, shippingAddress } = req.body ?? {};

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: orders } = await client.query(
      `SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [orderId, userId],
    );
    if (!orders[0]) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Commande introuvable" });
      return;
    }
    if (orders[0].status !== "pending") {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "Commande déjà payée" });
      return;
    }

    const { rows: updated } = await client.query(
      `UPDATE orders
       SET status = 'paid', paid_at = now(),
           shipping_name = COALESCE($3, shipping_name),
           shipping_address = COALESCE($4, shipping_address)
       WHERE id = $1 AND user_id = $2
       RETURNING id, status, total_cents, shipping_name, shipping_address, paid_at`,
      [orderId, userId, shippingName ?? null, shippingAddress ?? null],
    );
    await client.query(
      `DELETE FROM cart_items ci USING carts c
       WHERE ci.cart_id = c.id AND c.user_id = $1`,
      [userId],
    );
    await client.query("COMMIT");
    res.json(updated[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// Récapitulatif affiché sur la page de confirmation
checkoutRouter.get("/api/orders/:id", async (req, res) => {
  const userId = req.session.userId!;
  const orderId = Number(req.params.id);
  const { rows: orders } = await pool.query(
    `SELECT id, status, total_cents, shipping_name, shipping_address, created_at, paid_at
     FROM orders WHERE id = $1 AND user_id = $2`,
    [orderId, userId],
  );
  if (!orders[0]) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }
  const { rows: items } = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price_cents, p.name, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId],
  );
  res.json({ ...orders[0], items });
});
