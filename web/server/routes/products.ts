import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware";

export const productsRouter = Router();

productsRouter.get("/api/products", requireAuth, async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, description, price_cents, image_url, stock FROM products ORDER BY id",
  );
  res.json(rows);
});

// Étape 2 du tunnel : view_product
productsRouter.get("/api/products/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identifiant invalide" });
    return;
  }
  const { rows } = await pool.query(
    "SELECT id, name, description, price_cents, image_url, stock FROM products WHERE id = $1",
    [id],
  );
  if (!rows[0]) {
    res.status(404).json({ error: "Produit introuvable" });
    return;
  }
  res.json(rows[0]);
});
