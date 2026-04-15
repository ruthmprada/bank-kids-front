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

  if (!user) {
    return null;
  }

  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type === "Ingreso"
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(0,105,77,0.06),_rgba(249,245,255,0.92)_24%,_rgba(255,255,255,1)_100%)] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Panel infantil
          </p>
          <h1 className="mt-2 text-3xl font-black">Hola {user.username}</h1>
          <p className="mt-2 text-on-surface-variant">Familia {familyId}</p>
        </div>

        <Button onClick={logout} variant="danger" size="sm">
          Salir
        </Button>
      </div>

      {notice && (
        <Card className="mb-8 border-secondary/20 bg-secondary/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-secondary">{notice}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotice("")}
              className="text-secondary hover:bg-secondary/10"
            >
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="bg-white/85 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Tu saldo
          </p>
          <p className="mt-3 text-3xl font-black text-on-surface">
            {balance.toFixed(2)} €
          </p>
        </Card>
        <Card className="bg-white/85 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Movimientos
          </p>
          <p className="mt-3 text-3xl font-black text-on-surface">
            {transactions.length}
          </p>
        </Card>
        <Card className="bg-white/85 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Metas activas
          </p>
          <p className="mt-3 text-3xl font-black text-on-surface">
            {goals.length}
          </p>
        </Card>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Tus metas de ahorro</h2>

        {goals.length === 0 ? (
          <Card className="bg-white/85 p-6">
            <p className="text-on-surface-variant">
              Todavía no tienes metas creadas. Pide a tu familia que configure una.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = Math.min(
                100,
                Math.round((Math.max(balance, 0) / goal.targetAmount) * 100)
              );

              return (
                <Card key={goal.id} className="bg-white/85 p-6">
                  <p className="font-bold">{goal.title}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Objetivo: {goal.targetAmount.toFixed(2)} €
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary/10">
                    <div
                      className="h-full rounded-full bg-secondary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-on-surface-variant">
                    Llevas {Math.max(balance, 0).toFixed(2)} € y vas por el {progress}%.
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <h2 className="mb-4 text-xl font-bold">Tus movimientos</h2>

      <Card className="bg-white/85 p-5">
        <TransactionList transactions={transactions} />
      </Card>
    </div>
  );
}
