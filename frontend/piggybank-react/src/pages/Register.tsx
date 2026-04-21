import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";
import { getStoredUser } from "../services/authService";

type AvatarPreset = {
  id: number;
  label: string;
  image_url: string;
};

async function fileToCompressedDataUrl(file: File) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = imageUrl;
    });

      const maxSize = 512;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

     const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo preparar la imagen");
    }

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

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
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === "parent") navigate("/parent");
    if (user?.role === "child") navigate("/child");
  }, [navigate]);

  useEffect(() => {
    async function loadAvatarPresets() {
      try {
        const res = await fetch("http://localhost:3000/api/auth/avatar-presets");
        const data = await res.json();
          if (Array.isArray(data)) {
          setAvatarPresets(data);
        }
      } catch (error) {
        console.error("No se pudieron cargar los avatares por defecto", error);
      }
    }

    loadAvatarPresets();
  }, []);

  const handleAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> =
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
      setError("El archivo seleccionado debe ser una imagen");
      return;
    }

       try {
      const compressedImage = await fileToCompressedDataUrl(file);
      setAvatar(compressedImage);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo procesar la imagen"
      );
    }
  };

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
        headers: { "Content-Type": "application/json" },
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

      const user = data.user ?? {
        username,
        role,
        familyId: data.familyCode,
        avatar,
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
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-sm font-bold text-gray-700">
                  Foto de perfil
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
                />

                {avatarPresets.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-3 text-sm font-semibold text-gray-600">
                      O elige un avatar por defecto
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {avatarPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAvatar(preset.image_url)}
                          className={`rounded-xl border p-2 transition ${
                            avatar === preset.image_url
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <img
                            src={preset.image_url}
                            alt={preset.label}
                            className="mx-auto h-14 w-14 rounded-full object-cover"
                          />
                          <span className="mt-2 block text-xs font-semibold text-gray-600">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {avatar && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                    <img
                      src={avatar}
                      alt="Vista previa del avatar"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">
                        Vista previa
                      </p>
                      <p className="text-xs text-gray-500">
                        Esta imagen se guardará en tu perfil.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

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
