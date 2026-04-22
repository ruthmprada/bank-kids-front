import { useEffect, useState } from "react";

type FamilyMember = {
  username: string;
  role: string;
  family_code?: string;
  avatar?: string;
};

export function useFamilyMembers(familyId: string) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) return;

    async function loadMembers() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `http://localhost:3000/api/dashboard/children/${familyId}`
        );
        const data: FamilyMember[] = await res.json();

        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          setMembers([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar miembros de familia"
        );
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMembers();
  }, [familyId]);

  return { members, isLoading, error };
}
