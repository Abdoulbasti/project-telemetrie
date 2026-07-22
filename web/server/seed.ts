import { fakerFR as faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import type pg from "pg";

// Noms de fleurs fixes ; faker fournit adjectif, description, prix et stock.
// `keyword` sert à obtenir une vraie photo de la fleur via LoremFlickr
// (l'API faker.image.urlLoremFlickr est dépréciée depuis v10.1, on construit
// l'URL nous-mêmes ; le ?lock= généré par faker fige la photo choisie).
const FLOWERS = [
  { name: "Rose", keyword: "rose" },
  { name: "Tulipe", keyword: "tulip" },
  { name: "Pivoine", keyword: "peony" },
  { name: "Orchidée", keyword: "orchid" },
  { name: "Lys", keyword: "lily" },
  { name: "Marguerite", keyword: "daisy" },
  { name: "Tournesol", keyword: "sunflower" },
  { name: "Lavande", keyword: "lavender" },
  { name: "Camélia", keyword: "camellia" },
  { name: "Dahlia", keyword: "dahlia" },
  { name: "Iris", keyword: "iris" },
  { name: "Jasmin", keyword: "jasmine" },
  { name: "Hortensia", keyword: "hydrangea" },
  { name: "Renoncule", keyword: "ranunculus" },
  { name: "Amaryllis", keyword: "amaryllis" },
];

const DEMO_USERS = [
  { email: "marie@fleurs.shop", name: "Marie Dupont" },
  { email: "thomas@fleurs.shop", name: "Thomas Martin" },
  { email: "emma@fleurs.shop", name: "Emma Bernard" },
];

export const DEMO_PASSWORD = "Fleurs2026!";

export async function seed(pool: pg.Pool): Promise<void> {
  faker.seed(42); // catalogue reproductible d'un environnement à l'autre

  for (const { name, keyword } of FLOWERS) {
    await pool.query(
      `INSERT INTO products (name, description, price_cents, image_url, stock)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `${name} ${faker.commerce.productAdjective()}`,
        faker.commerce.productDescription(),
        faker.number.int({ min: 990, max: 8990 }),
        `https://loremflickr.com/640/480/${keyword}?lock=${faker.number.int({ min: 1, max: 100000 })}`,
        faker.number.int({ min: 5, max: 60 }),
      ],
    );
  }

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  for (const user of DEMO_USERS) {
    await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)`,
      [user.email, passwordHash, user.name],
    );
  }
}
