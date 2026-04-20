// 👤 ROLES
export type Role = "parent" | "child";

// 👤 USUARIO
export type User = {
  username: string;
  role: Role;
  familyId: string;
  avatar?: string; // 🔥 opcional (para fotos/avatar)
};

// 🔐 USUARIO ALMACENADO (login/register)
export type StoredUser = User & {
  password: string;
};

// 📝 INPUT REGISTRO
export type RegisterInput = {
  username: string;
  password: string;
  role: Role;
  familyCode?: string;
};

// ✅ RESULTADO REGISTRO
export type RegisterResult = {
  user: User;
  familyId: string;
};

// 🔥 CATEGORÍAS TIPADAS (IMPORTANTE)
export type Category =
  | "comida"
  | "juegos"
  | "ahorro"
  | "regalo"
  | "estudios"
  | "cine"
  | "tienda"
  | "otro";

// 💸 TIPO DE TRANSACCIÓN
export type TransactionType = "Ingreso" | "Gasto";

// 💸 TRANSACCIÓN
export type Transaction = {
  id: string;
  familyId: string;
  child: string;
  type: TransactionType;
  amount: number;
  // 🔥 opcional (si no viene del backend, se asigna "otro"  )

  // 📅 fechas
  date: string;        // usado en frontend
  createdAt?: string;  // opcional si viene del backend

  // 🧠 info
  concept?: string;     // texto libre (ej: "mesada semanal")
  category?: Category;  // 🔥 categoría controlada (para iconos, filtros)
};

// 🎯 META DE AHORRO
export type SavingsGoal = {
  id: string;
  familyId: string;
  child: string;
  title: string;
  targetAmount: number;
  createdAt: string;
  status?: "pending" | "approved" | "achieved";
};

// 🔐 CONTEXTO AUTH
export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (user: User) => void;
  logout: () => void;
};
