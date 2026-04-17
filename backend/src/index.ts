import express from "express";
import cors from "cors";
import dashboardRoutes from "./routes/dashboard";
import transactionsRoutes from "./routes/transactions";
import authRoutes from "./routes/auth";


const app = express();

// 🔥 middlewares (PRIMERO SIEMPRE)
app.use(cors());
app.use(express.json());

// 🔥 rutas
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 🔥 test
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// 🔥 servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});