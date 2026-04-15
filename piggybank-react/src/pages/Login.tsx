import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/useAuth";
import { getStoredUser } from "../services/authService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const user = getStoredUser();

    if (user?.role === "parent") navigate("/parent");
    if (user?.role === "child") navigate("/child");
  }, [navigate]);

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en login");
      }

      const user = data.user;

      loginUser(user);

      if (user.role === "parent") navigate("/parent");
      else navigate("/child");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión"
      );
    }
  };

  const isDisabled = !username.trim() || !password;

  return (
    <div className="relative flex min-h-[calc(100svh-88px)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(8,70,237,0.12),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.2),_rgba(249,245,255,0.95))]" />

      <Card className="relative w-full max-w-md space-y-6 border-white/70 bg-white/86 p-8 shadow-[0_24px_70px_rgba(43,42,81,0.12)] backdrop-blur-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Acceso
          </p>
          <h1 className="mt-3 text-3xl font-black">Bienvenido otra vez</h1>
          <p className="mt-2 text-on-surface-variant">
            Entra para revisar tu familia y tus movimientos.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col gap-4"
        >
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
            autoComplete="current-password"
          />

          <Button type="submit" disabled={isDisabled} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-bold text-primary">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}