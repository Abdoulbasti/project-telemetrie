import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const app = express();
const port = Number(process.env.PORT ?? 8397);

app.use(express.static(path.join(root, "dist")));
app.use(express.static(path.join(root, "public")));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// Fallback SPA : toute route inconnue renvoie l'app React
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[web] E-Shop Télémétrie démarré sur http://localhost:${port}`);
});
