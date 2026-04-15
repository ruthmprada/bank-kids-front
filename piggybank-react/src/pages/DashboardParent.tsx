import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/Button";
import TransactionList from "../components/TransactionList";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/useAuth";
import type {
  SavingsGoal,
  Transaction,
  TransactionType,
  User,
} from "../context/types";
//import { getUsers } from "../services/authService";
import {
  createGoal,
  deleteGoal,
  getFamilyGoals,
  updateGoal,
} from "../services/goalService";
import {
  createIncomeTransaction,
  deleteTransaction,
  getFamilyTransactions,
  updateTransaction,
} from "../services/transactionService";

// 👇 Tipo del backend
type BackendUser = {
  username: string;
  role: string;
  family_code: string;
};

type TransactionDraft = {
  id: string | null;
  child: string;
  amount: string;
  type: TransactionType;
  concept: string;
};

type GoalDraft = {
  id: string | null;
  child: string;
  title: string;
  targetAmount: string;
};

const EMPTY_TRANSACTION_DRAFT: TransactionDraft = {
  id: null,
  child: "",
  amount: "",
  type: "Ingreso",
  concept: "",
};

const EMPTY_GOAL_DRAFT: GoalDraft = {
  id: null,
  child: "",
  title: "",
  targetAmount: "",
};

export default function DashboardParent() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const familyId = user?.familyId ?? "";
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch(
          `http://localhost:3000/api/dashboard/children/${familyId}`
        );

        const data = await res.json();

        console.log("USERS BACKEND:", data);

        // 👇 Transformación limpia backend → frontend
        const mappedUsers: User[] = data.map((candidate: BackendUser) => ({
          username: candidate.username,
          role: candidate.role,
          familyId: candidate.family_code,
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    }

    if (familyId) {
      loadUsers();
    }
  }, [familyId]);

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    familyId ? getFamilyTransactions(familyId) : []
  );
  const [goals, setGoals] = useState<SavingsGoal[]>(() =>
    familyId ? getFamilyGoals(familyId) : []
  );
  const [transactionDraft, setTransactionDraft] = useState<TransactionDraft>(
    EMPTY_TRANSACTION_DRAFT
  );
  const [transactionError, setTransactionError] = useState("");
  const [goalDraft, setGoalDraft] = useState<GoalDraft>(EMPTY_GOAL_DRAFT);
  const [goalError, setGoalError] = useState("");
  const [pendingDeleteTransactionId, setPendingDeleteTransactionId] = useState<
    string | null
  >(null);
  const [pendingDeleteGoalId, setPendingDeleteGoalId] = useState<string | null>(
    null
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

  // 👇 Ahora ya no hace falta mapear nada
  const children = users;

  console.log("CHILDREN:", children);

  function getBalance(childName: string) {
    return transactions.reduce((acc, transaction) => {
      if (transaction.child !== childName) {
        return acc;
      }

      return transaction.type === "Ingreso"
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
  }

  function resetTransactionEditor() {
    setTransactionDraft(EMPTY_TRANSACTION_DRAFT);
    setTransactionError("");
  }

  function resetGoalEditor() {
    setGoalDraft(EMPTY_GOAL_DRAFT);
    setGoalError("");
  }

  function openAddMoney(childName: string) {
    setTransactionDraft({
      id: null,
      child: childName,
      amount: "",
      type: "Ingreso",
      concept: "",
    });
    setTransactionError("");
  }

  function openEditTransaction(transaction: Transaction) {
    setTransactionDraft({
      id: transaction.id,
      child: transaction.child,
      amount: transaction.amount.toString(),
      type: transaction.type,
      concept: transaction.concept || "",
    });
    setTransactionError("");
    setPendingDeleteTransactionId(null);
  }

  function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTransactionError("");

    const numericAmount = Number(transactionDraft.amount);

    if (!transactionDraft.child) {
      setTransactionError("Selecciona un hijo para el movimiento.");
      return;
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setTransactionError("El importe debe ser mayor que 0.");
      return;
    }

    if (transactionDraft.id) {
      const updatedTransactions = updateTransaction({
        transactionId: transactionDraft.id,
        familyId,
        amount: numericAmount,
        type: transactionDraft.type,
        concept: transactionDraft.concept,
      });

      setTransactions(
        updatedTransactions.filter(
          (transaction) => transaction.familyId === familyId
        )
      );
      resetTransactionEditor();
      return;
    }

    const { updatedTransactions } = createIncomeTransaction({
      familyId,
      child: transactionDraft.child,
      amount: numericAmount,
      type: transactionDraft.type,
      concept: transactionDraft.concept,
    });

    setTransactions(
      updatedTransactions.filter(
        (transaction) => transaction.familyId === familyId
      )
    );
    resetTransactionEditor();
  }

  function confirmDeleteTransaction(transaction: Transaction) {
    const updatedTransactions = deleteTransaction({
      transactionId: transaction.id,
      familyId,
    });

    setTransactions(
      updatedTransactions.filter(
        (candidate) => candidate.familyId === familyId
      )
    );
    setPendingDeleteTransactionId(null);
  }

  function openEditGoal(goal: SavingsGoal) {
    setGoalDraft({
      id: goal.id,
      child: goal.child,
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
    });
    setGoalError("");
    setPendingDeleteGoalId(null);
  }

  function handleGoalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGoalError("");

    const targetAmount = Number(goalDraft.targetAmount);

    if (!goalDraft.child) {
      setGoalError("Selecciona un hijo para crear la meta.");
      return;
    }

    if (!goalDraft.title.trim()) {
      setGoalError("Escribe un nombre para la meta.");
      return;
    }

    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      setGoalError("El objetivo debe ser mayor que 0.");
      return;
    }

    const updatedGoals = goalDraft.id
      ? updateGoal({
          goalId: goalDraft.id,
          familyId,
          title: goalDraft.title,
          targetAmount,
        })
      : createGoal({
          familyId,
          child: goalDraft.child,
          title: goalDraft.title,
          targetAmount,
        });

    setGoals(updatedGoals.filter((goal) => goal.familyId === familyId));
    resetGoalEditor();
  }

  function confirmDeleteGoal(goal: SavingsGoal) {
    const updatedGoals = deleteGoal({
      goalId: goal.id,
      familyId,
    });

    setGoals(
      updatedGoals.filter((candidate) => candidate.familyId === familyId)
    );
    setPendingDeleteGoalId(null);
  }

  const totalBalance = transactions.reduce((acc, transaction) => {
    return transaction.type === "Ingreso"
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  const goalsByChild = children.map((child) => {
    const childGoals = goals.filter((goal) => goal.child === child.username);
    const balance = getBalance(child.username);

    return {
      child,
      balance,
      goals: childGoals,
    };
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(8,70,237,0.05),_rgba(249,245,255,0.9)_24%,_rgba(255,255,255,1)_100%)] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Panel familiar
          </p>
          <h1 className="mt-2 text-3xl font-black">Control parental</h1>
          <p className="mt-2 text-on-surface-variant">Familia {familyId}</p>
        </div>

        <Button onClick={logout} size="sm">
          Salir
        </Button>
      </div>

      {notice && (
        <Card className="mb-8 border-primary/15 bg-primary/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-primary">{notice}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotice("")}
            >
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card className="bg-white/85 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Total familiar
          </p>
          <p className="mt-3 text-3xl font-black text-on-surface">
            {totalBalance.toFixed(2)} €
          </p>
        </Card>
        <Card className="bg-white/85 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Hijos vinculados
          </p>
          <p className="mt-3 text-3xl font-black text-on-surface">
            {children.length}
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

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-8">
          {children.length === 0 ? (
            <Card>
              <p>No hay hijos vinculados a esta familia todavía.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {goalsByChild.map(({ child, balance, goals: childGoals }) => (
                <Card key={child.username} className="bg-white/85 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="font-bold">{child.username}</h3>
                      <p
                        className={`mt-2 font-bold ${
                          balance >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {balance.toFixed(2)} €
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => openAddMoney(child.username)}
                      >
                        + Añadir dinero
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {childGoals.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">
                        Todavía no hay metas de ahorro para este perfil.
                      </p>
                    ) : (
                      childGoals.map((goal) => {
                        const progress = Math.min(
                          100,
                          Math.round(
                            (Math.max(balance, 0) / goal.targetAmount) * 100
                          )
                        );

                        return (
                          <div
                            key={goal.id}
                            className="rounded-2xl border border-surface-container bg-surface p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-bold">{goal.title}</p>
                                <p className="text-sm text-on-surface-variant">
                                  Objetivo: {goal.targetAmount.toFixed(2)} €
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditGoal(goal)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setPendingDeleteGoalId(goal.id)
                                  }
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  Borrar
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary/10">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="mt-2 text-sm text-on-surface-variant">
                              Progreso aproximado: {progress}% segun el saldo actual.
                            </p>

                            {pendingDeleteGoalId === goal.id && (
                              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                                <p className="text-sm text-red-700">
                                  Vas a borrar la meta "{goal.title}".
                                </p>
                                <div className="mt-3 flex gap-3">
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => confirmDeleteGoal(goal)}
                                  >
                                    Confirmar borrado
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      setPendingDeleteGoalId(null)
                                    }
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div>
            <h2 className="mb-4 text-xl font-bold">
              Movimientos recientes
            </h2>

            <Card className="bg-white/85 p-5">
              <TransactionList
                transactions={transactions}
                onEdit={openEditTransaction}
                onDelete={(transaction) =>
                  setPendingDeleteTransactionId(transaction.id)
                }
              />

              {pendingDeleteTransactionId && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    Vas a borrar un movimiento de la familia. Esta accion no se
                    puede deshacer.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const transaction = transactions.find(
                          (candidate) =>
                            candidate.id === pendingDeleteTransactionId
                        );

                        if (transaction) {
                          confirmDeleteTransaction(transaction);
                        }
                      }}
                    >
                      Confirmar borrado
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setPendingDeleteTransactionId(null)
                      }
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/88 p-6">
            <h2 className="text-xl font-bold">
              {transactionDraft.id
                ? "Editar movimiento"
                : "Nuevo movimiento"}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Añade dinero o corrige un movimiento sin salir del panel.
            </p>

            {transactionError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {transactionError}
              </div>
            )}

            <form
              onSubmit={handleTransactionSubmit}
              className="mt-5 space-y-4"
            >
              <select
                value={transactionDraft.child}
                onChange={(event) =>
                  setTransactionDraft((current) => ({
                    ...current,
                    child: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-surface-container-high bg-white/85 p-3 text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecciona un hijo</option>
                {children.map((child) => (
                  <option
                    key={child.username}
                    value={child.username}
                  >
                    {child.username}
                  </option>
                ))}
              </select>

              <select
                value={transactionDraft.type}
                onChange={(event) =>
                  setTransactionDraft((current) => ({
                    ...current,
                    type: event.target.value as TransactionType,
                  }))
                }
                className="w-full rounded-xl border border-surface-container-high bg-white/85 p-3 text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Gasto">Gasto</option>
                
              </select>

              <Input
                type="text"
                value={transactionDraft.concept}
                onChange={(event) =>
                  setTransactionDraft((current) => ({
                    ...current,
                    concept: event.target.value,
                  }))
                }
                placeholder="Concepto (ej. Mesada, Regalo)"
              />

              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={transactionDraft.amount}
                onChange={(event) =>
                  setTransactionDraft((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="Importe en euros"
              />

              <div className="flex gap-3">
                <Button type="submit" className="w-full">
                  {transactionDraft.id
                    ? "Guardar cambios"
                    : "Guardar movimiento"}
                </Button>
                {(transactionDraft.id ||
                  transactionDraft.child) && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={resetTransactionEditor}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="bg-white/88 p-6">
            <h2 className="text-xl font-bold">
              {goalDraft.id
                ? "Editar meta de ahorro"
                : "Nueva meta de ahorro"}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Crea objetivos por hijo y sigue el progreso con el saldo actual.
            </p>

            {goalError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {goalError}
              </div>
            )}

            <form
              onSubmit={handleGoalSubmit}
              className="mt-5 space-y-4"
            >
              <select
                value={goalDraft.child}
                onChange={(event) =>
                  setGoalDraft((current) => ({
                    ...current,
                    child: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-surface-container-high bg-white/85 p-3 text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Selecciona un hijo</option>
                {children.map((child) => (
                  <option
                    key={child.username}
                    value={child.username}
                  >
                    {child.username}
                  </option>
                ))}
              </select>

              <Input
                value={goalDraft.title}
                onChange={(event) =>
                  setGoalDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Ej. Bicicleta nueva"
              />

              <Input
                type="number"
                min="1"
                step="0.01"
                value={goalDraft.targetAmount}
                onChange={(event) =>
                  setGoalDraft((current) => ({
                    ...current,
                    targetAmount: event.target.value,
                  }))
                }
                placeholder="Objetivo en euros"
              />

              <div className="flex gap-3">
                <Button type="submit" className="w-full">
                  {goalDraft.id
                    ? "Guardar meta"
                    : "Crear meta"}
                </Button>
                {(goalDraft.id ||
                  goalDraft.title ||
                  goalDraft.child) && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={resetGoalEditor}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}