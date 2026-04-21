import type { Transaction, TransactionType } from "../types";

const TRANSACTIONS_KEY = "transactions";

type LegacyTransaction = {
  child: string;
  type: TransactionType;
  amount: number;
  date: string;
  familyId?: string;
  id?: string;
};

function readTransactions() {
  const rawValue = localStorage.getItem(TRANSACTIONS_KEY);

  if (!rawValue) {
    return [] as LegacyTransaction[];
  }

  try {
    return JSON.parse(rawValue) as LegacyTransaction[];
  } catch {
    return [] as LegacyTransaction[];
  }
}

function createTransactionId() {
  return crypto.randomUUID();
}

function normalizeTransaction(transaction: LegacyTransaction): Transaction | null {
  if (
    !transaction.child ||
    !transaction.type ||
    typeof transaction.amount !== "number" ||
    !transaction.date ||
    !transaction.familyId
  ) {
    return null;
  }

  return {
    id: transaction.id ?? createTransactionId(),
    familyId: transaction.familyId,
    child: transaction.child,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    concept: (transaction as any).concept,
  };
}

function persistTransactions(transactions: Transaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function sortTransactionsByDate(transactions: Transaction[]) {
  return [...transactions].sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime()
  );
}

export function getTransactions() {
  const transactions = readTransactions()
    .map(normalizeTransaction)
    .filter((transaction): transaction is Transaction => transaction !== null);

  const hasLegacyEntries = transactions.length !== readTransactions().length;

  if (hasLegacyEntries) {
    persistTransactions(transactions);
  }

  return sortTransactionsByDate(transactions);
}

export function getFamilyTransactions(familyId: string) {
  return getTransactions().filter(
    (transaction) => transaction.familyId === familyId
  );
}

export function getChildTransactions(familyId: string, childName: string) {
  return getFamilyTransactions(familyId).filter(
    (transaction) => transaction.child === childName
  );
}

export function createIncomeTransaction({
  familyId,
  child,
  amount,
  type = "Ingreso",
  concept = "",
}: {
  familyId: string;
  child: string;
  amount: number;
  type?: TransactionType;
  concept?: string;
}) {
  const newTransaction: Transaction = {
    id: createTransactionId(),
    familyId,
    child,
    type,
    amount,
    date: new Date().toISOString(),
    concept,
  };

  const updatedTransactions = [...getTransactions(), newTransaction];
  persistTransactions(updatedTransactions);

  return {
    newTransaction,
    updatedTransactions: sortTransactionsByDate(updatedTransactions),
  };
}

export function updateTransaction({
  transactionId,
  familyId,
  amount,
  type,
  concept = "",
}: {
  transactionId: string;
  familyId: string;
  amount: number;
  type: TransactionType;
  concept?: string;
}) {
  const updatedTransactions = getTransactions().map((transaction) => {
    if (
      transaction.id !== transactionId ||
      transaction.familyId !== familyId
    ) {
      return transaction;
    }

    return {
      ...transaction,
      amount,
      type,
      concept,
    };
  });

  persistTransactions(updatedTransactions);
  return sortTransactionsByDate(updatedTransactions);
}

export function deleteTransaction({
  transactionId,
  familyId,
}: {
  transactionId: string;
  familyId: string;
}) {
  const updatedTransactions = getTransactions().filter(
    (transaction) =>
      !(
        transaction.id === transactionId &&
        transaction.familyId === familyId
      )
  );

  persistTransactions(updatedTransactions);
  return sortTransactionsByDate(updatedTransactions);
}
