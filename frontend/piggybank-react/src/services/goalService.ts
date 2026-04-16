import type { SavingsGoal } from "../context/types";

const GOALS_KEY = "savings-goals";

type LegacyGoal = Partial<SavingsGoal>;

function readGoals() {
  const rawValue = localStorage.getItem(GOALS_KEY);

  if (!rawValue) {
    return [] as LegacyGoal[];
  }

  try {
    return JSON.parse(rawValue) as LegacyGoal[];
  } catch {
    return [] as LegacyGoal[];
  }
}

function persistGoals(goals: SavingsGoal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function createGoalId() {
  return crypto.randomUUID();
}

function normalizeGoal(goal: LegacyGoal): SavingsGoal | null {
  if (
    !goal.familyId ||
    !goal.child ||
    !goal.title ||
    typeof goal.targetAmount !== "number" ||
    !goal.createdAt
  ) {
    return null;
  }

  return {
    id: goal.id ?? createGoalId(),
    familyId: goal.familyId,
    child: goal.child,
    title: goal.title,
    targetAmount: goal.targetAmount,
    createdAt: goal.createdAt,
  };
}

function sortGoals(goals: SavingsGoal[]) {
  return [...goals].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function getGoals() {
  const goals = readGoals()
    .map(normalizeGoal)
    .filter((goal): goal is SavingsGoal => goal !== null);

  if (goals.length !== readGoals().length) {
    persistGoals(goals);
  }

  return sortGoals(goals);
}

export function getFamilyGoals(familyId: string) {
  return getGoals().filter((goal) => goal.familyId === familyId);
}

export function getChildGoals(familyId: string, child: string) {
  return getFamilyGoals(familyId).filter((goal) => goal.child === child);
}

export function createGoal({
  familyId,
  child,
  title,
  targetAmount,
}: {
  familyId: string;
  child: string;
  title: string;
  targetAmount: number;
}) {
  const newGoal: SavingsGoal = {
    id: createGoalId(),
    familyId,
    child,
    title: title.trim(),
    targetAmount,
    createdAt: new Date().toISOString(),
  };

  const updatedGoals = [...getGoals(), newGoal];
  persistGoals(updatedGoals);
  return sortGoals(updatedGoals);
}

export function updateGoal({
  goalId,
  familyId,
  title,
  targetAmount,
}: {
  goalId: string;
  familyId: string;
  title: string;
  targetAmount: number;
}) {
  const updatedGoals = getGoals().map((goal) => {
    if (goal.id !== goalId || goal.familyId !== familyId) {
      return goal;
    }

    return {
      ...goal,
      title: title.trim(),
      targetAmount,
    };
  });

  persistGoals(updatedGoals);
  return sortGoals(updatedGoals);
}

export function deleteGoal({
  goalId,
  familyId,
}: {
  goalId: string;
  familyId: string;
}) {
  const updatedGoals = getGoals().filter(
    (goal) => !(goal.id === goalId && goal.familyId === familyId)
  );

  persistGoals(updatedGoals);
  return sortGoals(updatedGoals);
}
