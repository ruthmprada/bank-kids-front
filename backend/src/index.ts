import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboard";
import transactionsRoutes from "./routes/transactions";
import authRoutes from "./routes/auth";
import goalsRoutes from "./routes/goals";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// 🔥 middlewares (PRIMERO SIEMPRE)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// 🔥 rutas
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/goals", goalsRoutes);

// 🔥 test
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.use(errorHandler);

async function startServer() {
  app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
  });
}

startServer();
