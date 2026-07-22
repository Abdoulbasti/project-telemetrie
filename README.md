# Projet Télémétrie — Tunnel d'achat e-commerce

Infrastructure Docker complète pour la télémétrie d'un site e-commerce : application web React, suivi des erreurs avec **GlitchTip** et analytics avec **Umami**.

## Architecture

```
                        ┌───────────────────────────────┐
   Navigateur ────────► │  web (React + Express + TS)   │  :8397
                        │  🌿 Fleurie (tunnel d'achat)  │
                        │  └─ webapp-postgres 16.8      │   (réseau webapp-net)
                        └───────────────────────────────┘
                        ┌───────────────────────────────┐
   Erreurs (SDK) ─────► │  GlitchTip                    │  :8398
                        │  ├─ glitchtip-web             │
                        │  ├─ glitchtip-worker (Celery) │──► glitchtip-redis
                        │  ├─ glitchtip-migrate         │
                        │  └─ glitchtip-postgres 16.8   │   (réseau glitchtip-net)
                        └───────────────────────────────┘
                        ┌───────────────────────────────┐
   Analytics ─────────► │  Umami                        │  :8399
                        │  └─ umami-postgres 16.8       │   (réseau umami-net)
                        └───────────────────────────────┘
```

| Service | URL | Rôle |
|---|---|---|
| Application web | http://localhost:8397 | Boutique de fleurs 🌿 Fleurie (React + Express + TypeScript, bundlé par esbuild, PostgreSQL dédié) |
| GlitchTip | http://localhost:8398 | Suivi des erreurs (PostgreSQL dédié + Redis pour les tâches de fond) |
| Umami | http://localhost:8399 | Analytics (PostgreSQL dédié) |

Chaque pôle est isolé sur son propre réseau Docker ; **les bases de données ne sont jamais exposées sur l'hôte**, seuls les ports 8397/8398/8399 le sont.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker ≥ 24 avec Compose v2)

## Lancement en une commande

```bash
# 1. Créer le fichier d'environnement
cp .env.example .env

# 2. Remplacer chaque valeur `change-me` du .env par un secret :
openssl rand -hex 32

# 3. Démarrer toute la stack
docker compose up -d
```

Le premier lancement prend quelques minutes (téléchargement des images, build de l'app web, migrations GlitchTip). Vérifier l'état :

```bash
docker compose ps
```

Tous les services doivent être `running` (`healthy` pour les bases) — sauf `glitchtip-migrate` qui s'arrête normalement en `Exited (0)` une fois les migrations appliquées.

## Premiers pas

- **GlitchTip** (http://localhost:8398) : créer un compte via « Register » (l'inscription ouverte est activée pour le premier compte), puis créer une organisation et un projet.
- **Umami** (http://localhost:8399) : se connecter avec `admin` / `umami`, **changer immédiatement le mot de passe**, puis ajouter le site à suivre.
- **Application web** (http://localhost:8397) : boutique de fleurs avec tunnel d'achat complet — voir ci-dessous.

## 🌿 Fleurie — le tunnel d'achat

### Comptes de démonstration

Les utilisateurs sont pré-inscrits (seed automatique au premier démarrage). Mot de passe commun : **`Fleurs2026!`**

| Email | Nom |
|---|---|
| `marie@fleurs.shop` | Marie Dupont |
| `thomas@fleurs.shop` | Thomas Martin |
| `emma@fleurs.shop` | Emma Bernard |

### Étapes du tunnel

| Étape | Parcours dans l'app | API |
|---|---|---|
| `login` | Connexion avec un compte démo (session Express stockée en base) | `POST /api/login` |
| `view_product` | Clic sur une des 15 fleurs du catalogue → fiche produit | `GET /api/products/:id` |
| `add_to_cart` | « Ajouter au panier » depuis la fiche | `POST /api/cart/items` |
| `checkout_start` | « Passer la commande » depuis le panier → formulaire livraison/paiement (commande `pending` créée) | `POST /api/checkout/start` |
| `checkout_success` | « Payer » → loader ~2,5 s → page de confirmation (commande `paid`, panier vidé) | `POST /api/checkout/pay` |

Le catalogue de 15 fleurs est généré au premier démarrage avec **@faker-js/faker** (graine fixe : catalogue reproductible). Chaque variété affiche une vraie photo d'elle-même via LoremFlickr (mot-clé anglais par fleur, photo figée par un `lock` généré par faker).

### ⚠️ Pannes volontaires pour la télémétrie

Deux pannes sont simulées exprès afin de valider la remontée d'alertes dans GlitchTip (phase suivante) :

| Étape | Fréquence | Type d'erreur | Où l'observer |
|---|---|---|---|
| « Passer la commande » (`checkout_start`) | **1 fois sur 2** | Erreur **serveur** : exception Express → HTTP 500, aucune commande créée | `docker compose logs web` (stack « Échec simulé du service de commande ») |
| « Payer » (`checkout_success`) | **1 fois sur 3** | Erreur **navigateur** : `TypeError` dans une promesse non catchée (`unhandledrejection`) | Console du navigateur |

Dans les deux cas, l'interface affiche un message d'erreur et l'utilisateur peut simplement réessayer — aucune donnée n'est perdue (la commande reste `pending` côté paiement).

### Base de données du tunnel (webapp-postgres)

`users` → `carts` → `cart_items` → `products`, et `orders` → `order_items` (prix figés au checkout). Les sessions Express sont également persistées en base (table `session`). Interface : blanc/noir/vert, responsive, dark mode (toggle 🌙 dans le header, persisté).

## Structure du projet

```
├── compose.yml         # Orchestration des 9 conteneurs (3 pôles)
├── .env.example        # Modèle des variables d'environnement (secrets)
├── web/                # Application React + Express + TypeScript
│   ├── Dockerfile      #   multi-stage : target `dev` (watch) et `prod`
│   ├── build.mjs       #   bundling du client React avec esbuild
│   ├── server/         #   serveur Express : sessions, API du tunnel, schema.sql, seed
│   └── src/            #   React : pages du tunnel, contexts, Tailwind (styles.css)
├── glitchtip/          # (phase suivante) config et scripts GlitchTip
└── umami/              # (phase suivante) config et scripts Umami
```

## Persistance des données

Les données survivent aux redémarrages grâce aux volumes nommés :

| Volume | Contenu |
|---|---|
| `webapp-pg-data` | Base PostgreSQL de la boutique (utilisateurs, produits, paniers, commandes, sessions) |
| `glitchtip-pg-data` | Base PostgreSQL de GlitchTip (comptes, projets, erreurs) |
| `glitchtip-redis-data` | File des tâches de fond Redis |
| `glitchtip-uploads` | Fichiers uploadés dans GlitchTip |
| `umami-pg-data` | Base PostgreSQL d'Umami (sites, métriques) |

`docker compose down` conserve les volumes ; seul `docker compose down -v` les supprime définitivement.

## Commandes utiles

```bash
docker compose up -d            # démarrer la stack
docker compose ps               # état des services
docker compose logs -f          # suivre tous les logs
docker compose logs -f web      # logs d'un service précis
docker compose down             # arrêter (les données sont conservées)
docker compose down -v          # arrêter ET supprimer les données
docker compose up -d --build    # reconstruire l'app web après modification
```

## Développement de l'app web (hors Docker)

```bash
cd web
npm install
npm run dev        # esbuild --watch + serveur Express sur :8397
npm run typecheck  # vérification TypeScript
```
