import { useEffect, useState } from "react";
import type { SavingsGoal } from "../types";

type BackendGoal = {
  id: number | string;
  family_id?: number;
  child: string;
  title: string;
  target_amount: string | number;
  created_at: string;
  status?: string;
};

function mapBackendGoal(goal: BackendGoal, familyId: string): SavingsGoal {
  return {
    id: String(goal.id),
    familyId,
    child: goal.child,
    title: goal.title,
    targetAmount: Number(goal.target_amount),
    createdAt: goal.created_at,
    status:
      goal.status === "pending"
        ? "pending"
        : goal.status === "achieved"
          ? "achieved"
          : "approved",
  };
}

export function useFamilyGoals(familyId: string) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) return;

    async function loadGoals() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:3000/api/goals/${familyId}`);
        const data: BackendGoal[] = await res.json();

        if (Array.isArray(data)) {
          const mapped = data.map((goal) => mapBackendGoal(goal, familyId));
          setGoals(mapped);
        } else {
          setGoals([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar metas");
        setGoals([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadGoals();
  }, [familyId]);

  return { goals, isLoading, error };
}
