import type { Category } from "../types";

export const categoryUI = {
  comida: {
    icon: "🍔",
    label: "Comida",
  },
  juegos: {
    icon: "🎮",
    label: "Juegos",
  },
  ahorro: {
    icon: "💰",
    label: "Ahorro",
  },
  regalo: {
    icon: "🎁",
    label: "Regalo",
  },
  estudios: {
    icon: "📚",
    label: "Estudios",
  },
  cine: {
    icon: "🎬",
    label: "Cine",
  },
  tienda: {
    icon: "🛍️",
    label: "Tienda",
  },
  otro: {
    icon: "✨",
    label: "Otro",
  },
} as const;

// 🔥 LISTA SEGURA DE CATEGORÍAS
const validCategories: Category[] = Object.keys(categoryUI) as Category[];

// 🔥 FUNCIÓN SEGURA
export function normalizeCategory(cat?: string): Category {
  if (!cat) return "otro";

  const clean = cat.toLowerCase().trim();

  if (validCategories.includes(clean as Category)) {
    return clean as Category;
  }

  return "otro";
}
