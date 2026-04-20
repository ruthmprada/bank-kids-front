import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/useAuth";
import type { Transaction, SavingsGoal } from "../context/types";
import { normalizeCategory } from "../utils/categories";

// 🔥 Tipos backend
type BackendGoal = {
  id: number;
  family_id: number;
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

export default function DashboardChild() {
  const { user, logout } = useAuth();

  const familyId = user?.familyId ?? "";
  const username = user?.username ?? "";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  function mapBackendGoal(g: BackendGoal): SavingsGoal {
    return {
      id: String(g.id),
      familyId,
      child: g.child,
      title: g.title,
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
        // 💸 TRANSACCIONES
        const res = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const data: BackendTransaction[] = await res.json();

        if (Array.isArray(data)) {
          const formatted: Transaction[] = data.map(mapBackendTransaction);

          const childTransactions = formatted.filter(
            (t) =>
              t.child.trim().toLowerCase() ===
              username.trim().toLowerCase()
          );

          setTransactions(childTransactions);
        } else {
          setTransactions([]);
        }

        // 🎯 METAS
        const goalsRes = await fetch(
          `http://localhost:3000/api/goals/${familyId}`
        );

        const goalsData: BackendGoal[] = await goalsRes.json();

        if (Array.isArray(goalsData)) {
          const formattedGoals: SavingsGoal[] = goalsData.map(mapBackendGoal);

          const childGoals = formattedGoals.filter(
            (g) =>
              g.child.trim().toLowerCase() ===
              username.trim().toLowerCase()
          );

          setGoals(childGoals);
        } else {
          setGoals([]);
        }

      } catch (error) {
        console.error("ERROR CHILD:", error);
        setTransactions([]);
        setGoals([]);
      }
    }

    if (familyId && username) {
      loadData();
    }
  }, [familyId, username]);

  async function handleCreateGoalRequest() {
    if (!username || !goalTitle || !goalAmount) return;

    try {
      const res = await fetch("http://localhost:3000/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child: username,
          title: goalTitle,
          targetAmount: Number(goalAmount),
          familyId,
          status: "pending",
        }),
      });

      const newGoal = await res.json();

      if (!res.ok || !newGoal?.id) {
        throw new Error(newGoal?.error || "No se pudo crear la meta");
      }

      setGoals((prev) => [mapBackendGoal(newGoal), ...prev]);
      setGoalTitle("");
      setGoalAmount("");
    } catch (error) {
      console.error("ERROR creando meta desde hijo:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la meta"
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
      console.error("ERROR logrando meta desde hijo:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo marcar la meta como lograda"
      );
    }
  }

  if (!user) return null;

  const balance = transactions.reduce((acc, t) => {
    return t.type === "Ingreso"
      ? acc + t.amount
      : acc - t.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-surface p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-3">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`
            }
            className="w-12 h-12 rounded-full"
            alt="avatar"
          />

          <div>
            <h1 className="text-2xl font-bold">
              Hola {user.username}
            </h1>
            <p className="text-sm text-gray-500">
              Familia: {familyId}
            </p>
          </div>
        </div>

        <Button onClick={logout}>Salir</Button>
      </div>

      {/* BALANCE */}
      <Card className="p-6 mb-6">
        <p className="text-sm">Saldo</p>
        <h2 className="text-3xl font-bold">
          {balance.toFixed(2)} €
        </h2>
      </Card>

      {/* 🎯 METAS */}
      <Card className="p-4 mb-6">
        <h2 className="font-bold mb-3">Proponer una meta</h2>
        <div className="space-y-3 mb-6">
          <input
            placeholder="Título de la meta"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Cantidad objetivo"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <Button onClick={handleCreateGoalRequest}>
            Enviar para aprobación
          </Button>
        </div>

        <h2 className="font-bold mb-3">Metas</h2>

        {goals.length === 0 ? (
          <p className="text-sm text-gray-500">
            No tienes metas aún
          </p>
        ) : (
          goals.map((goal) => {
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
              <div key={goal.id} className="mb-4 border p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{goal.title}</p>
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
                        ? "Pendiente de aprobación"
                        : goal.status === "achieved"
                          ? "Lograda"
                          : "Confirmada"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">{progress}%</span>
                </div>

                <div className="h-2 bg-gray-200 rounded mb-2">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {balance.toFixed(2)} € de {goal.targetAmount.toFixed(2)} €
                </p>
                {goal.status === "approved" && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleCompleteGoal(goal)}
                      className="bg-emerald-600 text-white hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                    >
                      ¡Logrado!
                    </Button>
                  </div>
                )}
                {goal.status === "achieved" && (
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
                      Meta completada
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </Card>

      {/* MOVIMIENTOS */}
      <Card className="p-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay movimientos
          </p>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </Card>
    </div>
  );
}
