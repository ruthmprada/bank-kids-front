// ============================================
// IMPORTACIONES - Librerías y módulos necesarios
// ============================================

// Express: framework web principal para crear el servidor
import express from "express";

// CORS: middleware para permitir solicitudes desde otros dominios (necesario para que el frontend React se comunique con el backend)
import cors from "cors";

// Rutas de autenticación: gestiona login, registro, validación de usuarios
import authRoutes from "./routes/auth.js";

// Pool de conexión a la base de datos PostgreSQL
import pool from "./db.js";

// Rutas del dashboard: gestiona datos, movimientos, perfiles de usuarios
import dashboardRoutes from "./routes/dashboard.js";  

import transactionRoutes from "./routes/transactions.js";

app.use("/api/transactions", transactionRoutes);

// ============================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================

// Crear la aplicación Express (instancia principal del servidor)
const app = express();

// ============================================
// MIDDLEWARES GLOBALES - Se ejecutan en todas las solicitudes
// ============================================

// Habilitar CORS: permite que el frontend (port 5173 Vite) acceda a este backend (port 3000)
app.use(cors());

// Parsear JSON: transforma el body de las solicitudes POST/PUT en objetos JavaScript
app.use(express.json());

// ============================================
// RUTAS DE LA API
// ============================================

// Todas las rutas del dashboard van bajo el prefijo /api/dashboard
// Ej: GET /api/dashboard/padres, POST /api/dashboard/hijos
app.use("/api/dashboard", dashboardRoutes);

// Todas las rutas de autenticación van bajo el prefijo /api/auth
// Ej: POST /api/auth/login, POST /api/auth/register
app.use("/api/auth", authRoutes);

// ============================================
// VERIFICACIÓN DE CONEXIÓN A LA BASE DE DATOS
// ============================================

// Ejecutar una consulta simple (SELECT NOW()) para confirmar que PostgreSQL está conectada
pool.query("SELECT NOW()")
  // Si la conexión es exitosa, mostrar mensaje en consola
  .then(res => console.log("✅ DB conectada:", res.rows))
  // Si hay error en la conexión, mostrar el error en consola
  .catch(err => console.error("❌ Error DB:", err));

// ============================================
// INICIAR EL SERVIDOR
// ============================================

// Poner el servidor escuchando en puerto 3000
// El servidor estará disponible en http://localhost:3000
app.listen(3000, () => {
  console.log("Frontend (React): http://localhost:5173");
  console.log("Backend (Express): http://localhost:3000");
});