import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../services/authService";

export function useAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();

    if (user?.role === "parent") navigate("/parent");
    if (user?.role === "child") navigate("/child");
  }, [navigate]);
}
