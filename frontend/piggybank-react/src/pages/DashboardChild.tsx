import { useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/useAuth";
import type { SavingsGoal, Transaction } from "../context/types";
import { getChildGoals } from "../services/goalService";
import { getChildTransactions } from "../services/transactionService";

export default function DashboardChild() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const familyId = user?.familyId ?? "";
  const username = user?.username ?? "";

  const [transactions] = useState<Transaction[]>(() =>
    familyId && username ? getChildTransactions(familyId, username) : []
  );

  const [goals] = useState<SavingsGoal[]>(() =>
    familyId && username ? getChildGoals(familyId, username) : []
  );

  const [notice, setNotice] = useState<string>(
    typeof location.state === "object" &&
      location.state &&
      "notice" in location.state &&
      typeof location.state.notice === "string"
      ? location.state.notice
      : ""
  );

  if (!user) return null;

  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type === "Ingreso"
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(0,105,77,0.06),_rgba(249,245,255,0.92)_24%,_rgba(255,255,255,1)_100%)] p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Panel infantil
          </p>

          {/* 👇 saludo como en tu HTML */}
          <h1 className="mt-2 text-3xl font-black">
            ¡Hola, {user.username}! 👋
          </h1>

          <p className="mt-2 text-on-surface-variant">
            Familia {familyId}
          </p>
        </div>

        <Button onClick={logout} variant="danger" size="sm">
          Salir
        </Button>
      </div>

      {/* NOTICE */}
      {notice && (
        <Card className="mb-8 border-secondary/20 bg-secondary/10 p-5">
          <div className="flex justify-between">
            <p>{notice}</p>
            <Button size="sm" onClick={() => setNotice("")}>
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* TARJETAS PRINCIPALES (como tu HTML) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">

        {/* 💰 AHORRO TOTAL */}
        <div className="md:col-span-8 bg-blue-600 text-white p-8 rounded-xl">
          <h3>AHORRO TOTAL</h3>
          <div className="text-5xl font-bold">
            💰{balance.toFixed(2)}€
          </div>
        </div>

        {/* 🎯 META */}
        <div className="md:col-span-4 bg-yellow-300 p-8 rounded-xl">
          <h3>Meta</h3>

          {goals.length > 0 ? (() => {
            const goal = goals[0];
            const progress = Math.min(
              100,
              Math.round((Math.max(balance, 0) / goal.targetAmount) * 100)
            );

            return (
              <>
                <div className="text-lg font-bold">{progress}%</div>

                <div className="text-sm">
                  💰{Math.max(balance, 0).toFixed(2)}€ / 💰{goal.targetAmount}€
                </div>

                <div className="w-full bg-gray-300 h-4 mt-2 rounded">
                  <div
                    className="bg-black h-4 rounded transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            );
          })() : (
            <p>No hay meta aún</p>
          )}
        </div>
      </div>

      {/* METAS */}
      <h2 className="mb-4 text-xl font-bold">Tus metas</h2>

      {goals.length === 0 ? (
        <Card className="p-6">
          No tienes metas todavía
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {goals.map((goal) => {
            const progress = Math.min(
              100,
              Math.round((Math.max(balance, 0) / goal.targetAmount) * 100)
            );

            return (
              <Card key={goal.id} className="p-6">
                <p className="font-bold">{goal.title}</p>

                <div className="mt-3 h-3 bg-secondary/10 rounded">
                  <div
                    className="h-full bg-secondary rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-sm">
                  {progress}% completado
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* MOVIMIENTOS */}
      <h2 className="mb-4 text-xl font-bold">Tus movimientos</h2>

      <Card className="p-5">
        <TransactionList transactions={transactions} />
      </Card>
    </div>
  );
}