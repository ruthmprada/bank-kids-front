import { HttpError } from "../lib/httpError";
import { findFamilyByCode } from "../repositories/familyRepository";
import { findSavingsByFamilyId } from "../repositories/dashboardRepository";
import { listChildrenByFamilyId } from "../repositories/userRepository";

export async function getChildrenByFamilyCode(familyCode: string) {
  const family = await findFamilyByCode(familyCode);

  if (!family) {
    throw new HttpError(404, "Familia no encontrada");
  }

  const users = await listChildrenByFamilyId(family.id);

  return users.map((user) => ({
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    family_code: familyCode,
  }));
}

export async function getDashboardByFamilyCode(familyCode: string) {
  const family = await findFamilyByCode(familyCode);

  if (!family) {
    throw new HttpError(404, "Familia no encontrada");
  }

  const savings = await findSavingsByFamilyId(family.id);

  if (!savings) {
    return {
      currentSavings: 0,
      goalProgress: 0,
      goalTarget: 200,
    };
  }

  return {
    currentSavings: Number(savings.amount),
    goalProgress: Number(savings.amount),
    goalTarget: Number(savings.goal_target),
  };
}
