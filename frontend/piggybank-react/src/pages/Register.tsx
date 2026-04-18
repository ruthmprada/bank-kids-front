import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (user?.role === "parent") navigate("/parent");
    if (user?.role === "child") navigate("/child");
  }, [navigate]);

  const handleRegister: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

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
          avatar,
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
        navigate("/parent");
      } else {
        navigate("/child");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro"
      );
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-violet-50/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐷</span>
          <span className="text-2xl font-black text-blue-700">
            PiggyBank
          </span>
        </div>

        <Link
          to="/login"
          className="font-bold text-blue-600 px-4 py-2 rounded-full hover:bg-violet-100"
        >
          Entrar
        </Link>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-stretch">

          {/* HERO */}
          <div className="hidden md:flex flex-col justify-center p-8 space-y-6">
            <h1 className="text-5xl font-extrabold">
              Become a <br />
              <span className="text-primary italic">
                Treasure Master
              </span>
            </h1>

            <p className="text-gray-500">
              Crea tu cuenta y empieza a ahorrar para tus sueños.
            </p>

            <img
              className="rounded-xl shadow-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTNpAl-MM55lgv4kcoBkHudhmaoflg4FDR8LmrzwcGKbL2uvtEh_VOvJ1UbVD8N0WtOOqApNLOqj2sJIATuzs5entW4HA-eMYKZcUzIN9ws7699P7KoMa2mYPAZpS6kPmSZwJqOLAzW_y0xcievOJqOiTrq1ig4Dqng2qjQ3I5tgFdVwejR9HLuqLp5dQM6LihlmioTvRsT-zdkU2bGR-V6DIFW0DOYMBEesnDua-17JO_IdqWU-Hc_HdDk1zeZ0OqSKCYZrJ0vhQz"
            />
          </div>

          {/* FORM */}
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-xl">

            <h2 className="text-3xl font-bold mb-6 text-center">
              Crear cuenta
            </h2>

            {/* ROLE */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole("child")}
                className={`p-4 rounded-xl border ${
                  role === "child"
                    ? "border-blue-500 bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                👦 Hijo
              </button>

              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`p-4 rounded-xl border ${
                  role === "parent"
                    ? "border-blue-500 bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                👨‍👩‍👧 Padre
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleRegister} className="space-y-4">

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                className="w-full p-4 rounded-xl bg-gray-100"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full p-4 rounded-xl bg-gray-100"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                className="w-full p-4 rounded-xl bg-gray-100"
              />
                <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="URL del avatar (opcional)"
              />

              {/* FAMILY CODE */}
              {(role === "child" || role === "parent") && (
                <input
                  value={familyCode}
                  onChange={(e) =>
                    setFamilyCode(e.target.value.toUpperCase())
                  }
                  placeholder="Código familiar"
                  className="w-full p-4 rounded-xl bg-gray-100"
                />
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl"
              >
                Registrarse
              </button>
            </form>

            {/* LOGIN */}
            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-blue-600 font-bold">
                Inicia sesión
              </Link>
            </p>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-500">
        © 2024 PiggyBank
      </footer>
    </div>
  );
}