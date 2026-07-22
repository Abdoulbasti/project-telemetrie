import bcrypt from "bcryptjs";
import { Router } from "express";
import { pool } from "../db";

export const authRouter = Router();

// Étape 1 du tunnel : login
authRouter.post("/api/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const { rows } = await pool.query(
    "SELECT id, email, name, password_hash FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Identifiants invalides" });
    return;
  }

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, name: user.name });
});

authRouter.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

authRouter.get("/api/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Non connecté" });
    return;
  }
  const { rows } = await pool.query(
    "SELECT id, email, name FROM users WHERE id = $1",
    [req.session.userId],
  );
  if (!rows[0]) {
    res.status(401).json({ error: "Non connecté" });
    return;
  }
  res.json(rows[0]);
});
