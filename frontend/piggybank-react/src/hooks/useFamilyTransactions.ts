import { useEffect, useState } from "react";
import type { Transaction } from "../types";
import { normalizeCategory } from "../services/categoryService";

type BackendTransaction = {
  id: number;
  child: string | null;
  amount: string | number;
  type: string;
  description?: string;
  created_at?: string;
  category?: string;
};

function mapBackendTransaction(
  transaction: BackendTransaction,
  familyId: string
): Transaction {
  return {
    id: String(transaction.id),
    child: transaction.child ?? "",
    amount: Number(transaction.amount),
    type: transaction.type === "Ingreso" ? "Ingreso" : "Gasto",
    concept: transaction.description ?? "",
    category: normalizeCategory(transaction.category),
    familyId,
    date: transaction.created_at ?? new Date().toISOString(),
  };
}

export function useFamilyTransactions(familyId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) return;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );
        const data: BackendTransaction[] = await res.json();

        if (Array.isArray(data)) {
          const formatted = data.map((t) => mapBackendTransaction(t, familyId));
          setTransactions(formatted);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar transacciones");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [familyId]);

  return { transactions, isLoading, error };
}
