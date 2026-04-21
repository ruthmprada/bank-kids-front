/**
 * ============================================
 * ESQUEMA DE BASE DE DATOS - Family App
 * ============================================
 * Base de datos: family_app
 * Motor: PostgreSQL
 * Descripción: Sistema de gestión de transacciones y metas para familias
 * 
 * Tablas:
 * - avatar_presets: Avatares disponibles para usuarios
 * - families: Grupos familiares
 * - users: Usuarios (padres e hijos)
 * - savings: Ahorros por familia
 * - goals: Metas de ahorro
 * - transactions: Movimientos de dinero
 */

-- ============================================
-- TABLA: avatar_presets
-- ============================================
-- Almacena los avatares predefinidos que pueden usar los usuarios
CREATE TABLE IF NOT EXISTS avatar_presets (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: families
-- ============================================
-- Agrupa usuarios en familias
-- El código es único para compartir entre padres
CREATE TABLE IF NOT EXISTS families (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: users
-- ============================================
-- Usuarios del sistema (padres e hijos)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  auth_email VARCHAR(255) NOT NULL UNIQUE,
  auth_user_id UUID UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('parent', 'child')),
  avatar VARCHAR(255),
  family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: savings
-- ============================================
-- Ahorros totales por familia
CREATE TABLE IF NOT EXISTS savings (
  id SERIAL PRIMARY KEY,
  family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) DEFAULT 0.00,
  goal_target NUMERIC(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(family_id)
);

-- ============================================
-- TABLA: goals
-- ============================================
-- Metas de ahorro de los hijos
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  child VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'achieved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: transactions
-- ============================================
-- Movimientos de dinero (ingresos, gastos, etc.)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  child VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_savings_family_id ON savings(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON goals(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_families_code ON families(code);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- COMENTARIOS DE TABLAS Y COLUMNAS
-- ============================================

COMMENT ON TABLE avatar_presets IS 'Avatares predefinidos disponibles para los usuarios';
COMMENT ON COLUMN avatar_presets.label IS 'Nombre o descripción del avatar';
COMMENT ON COLUMN avatar_presets.image_url IS 'URL de la imagen del avatar';

COMMENT ON TABLE families IS 'Grupos familiares del sistema';
COMMENT ON COLUMN families.code IS 'Código único (ej: ABC123) para invitar a otros padres';

COMMENT ON TABLE users IS 'Usuarios del sistema (padres e hijos)';
COMMENT ON COLUMN users.email IS 'Email real del padre o madre. Nullable para hijos';
COMMENT ON COLUMN users.auth_email IS 'Email interno usado para autenticación con Supabase Auth';
COMMENT ON COLUMN users.auth_user_id IS 'Referencia al usuario en auth.users';
COMMENT ON COLUMN users.role IS 'Rol del usuario: parent (padre) o child (hijo)';
COMMENT ON COLUMN users.family_id IS 'Referencia a la familia a la que pertenece';

COMMENT ON TABLE savings IS 'Ahorros totales acumulados por familia';
COMMENT ON COLUMN savings.amount IS 'Cantidad total ahorrada';
COMMENT ON COLUMN savings.goal_target IS 'Meta de ahorro a alcanzar';

COMMENT ON TABLE goals IS 'Metas de ahorro individuales de los hijos';
COMMENT ON COLUMN goals.child IS 'Nombre del hijo para el que es la meta';
COMMENT ON COLUMN goals.status IS 'Estado de la meta: pending (pendiente), approved (aprobada), achieved (lograda)';

COMMENT ON TABLE transactions IS 'Registro de todos los movimientos de dinero';
COMMENT ON COLUMN transactions.type IS 'Tipo de transacción (Ingreso, Gasto, etc.)';
COMMENT ON COLUMN transactions.category IS 'Categoría opcional del movimiento (ahorro, regalo, etc.)';
COMMENT ON COLUMN transactions.family_id IS 'Referencia a la familia a la que pertenece la transacción';
