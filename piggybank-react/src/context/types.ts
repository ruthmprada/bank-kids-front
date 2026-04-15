export type Role = "parent" | "child";

export type User = {
  username: string;
  role: Role;
  familyId: string;
};

export type StoredUser = User & {
  password: string;
};

export type RegisterInput = {
  username: string;
  password: string;
  role: Role;
  familyCode?: string;
};

export type RegisterResult = {
  user: User;
  familyId: string;
};

export type TransactionType = "Ingreso" | "Gasto";

export type Transaction = {
  id: string;
  familyId: string;
  child: string;
  type: TransactionType;
  amount: number;
  date: string;
  concept?: string;
};

export type SavingsGoal = {
  id: string;
  familyId: string;
  child: string;
  title: string;
  targetAmount: number;
  createdAt: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (user: User) => void;
  logout: () => void;
};
