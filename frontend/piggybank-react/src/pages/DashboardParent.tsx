import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/useAuth";
import type { Transaction, SavingsGoal, Category } from "../context/types";
import { normalizeCategory } from "../utils/categories";

type BackendUser = {
  username: string;
  role: string;
  family_code: string;
  avatar?: string;
};

type BackendGoal = {
  id: string;
  child: string;
  title: string;
  target_amount: string | number;
  created_at: string;
  status?: string;
};

type BackendTransaction = {
  id: number;
  child: string | null;
  amount: string | number;
  type: string;
  description?: string;
  created_at?: string;
  category?: string;
};

// 🔥 categorías tipadas
const categories: { key: Category; icon: string }[] = [
  { key: "comida", icon: "🍔" },
  { key: "juegos", icon: "🎮" },
  { key: "ahorro", icon: "💰" },
  { key: "regalo", icon: "🎁" },
  { key: "estudios", icon: "📚" },
  { key: "cine", icon: "🎬" },
  { key: "tienda", icon: "🛍️" },
  { key: "otro", icon: "✨" },
];

// ==========================
// 🔥 MAPPERS (FUERA)
// ==========================
function mapBackendGoal(g: BackendGoal, familyId: string): SavingsGoal {
  return {
    id: String(g.id),
    child: g.child,
    title: g.title,
    familyId,
    targetAmount: Number(g.target_amount),
    createdAt: g.created_at,
    status:
      g.status === "pending"
        ? "pending"
        : g.status === "achieved"
        ? "achieved"
        : "approved",
  };
}

function mapBackendTransaction(
  t: BackendTransaction,
  familyId: string
): Transaction {
  return {
    id: String(t.id),
    child: t.child ?? "",
    amount: Number(t.amount),
    type: t.type === "Ingreso" ? "Ingreso" : "Gasto",
    concept: t.description ?? "",
    category: normalizeCategory(t.category),
    familyId,
    date: t.created_at ?? new Date().toISOString(),
  };
}

// ==========================
// COMPONENT
// ==========================
export default function DashboardParent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const familyId = user?.familyId ?? "";

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const [selectedChild, setSelectedChild] = useState("");
  const [activeChildFilter, setActiveChildFilter] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Ingreso" | "Gasto">("Ingreso");
  const [category, setCategory] = useState<Category>("otro");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  // ==========================
  // LOAD DATA
  // ==========================
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `http://localhost:3000/api/dashboard/children/${familyId}`
        );
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);

        const goalsRes = await fetch(
          `http://localhost:3000/api/goals/${familyId}`
        );
        const goalsData = await goalsRes.json();
        if (Array.isArray(goalsData)) {
          setGoals(goalsData.map((g) => mapBackendGoal(g, familyId)));
        }

        const transactionsRes = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const transactionsData = await transactionsRes.json();
        if (Array.isArray(transactionsData)) {
          setTransactions(
            transactionsData.map((t) =>
              mapBackendTransaction(t, familyId)
            )
          );
        }
      } catch (error) {
        console.error("ERROR:", error);
      }
    }

    if (familyId) loadData();
  }, [familyId]);

  // ==========================
  // ADD MONEY
  // ==========================
  async function handleAddMoney() {
    if (!selectedChild || !amount) return;

    const res = await fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        child: selectedChild,
        type,
        description,
        amount: Number(amount),
        familyId,
        category,
      }),
    });

    const newTx = await res.json();

    setTransactions((prev) => [
      mapBackendTransaction(newTx, familyId),
      ...prev,
    ]);

    setAmount("");
    setDescription("");
    setCategory("otro");
  }

  // ==========================
  // CREATE GOAL
  // ==========================
  async function handleCreateGoal() {
    if (!selectedChild || !goalTitle || !goalAmount) return;

    const res = await fetch("http://localhost:3000/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        child: selectedChild,
        title: goalTitle,
        targetAmount: Number(goalAmount),
        familyId,
        status: "approved",
      }),
    });

    const newGoal = await res.json();

    setGoals((prev) => [
      ...prev,
      mapBackendGoal(newGoal, familyId),
    ]);

    setGoalTitle("");
    setGoalAmount("");
  }

  // ==========================
  // HELPERS
  // ==========================
  function getBalance(child: string) {
    return transactions.reduce((acc, t) => {
      if (t.child.toLowerCase() !== child.toLowerCase()) return acc;
      return t.type === "Ingreso" ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  const filteredTransactions = activeChildFilter
    ? transactions.filter(
        (t) =>
          t.child.toLowerCase() === activeChildFilter.toLowerCase()
      )
    : transactions;

  const totalBalance = filteredTransactions.reduce(
    (acc, t) =>
      t.type === "Ingreso" ? acc + t.amount : acc - t.amount,
    0
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Hola {user.username}
          </h1>
          <p className="text-sm text-gray-500">
            Familia: {familyId}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate("/parent/profiles")}>
            Perfil
          </Button>
          <Button onClick={logout}>Salir</Button>
        </div>
      </div>

      {/* FILTRO HIJOS */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setActiveChildFilter("")}>
            General
          </button>

          {users.map((child) => (
            <button
              key={child.username}
              onClick={() => setActiveChildFilter(child.username)}
            >
              {child.username}
            </button>
          ))}
        </div>
      </Card>

      {/* BALANCE */}
      <Card className="p-6 mb-6">
        <h2 className="text-3xl font-bold">
          {totalBalance.toFixed(2)} €
        </h2>
      </Card>

      {/* FORM DINERO */}
      <Card className="p-6 mb-6 space-y-4">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
        >
          <option value="">Selecciona hijo</option>
          {users.map((c) => (
            <option key={c.username}>{c.username}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button onClick={() => setType("Ingreso")}>
            Ingreso
          </Button>
          <Button onClick={() => setType("Gasto")}>
            Gasto
          </Button>
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-4 gap-3">
          {categories.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key)}>
              {c.icon}
            </button>
          ))}
        </div>

        <Button onClick={handleAddMoney}>
          Confirmar
        </Button>
      </Card>

      {/* CREAR META */}
      <Card className="p-6 mb-6 space-y-4">
        <input
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
        />

        <input
          type="number"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
        />

        <Button onClick={handleCreateGoal}>
          Crear meta
        </Button>
      </Card>

      {/* METAS */}
      {users.map((child) => {
        const balance = getBalance(child.username);

        const childGoals = goals.filter(
          (g) => g.child === child.username
        );

        return (
          <Card key={child.username} className="p-4 mb-4">
            <h3>{child.username}</h3>
            <p>{balance.toFixed(2)} €</p>

            {childGoals.map((goal) => (
              <div key={goal.id}>
                {goal.title}
              </div>
            ))}
          </Card>
        );
      })}

      {/* MOVIMIENTOS */}
      <Card className="p-4">
        <TransactionList transactions={filteredTransactions} />
      </Card>
    </div>
  );
}