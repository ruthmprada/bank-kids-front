
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/useAuth";
import type { Role } from "../context/types";
import { getStoredUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("child");
  const [familyCode, setFamilyCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (user?.role === "parent") navigate("/parent");
    if (user?.role === "child") navigate("/child");
  }, [navigate]);

  const handleRegister: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    console.log("SUBMIT FUNCIUONA");
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
console.log("ENVIANDO:", {
  username,
  password,
  role,
  familyId: familyCode || null,
});
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
          familyId: familyCode || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en registro");
      }

      const user = {
        username,
        role,
        familyId: data.familyCode,
      };

      loginUser(user);

      if (role === "parent") {
        navigate("/parent", {
          state: {
            notice: `Cuenta creada. Código familiar: ${data.familyCode}`,
          },
        });
        return;
      }

      navigate("/child", {
        state: {
          notice: "Cuenta creada correctamente.",
        },
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro"
      );
    }
  };

  const isDisabled =
    !username.trim() ||
    !password ||
    !confirmPassword ||
    (role === "child" && !familyCode.trim());

  return (
    <div className="relative flex min-h-[calc(100svh-88px)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,105,77,0.12),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.18),_rgba(249,245,255,0.96))]" />

      <Card className="relative w-full max-w-md space-y-6 border-white/70 bg-white/88 p-8 shadow-[0_24px_70px_rgba(43,42,81,0.12)] backdrop-blur-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Registro
          </p>
          <h1 className="mt-3 text-3xl font-black">Crear cuenta</h1>
          <p className="mt-2 text-on-surface-variant">
            Configura tu acceso y vincula tu familia
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="new-password"
          />

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-xl border border-surface-container-high bg-white/85 p-3 text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="child">Hijo</option>
            <option value="parent">Padre</option>
          </select>

          {role === "child" && (
            <Input
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
              placeholder="Código familiar"
              autoComplete="one-time-code"
            />
          )}

          <Button type="submit" disabled={isDisabled} className="w-full">
            Registrarse
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary font-bold">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}