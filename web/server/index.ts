import path from "node:path";
import { fileURLToPath } from "node:url";
import connectPgSimple from "connect-pg-simple";
import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import { initDb, pool } from "./db";
import { authRouter } from "./routes/auth";
import { cartRouter } from "./routes/cart";
import { checkoutRouter } from "./routes/checkout";
import { productsRouter } from "./routes/products";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const app = express();
const port = Number(process.env.PORT ?? 8397);

app.use(express.json());

const PgSessionStore = connectPgSimple(session);
app.use(
  session({
    store: new PgSessionStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET ?? "dev-secret-a-remplacer",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(authRouter);
app.use(productsRouter);
app.use(cartRouter);
app.use(checkoutRouter);

app.use(express.static(path.join(root, "dist")));
app.use(express.static(path.join(root, "public")));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// Fallback SPA : toute route non-API inconnue renvoie l'app React
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

// Les erreurs serveur (dont l'échec simulé de checkout_start) sont logguées
// — GlitchTip les capturera à la phase suivante — et renvoyées en JSON
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du service de commande" });
};
app.use(errorHandler);

await initDb();
app.listen(port, "0.0.0.0", () => {
  console.log(`[web] E-Shop Télémétrie démarré sur http://localhost:${port}`);
});
