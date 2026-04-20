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

  function mapBackendGoal(g: BackendGoal): SavingsGoal {
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

  function mapBackendTransaction(t: BackendTransaction): Transaction {
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
          setGoals(goalsData.map(mapBackendGoal));
        }

        const transactionsRes = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const transactionsData = await transactionsRes.json();

        if (Array.isArray(transactionsData)) {
          setTransactions(transactionsData.map(mapBackendTransaction));
        }
      } catch (error) {
        console.error("ERROR:", error);
      }
    }

    if (familyId) loadData();
  }, [familyId]);

  async function handleAddMoney() {
    if (!selectedChild || !amount) return;
    try {
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

      if (!res.ok || !newTx?.id) {
        throw new Error(newTx?.error || "No se pudo guardar el movimiento");
      }

      setTransactions((prev) => [mapBackendTransaction(newTx), ...prev]);
      setAmount("");
      setDescription("");
      setCategory("otro");
    } catch (error) {
      console.error("ERROR creando transacción:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el movimiento"
      );
    }
  }

  async function handleCreateGoal() {
    if (!selectedChild || !goalTitle || !goalAmount) return;
    try {
      const res = await fetch("http://localhost:3000/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child: selectedChild,
          title: goalTitle,
          targetAmount: Number(goalAmount),
          familyId: familyId,
          status: "approved",
        }),
      });

      const newGoal = await res.json();

      if (!res.ok || !newGoal?.id) {
        throw new Error(newGoal?.error || "No se pudo crear la meta");
      }

      setGoals((prev) => [
        ...prev,
        mapBackendGoal(newGoal),
      ]);

      setGoalTitle("");
      setGoalAmount("");
    } catch (error) {
      console.error("ERROR creando meta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la meta"
      );
    }
  }

  async function handleEditGoal(goal: SavingsGoal) {
    const nextTitle = window.prompt("Nuevo nombre de la meta", goal.title);
    if (nextTitle === null) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) {
      alert("El título no puede estar vacío");
      return;
    }

    const nextAmountValue = window.prompt(
      "Nueva cantidad objetivo",
      String(goal.targetAmount)
    );
    if (nextAmountValue === null) return;

    const nextAmount = Number(nextAmountValue);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      alert("La cantidad objetivo debe ser mayor que 0");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          targetAmount: nextAmount,
          status: goal.status ?? "approved",
        }),
      });

      const updatedGoal = await res.json();

      if (!res.ok || !updatedGoal?.id) {
        throw new Error(updatedGoal?.error || "No se pudo actualizar la meta");
      }

      setGoals((prev) =>
        prev.map((item) =>
          item.id === goal.id
            ? {
                ...item,
                title: updatedGoal.title,
                targetAmount: Number(updatedGoal.target_amount),
                status: updatedGoal.status === "pending" ? "pending" : "approved",
              }
            : item
        )
      );
    } catch (error) {
      console.error("ERROR actualizando meta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la meta"
      );
    }
  }

  async function handleDeleteGoal(goal: SavingsGoal) {
    const confirmed = window.confirm(
      `¿Seguro que quieres cancelar la meta "${goal.title}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/api/goals/${goal.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo cancelar la meta");
      }

      setGoals((prev) => prev.filter((item) => item.id !== goal.id));
    } catch (error) {
      console.error("ERROR cancelando meta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la meta"
      );
    }
  }

  async function handleApproveGoal(goal: SavingsGoal) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/goals/${goal.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      const updatedGoal = await res.json();

      if (!res.ok || !updatedGoal?.id) {
        throw new Error(updatedGoal?.error || "No se pudo aprobar la meta");
      }

      setGoals((prev) =>
        prev.map((item) =>
          item.id === goal.id
            ? {
                ...item,
                status: "approved",
                title: updatedGoal.title,
                targetAmount: Number(updatedGoal.target_amount),
              }
            : item
        )
      );
    } catch (error) {
      console.error("ERROR aprobando meta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo aprobar la meta"
      );
    }
  }

  async function handleCompleteGoal(goal: SavingsGoal) {
    try {
      const res = await fetch(`http://localhost:3000/api/goals/${goal.id}/complete`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.goal || !data?.transaction) {
        throw new Error(data?.error || "No se pudo marcar la meta como lograda");
      }

      setGoals((prev) =>
        prev.map((item) =>
          item.id === goal.id
            ? {
                ...item,
                status: "achieved",
              }
            : item
        )
      );

      setTransactions((prev) => [mapBackendTransaction(data.transaction), ...prev]);
    } catch (error) {
      console.error("ERROR logrando meta:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo marcar la meta como lograda"
      );
    }
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

  function getTypeButtonClass(option: "Ingreso" | "Gasto") {
    const isSelected = type === option;

    if (option === "Ingreso") {
      return isSelected
        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-200"
        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50";
    }

    return isSelected
      ? "bg-rose-600 text-white border-rose-600 shadow-lg ring-2 ring-rose-200"
      : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50";
  }

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

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("Ingreso")}
            aria-pressed={type === "Ingreso"}
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${getTypeButtonClass(
              "Ingreso"
            )}`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType("Gasto")}
            aria-pressed={type === "Gasto"}
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${getTypeButtonClass(
              "Gasto"
            )}`}
          >
            Gasto
          </button>
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
              const progress =
                goal.status === "achieved"
                  ? 100
                  : Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round((balance / goal.targetAmount) * 100)
                      )
                    );

              return (
                <div key={goal.id} className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{goal.title}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          goal.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : goal.status === "achieved"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {goal.status === "pending"
                          ? "Pendiente"
                          : goal.status === "achieved"
                            ? "Lograda"
                            : "Confirmada"}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {balance.toFixed(2)} € de {goal.targetAmount.toFixed(2)} €
                  </p>
                  <div className="mt-3 flex gap-2">
                    {goal.status === "pending" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApproveGoal(goal)}
                      >
                        Aprobar meta
                      </Button>
                    ) : goal.status === "approved" ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                        >
                          Modificar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteGoal(goal)}
                          className="bg-emerald-600 text-white hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                        >
                          ¡Logrado!
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
                        Meta completada
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Cancelar meta
                    </Button>
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
