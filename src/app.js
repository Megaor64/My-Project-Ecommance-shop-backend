import "./shared/config/env.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoConnect from "./shared/config/db.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { env } from "./shared/config/env.js";

import ordersRoute from "./features/routers/orders.route.js"
import inquiriesRoute from "./features/routers/inquiries.route.js";
import prodRoute from "./features/routers/products.route.js";
import userRoute from "./features/routers/users.route.js";
import authRoute from "./features/routers/auth.route.js";
import cartRoute from "./features/routers/cart.route.js";
import statsRoute from "./features/routers/stats.route.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.set("trust proxy", 1);

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function buildAllowedOrigins() {
  const fromEnv = String(env.clientUrl || "")
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  return Array.from(
    new Set([
      ...fromEnv,
      // local dev conveniences
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5500",
    ])
  );
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
      } else {
        console.warn(
          `CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many auth requests",
});

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "יותר מדי בקשות",
});

app.use("/auth", authLimiter);
app.use(globalLimiter);

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/products", prodRoute);
app.use("/cart", cartRoute);
app.use("/orders", ordersRoute)
app.use("/inquiries", inquiriesRoute);
app.use("/stats", statsRoute);

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Not found",
    data: null,
  });
});

app.use(errorHandler);

mongoConnect()
  .then(() => {
    const port = Number(process.env.PORT) || 3005;
    app.listen(port, () => console.log(`Server is running on ${port}...`));
  })
  .catch(console.error);
