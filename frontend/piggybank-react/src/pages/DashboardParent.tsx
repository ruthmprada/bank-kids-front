import { useState, useEffect } from "react";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import Card from "../components/Card";
import { useAuth } from "../context/useAuth";
import type { Transaction, SavingsGoal } from "../context/types";
import { getFamilyGoals } from "../services/goalService";

type BackendUser = {
  username: string;
  role: string;
  family_code: string;
};

type User = {
  username: string;
  role: string;
  familyId: string;
};

export default function DashboardParent() {
  const { user, logout } = useAuth();
  const familyId = user?.familyId ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          `http://localhost:3000/api/dashboard/children/${familyId}`
        );
        const data = await res.json();

        setUsers(
          data.map((u: BackendUser) => ({
            username: u.username,
            role: u.role,
            familyId: u.family_code,
          }))
        );

        setGoals(getFamilyGoals(familyId));

        const transactionsRes = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      } catch (error) {
        console.error(error);
      }
    }

    if (familyId) loadData();
  }, [familyId]);

  function getBalance(childName: string) {
    return transactions.reduce((acc, t) => {
      if (t.child !== childName) return acc;
      return t.type === "Ingreso"
        ? acc + t.amount
        : acc - t.amount;
    }, 0);
  }

  const totalBalance = transactions.reduce(
    (acc, t) => (t.type === "Ingreso" ? acc + t.amount : acc - t.amount),
    0
  );

  if (!user) return null;

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">

      {/* HEADER */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-[#f9f5ff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200" />
          <div>
            <span className="text-[#2E5BFF] font-black text-xl">
              PiggyBank
            </span>
            <p className="text-xs text-gray-500">
              Hola {user.username}
            </p>
            <p className="text-xs text-gray-400">
              Familia: {familyId}
            </p>
          </div>
        </div>

        <Button onClick={logout}>Salir</Button>
      </header>

      <main className="px-6 max-w-4xl mx-auto space-y-8 mt-4">

        {/* TITLE */}
        <section>
          <h1 className="font-black text-3xl">
            Control Parental
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona las finanzas de tu familia
          </p>
        </section>

        {/* BALANCE */}
        <section className="relative overflow-hidden p-8 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-400">
          <span className="text-xs uppercase">
            Saldo Total Familiar
          </span>
          <div className="text-4xl font-bold mt-2">
            {totalBalance.toFixed(2)} €
          </div>
        </section>

        {/* HIJOS */}
        <section className="space-y-4">
          <h2 className="font-bold text-xl">Tus Hijos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((child) => {
              const balance = getBalance(child.username);
              const childGoals = goals.filter(
                (g) => g.child === child.username
              );

              return (
                <Card key={child.username} className="p-4 space-y-3">

                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">{child.username}</p>
                      <p className="text-green-600 font-bold">
                        {balance.toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  {/* METAS */}
                  {childGoals.map((goal) => {
                    const progress = Math.min(
                      100,
                      Math.round((balance / goal.targetAmount) * 100)
                    );

                    return (
                      <div key={goal.id} className="border p-3 rounded">
                        <p className="font-bold text-sm">{goal.title}</p>

                        <div className="mt-2 h-2 bg-gray-200 rounded">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="text-xs mt-1">
                          {progress}% completado
                        </p>
                      </div>
                    );
                  })}
                </Card>
              );
            })}
          </div>
        </section>

        {/* ACTIVIDAD */}
        <section className="space-y-4">
          <h2 className="font-bold text-xl">
            Actividad Reciente
          </h2>

          <Card className="p-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay movimientos todavía
              </p>
            ) : (
              <TransactionList
                transactions={transactions}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </Card>
        </section>

      </main>

      {/* NAVBAR INFERIOR */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-white shadow">

        <div className="flex flex-col items-center text-blue-600">
          <span>🏠</span>
          <span className="text-xs">Panel</span>
        </div>

        <div className="flex flex-col items-center text-gray-500">
          <span>📄</span>
          <span className="text-xs">Movimientos</span>
        </div>

        <div className="flex flex-col items-center text-gray-500">
          <span>⚙️</span>
          <span className="text-xs">Config</span>
        </div>

      </nav>

    </div>
  );
}