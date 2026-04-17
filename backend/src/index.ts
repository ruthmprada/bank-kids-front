import express from "express";
import cors from "cors";
import transactionsRoutes from "./routes/transactions";

const app = express();

// 🔥 middlewares
app.use(cors());
app.use(express.json());

// 🔥 rutas
app.use("/transactions", transactionsRoutes);

// 🔥 test
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// 🔥 servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});