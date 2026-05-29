/**
 * Seed literary products into MongoDB.
 * Run from server/src: pnpm run seed:books
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../features/models/productSchema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const BOOKS = [
  {
    name: "The Night Watchman's Daughter",
    description:
      "Author: Elena Marchetti\n\nA luminous debut about memory, exile, and the letters we never send.",
    price: 24.99,
    category: "Literary Fiction",
    stock: 40,
  },
  {
    name: "Salt & Cedar",
    description:
      "Author: James Whitmore\n\nCoastal verses that taste of rain and unfinished prayers.",
    price: 18.5,
    category: "Poetry",
    stock: 35,
  },
  {
    name: "A Brief History of Attics",
    description:
      "Author: Sofia Lindqvist\n\nEssays on dust, inheritance, and the rooms we inherit without choosing.",
    price: 29,
    category: "Essays",
    stock: 25,
  },
  {
    name: "Violet Hour in Lisbon",
    description:
      "Author: Marco Alves\n\nTwo strangers share a bench as the city exhales into evening.",
    price: 22,
    category: "Literary Fiction",
    stock: 30,
  },
  {
    name: "Cartography for the Lonely",
    description:
      "Author: Amira Hassan\n\nMaps drawn in metaphor for those navigating distance.",
    price: 19.99,
    category: "Poetry",
    stock: 28,
  },
  {
    name: "The Archivist's Silence",
    description:
      "Author: Henry Croft\n\nA missing folio unravels a century of family secrets.",
    price: 26.5,
    category: "Mystery",
    stock: 22,
  },
  {
    name: "Winter Letters",
    description:
      "Author: Claire O'Donnell\n\nCorrespondence between sisters across a decade of snow.",
    price: 21,
    category: "Literary Fiction",
    stock: 32,
  },
  {
    name: "The Botanist's Almanac",
    description:
      "Author: Yuki Tanaka\n\nField notes on rare plants and rarer forgiveness.",
    price: 27,
    category: "Essays",
    stock: 18,
  },
  {
    name: "Glass Houses",
    description:
      "Author: Priya Nair\n\nA novel of transparency, ambition, and the cost of being seen.",
    price: 23.5,
    category: "Literary Fiction",
    stock: 26,
  },
  {
    name: "Sonnets from the Commute",
    description:
      "Author: David Okonkwo\n\nPoems written between stations on the morning train.",
    price: 16.99,
    category: "Poetry",
    stock: 45,
  },
  {
    name: "The Last Lighthouse Keeper",
    description:
      "Author: Maeve Sullivan\n\nWhen the light goes out, a coastal town confronts its myths.",
    price: 25,
    category: "Mystery",
    stock: 20,
  },
  {
    name: "Margins of the Map",
    description:
      "Author: Lars Bergstrom\n\nTravel essays from places that don't appear in guidebooks.",
    price: 28,
    category: "Essays",
    stock: 24,
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in server/src/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} products already in database.`);
    await mongoose.disconnect();
    return;
  }

  await Product.insertMany(BOOKS);
  console.log(`Seeded ${BOOKS.length} literary books.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
