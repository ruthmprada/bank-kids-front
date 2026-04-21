import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../types";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
