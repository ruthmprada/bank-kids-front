import { useState, useEffect } from "react";
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

// 🔥 categorías tipadas (NO any)
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

export default function DashboardParent() {
  const { user, logout } = useAuth();
  const familyId = user?.familyId ?? "";

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const [selectedChild, setSelectedChild] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Ingreso" | "Gasto">("Ingreso");
  const [category, setCategory] = useState<Category>("otro");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

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
          setGoals(
            goalsData.map((g: BackendGoal) => ({
              id: g.id,
              child: g.child,
              title: g.title,
              familyId,
              targetAmount: Number(g.target_amount),
              createdAt: g.created_at,
            }))
          );
        }

        const transactionsRes = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const transactionsData = await transactionsRes.json();

        if (Array.isArray(transactionsData)) {
          setTransactions(
            transactionsData.map((t: BackendTransaction) => ({
              id: String(t.id),
              child: t.child ?? "",
              amount: Number(t.amount),
              type: t.type === "Ingreso" ? "Ingreso" : "Gasto",
              concept: t.description ?? "",
              category: normalizeCategory(t.category), // 🔥 FIX CLAVE
              familyId,
              date: t.created_at ?? new Date().toISOString(),
            }))
          );
        }
      } catch (error) {
        console.error("ERROR:", error);
      }
    }

    if (familyId) loadData();
  }, [familyId]);

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
      ...prev,
      {
        id: String(newTx.id),
        child: selectedChild,
        amount: Number(amount),
        type,
        concept: description,
        category,
        familyId,
        date: new Date().toISOString(),
      },
    ]);

    setAmount("");
    setDescription("");
    setCategory("otro");
  }

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
        target_amount: Number(goalAmount),
        family_id: familyId,
      }),
    });

    const newGoal = await res.json();

    setGoals((prev) => [
      ...prev,
      {
        id: newGoal.id,
        child: selectedChild,
        title: goalTitle,
        familyId,
        targetAmount: Number(goalAmount),
        createdAt: new Date().toISOString(),
      },
    ]);

    setGoalTitle("");
    setGoalAmount("");
  }

  async function handleDeleteTransaction(transaction: Transaction) {
    try {
      const res = await fetch(`http://localhost:3000/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error eliminando transacción");

      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    } catch (error) {
      console.error("ERROR eliminando transacción:", error);
      alert("No se pudo eliminar la transacción");
    }
  }

  function getBalance(child: string) {
    return transactions.reduce((acc, t) => {
      if (t.child.toLowerCase() !== child.toLowerCase()) return acc;
      return t.type === "Ingreso" ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  const totalBalance = transactions.reduce(
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

        <Button onClick={logout}>Salir</Button>
      </div>

      {/* BALANCE */}
      <Card className="p-6 mb-6">
        <p className="text-sm">Saldo total</p>
        <h2 className="text-3xl font-bold">
          {totalBalance.toFixed(2)} €
        </h2>
      </Card>

      {/* 💸 ASIGNAR DINERO */}
      <Card className="p-6 mb-6 space-y-4">
        <h2 className="font-bold">Asignar dinero</h2>

        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona hijo</option>
          {users.map((c) => (
            <option key={c.username} value={c.username}>
              {c.username}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button onClick={() => setType("Ingreso")}>Ingreso</Button>
          <Button onClick={() => setType("Gasto")} variant="danger">
            Gasto
          </Button>
        </div>

        <input
          type="number"
          placeholder="Cantidad"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* 🔥 CATEGORÍAS */}
        <div className="grid grid-cols-4 gap-3">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`p-3 rounded-xl border bg-white ${
                category === c.key
                  ? "bg-blue-100 border-blue-500"
                  : "border-gray-200"
              }`}
            >
              {c.icon}
            </button>
          ))}
        </div>

        <Button onClick={handleAddMoney}>
          Confirmar
        </Button>
      </Card>

      {/* 🎯 CREAR META */}
      <Card className="p-6 mb-6 space-y-4">
        <h2 className="font-bold">Crear meta</h2>

        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecciona hijo</option>
          {users.map((c) => (
            <option key={c.username} value={c.username}>
              {c.username}
            </option>
          ))}
        </select>

        <input
          placeholder="Título de la meta"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="number"
          placeholder="Cantidad objetivo"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <Button onClick={handleCreateGoal}>
          Crear meta
        </Button>
      </Card>

      {/* HIJOS */}
      {users.map((child) => {
        const balance = getBalance(child.username);
        const childGoals = goals.filter(
          (g) =>
            g.child.toLowerCase() ===
            child.username.toLowerCase()
        );

        return (
          <Card key={child.username} className="p-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  child.avatar ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${child.username}`
                }
                className="w-10 h-10 rounded-full"
              />

              <div>
                <h3 className="font-bold">{child.username}</h3>
                <p className="text-sm text-gray-500">
                  {balance.toFixed(2)} €
                </p>
              </div>
            </div>

            {childGoals.map((goal) => {
              const progress = Math.min(
                100,
                Math.round((balance / goal.targetAmount) * 100)
              );

              return (
                <div key={goal.id} className="mt-3">
                  <p className="text-sm font-bold">{goal.title}</p>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        );
      })}

      {/* MOVIMIENTOS */}
      <Card className="p-4">
        <h2 className="font-bold mb-2">Movimientos</h2>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay movimientos
          </p>
        ) : (
          <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
        )}
      </Card>
    </div>
  );
}