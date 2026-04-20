import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboard";
import transactionsRoutes from "./routes/transactions";
import authRoutes from "./routes/auth";
import goalsRoutes from "./routes/goals";
import db from "./db";


const app = express();

// 🔥 middlewares (PRIMERO SIEMPRE)
app.use(cors());
app.use(express.json());


// 🔥 rutas
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/goals", goalsRoutes);

// 🔥 test
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

async function ensureTransactionsSchema() {
  await db.query(
    `ALTER TABLE transactions
     ADD COLUMN IF NOT EXISTS category TEXT`
  );
}

async function ensureGoalsSchema() {
  await db.query(
    `ALTER TABLE goals
     ADD COLUMN IF NOT EXISTS status TEXT`
  );

  await db.query(
    `UPDATE goals
     SET status = 'approved'
     WHERE status IS NULL OR status = ''`
  );
}

async function startServer() {
  try {
    await ensureTransactionsSchema();
    await ensureGoalsSchema();

    app.listen(3000, () => {
      console.log("Servidor corriendo en http://localhost:3000");
    });
  } catch (error) {
    console.error("Error preparando la base de datos:", error);
    process.exit(1);
  }
}

startServer();
