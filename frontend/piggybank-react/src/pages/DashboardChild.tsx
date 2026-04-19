import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/useAuth";
import type { Transaction, SavingsGoal } from "../context/types";

// 🔥 Tipos backend
type BackendGoal = {
  id: number;
  family_id: number;
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
};

export default function DashboardChild() {
  const { user, logout } = useAuth();

  const familyId = user?.familyId ?? "";
  const username = user?.username ?? "";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // 💸 TRANSACCIONES
        const res = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const data: BackendTransaction[] = await res.json();

        if (Array.isArray(data)) {
          const formatted: Transaction[] = data.map((t) => ({
            id: String(t.id),
            child: t.child ?? "",
            amount: Number(t.amount),
            type: t.type === "Ingreso" ? "Ingreso" : "Gasto",
            concept: t.description ?? "",
            familyId,
            date: t.created_at ?? new Date().toISOString(),
          }));

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
          const formattedGoals: SavingsGoal[] = goalsData.map((g) => ({
            id: String(g.id),
            familyId,
            child: g.child,
            title: g.title,
            targetAmount: Number(g.target_amount),
            createdAt: g.created_at,
          }));

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
        <h2 className="font-bold mb-3">Metas</h2>

        {goals.length === 0 ? (
          <p className="text-sm text-gray-500">
            No tienes metas aún
          </p>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((balance / goal.targetAmount) * 100)
            );

            return (
              <div key={goal.id} className="mb-4 border p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold">{goal.title}</p>
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