import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getStoredUser } from "../services/authService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"child" | "parent">("child");
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role,
        }),
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

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-violet-50/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐷</span>
          <span className="text-2xl font-black text-blue-700">
            PiggyBank
          </span>
        </div>

        <span className="text-gray-500 font-bold">
          Ayuda
        </span>
      </header>

      {/* MAIN */}
      <main className="flex-grow flex items-center justify-center p-6 mt-16">
        <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 items-center">

          {/* HERO */}
          <div className="hidden md:flex flex-col gap-6 pr-8">
            <h1 className="text-5xl font-black">
              ¿Listo para contar tu{" "}
              <span className="text-primary italic">
                tesoro?
              </span>
            </h1>

            <p className="text-gray-500">
              Introduce tus datos y revisa cuánto has ahorrado.
            </p>

            <div className="flex gap-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                ⭐ Seguro
              </div>
              <div className="p-4 bg-gray-100 rounded-lg">
                ✔ Aprobado por padres
              </div>
            </div>
          </div>

          {/* CARD */}
          <div className="relative">
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl">

              <h2 className="text-3xl font-black mb-6 text-center md:text-left">
                ¡Hola de nuevo!
              </h2>

              {/* ROLE */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole("child")}
                  className={`p-4 rounded-lg border ${
                    role === "child"
                      ? "border-blue-500 bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  👦 Hijo
                </button>

                <button
                  onClick={() => setRole("parent")}
                  className={`p-4 rounded-lg border ${
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-4"
              >
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  className="w-full p-4 rounded-lg bg-gray-100"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full p-4 rounded-lg bg-gray-100"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-full font-bold"
                >
                  Entrar
                </button>
              </form>

              {/* REGISTER */}
              <div className="mt-6 text-center text-sm">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="text-blue-600 font-bold">
                  Regístrate
                </Link>
              </div>

            </div>
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