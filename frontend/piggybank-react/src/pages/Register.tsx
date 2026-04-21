import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { Role } from "../context/types";
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

    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Error canvas");

    ctx.drawImage(image, 0, 0, width, height);

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
    async function loadAvatars() {
      try {
        const res = await fetch("http://localhost:3000/api/auth/avatar-presets");
        const data = await res.json();
        if (Array.isArray(data)) setAvatarPresets(data);
      } catch (e) {
        console.error("Error cargando avatars", e);
      }
    }

    loadAvatars();
  }, []);

  const handleAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> =
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const img = await fileToCompressedDataUrl(file);
        setAvatar(img);
      } catch {
        setError("Error procesando imagen");
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

      if (!res.ok) throw new Error(data.error);

      loginUser(data.user);

      navigate(role === "parent" ? "/parent" : "/child");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl w-full max-w-md shadow">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Crear cuenta
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setRole("child")} className={role==="child"?"bg-blue-200 p-3":"bg-gray-200 p-3"}>
            👦 Hijo
          </button>
          <button onClick={() => setRole("parent")} className={role==="parent"?"bg-blue-200 p-3":"bg-gray-200 p-3"}>
            👨 Padre
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-2 mb-3">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">

          <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Usuario" className="w-full p-3 bg-gray-100"/>

          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-3 bg-gray-100"/>

          <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" className="w-full p-3 bg-gray-100"/>

          <input value={familyCode} onChange={(e)=>setFamilyCode(e.target.value.toUpperCase())} placeholder="Código familiar" className="w-full p-3 bg-gray-100"/>

          <input type="file" onChange={handleAvatarFileChange}/>

          <div className="grid grid-cols-4 gap-2">
            {avatarPresets.map(a => (
              <img key={a.id} src={a.image_url} onClick={()=>setAvatar(a.image_url)} className={`cursor-pointer ${avatar===a.image_url?"border-2 border-blue-500":""}`} />
            ))}
          </div>

          {avatar && <img src={avatar} className="w-16 h-16 rounded-full mx-auto"/>}

          <button className="w-full bg-blue-600 text-white py-3">
            Registrarse
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}