import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import pool from "./db.js";
import dashboardRoutes from "./routes/dashboard.js";  

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);

// 🔥 prueba conexión DB
pool.query("SELECT NOW()")
  .then(res => console.log("DB conectada:", res.rows))
  .catch(err => console.error("Error DB:", err));

// 🔥 rutas
app.use("/api/auth", authRoutes);

// 🔥 ESTO ES LO QUE TE FALTA (clave)
app.listen(3000, () => {
  console.log("🔥 SERVER 3000 ACTIVO 🔥");
});