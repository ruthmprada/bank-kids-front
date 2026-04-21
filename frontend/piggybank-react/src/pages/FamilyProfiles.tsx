import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../hooks/useAuth";

type AvatarPreset = {
  id: number;
  label: string;
  image_url: string;
};

type FamilyMember = {
  id: string;
  username: string;
  role: "parent" | "child";
  avatar?: string;
  familyId?: string;
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

export default function FamilyProfiles() {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const familyId = user?.familyId ?? "";

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [profileDrafts, setProfileDrafts] = useState<
    Record<string, { username: string; password: string; avatar: string }>
  >({});

  useEffect(() => {
    async function loadData() {
      try {
        const presetsRes = await fetch("http://localhost:3000/api/auth/avatar-presets");
        const presetsData = await presetsRes.json();
        if (Array.isArray(presetsData)) {
          setAvatarPresets(presetsData);
        }

        const membersRes = await fetch(
          `http://localhost:3000/api/auth/family-members/${familyId}`
        );
        const membersData = await membersRes.json();

        if (Array.isArray(membersData)) {
          const mappedMembers: FamilyMember[] = membersData.map((member) => ({
            id: String(member.id),
            username: member.username,
            role: member.role,
            avatar: member.avatar ?? "",
            familyId: member.familyId ?? familyId,
          }));

          setFamilyMembers(mappedMembers);
          setSelectedMemberId(mappedMembers[0]?.id ?? "");
          setProfileDrafts(
            Object.fromEntries(
              mappedMembers.map((member) => [
                member.id,
                {
                  username: member.username,
                  password: "",
                  avatar: member.avatar ?? "",
                },
              ])
            )
          );
        }
      } catch (error) {
        console.error("ERROR cargando perfiles:", error);
      }
    }

    if (familyId) {
      loadData();
    }
  }, [familyId]);

  function updateProfileDraft(
    memberId: string,
    field: "username" | "password" | "avatar",
    value: string
  ) {
    setProfileDrafts((prev) => ({
      ...prev,
      [memberId]: {
        username: prev[memberId]?.username ?? "",
        password: prev[memberId]?.password ?? "",
        avatar: prev[memberId]?.avatar ?? "",
        [field]: value,
      },
    }));
  }

  async function handleProfileAvatarFileChange(
    memberId: string,
    file: File | undefined
  ) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("El archivo seleccionado debe ser una imagen");
      return;
    }

    try {
      const compressedImage = await fileToCompressedDataUrl(file);
      updateProfileDraft(memberId, "avatar", compressedImage);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo procesar la imagen"
      );
    }
  }

  async function handleSaveProfile(member: FamilyMember) {
    const draft = profileDrafts[member.id];

    if (!draft?.username.trim()) {
      alert("El nombre no puede estar vacío");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/auth/users/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: draft.username.trim(),
          password: draft.password || undefined,
          avatar: draft.avatar || null,
        }),
      });

      const updatedMember = await res.json();

      if (!res.ok || !updatedMember?.id) {
        throw new Error(updatedMember?.error || "No se pudo actualizar el perfil");
      }

      setFamilyMembers((prev) =>
        prev.map((item) =>
          item.id === member.id
            ? {
                ...item,
                username: updatedMember.username,
                avatar: updatedMember.avatar ?? "",
              }
            : item
        )
      );

      setProfileDrafts((prev) => ({
        ...prev,
        [member.id]: {
          username: updatedMember.username,
          password: "",
          avatar: updatedMember.avatar ?? "",
        },
      }));

      if (user?.username === member.username && user.role === member.role) {
        loginUser({
          username: updatedMember.username,
          email: user.email,
          role: updatedMember.role,
          familyId: updatedMember.familyId ?? familyId,
          avatar: updatedMember.avatar ?? "",
        });
      }
    } catch (error) {
      console.error("ERROR actualizando perfil:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil"
      );
    }
  }

  const selectedMember =
    familyMembers.find((member) => member.id === selectedMemberId) ?? null;

  const selectedDraft = selectedMember
    ? profileDrafts[selectedMember.id] ?? {
        username: selectedMember.username,
        password: "",
        avatar: selectedMember.avatar ?? "",
      }
    : null;

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perfiles de la familia</h1>
          <p className="text-sm text-gray-500">Edita nombre, contraseña y avatar.</p>
        </div>

        <Button variant="secondary" onClick={() => navigate("/parent")}>
          Volver al dashboard
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="p-4">
          <h2 className="mb-4 font-bold">Selecciona una persona</h2>

          <div className="space-y-3">
            {familyMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  selectedMemberId === member.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <img
                  src={
                    member.avatar ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${member.username}`
                  }
                  alt={member.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{member.username}</p>
                  <p className="text-sm text-gray-500">
                    {member.role === "parent" ? "Padre" : "Hijo"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          {!selectedMember || !selectedDraft ? (
            <p className="text-sm text-gray-500">Selecciona una persona para editar su perfil.</p>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <img
                  src={
                    selectedDraft.avatar ||
                    selectedMember.avatar ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedMember.username}`
                  }
                  alt={selectedMember.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{selectedMember.username}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedMember.role === "parent" ? "Padre" : "Hijo"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={selectedDraft.username}
                  onChange={(e) =>
                    updateProfileDraft(selectedMember.id, "username", e.target.value)
                  }
                  placeholder="Nombre"
                  className="w-full rounded-xl border p-3"
                />

                <input
                  type="password"
                  value={selectedDraft.password}
                  onChange={(e) =>
                    updateProfileDraft(selectedMember.id, "password", e.target.value)
                  }
                  placeholder="Nueva contraseña"
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Avatar</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleProfileAvatarFileChange(selectedMember.id, e.target.files?.[0])
                  }
                  className="mb-4 block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700"
                />

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {avatarPresets.map((preset) => (
                    <button
                      key={`${selectedMember.id}-${preset.id}`}
                      type="button"
                      onClick={() =>
                        updateProfileDraft(selectedMember.id, "avatar", preset.image_url)
                      }
                      className={`rounded-xl border p-2 transition ${
                        selectedDraft.avatar === preset.image_url
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <img
                        src={preset.image_url}
                        alt={preset.label}
                        className="mx-auto h-12 w-12 rounded-full object-cover"
                      />
                      <span className="mt-2 block text-xs font-semibold text-gray-600">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => handleSaveProfile(selectedMember)}>
                  Guardar perfil
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setProfileDrafts((prev) => ({
                      ...prev,
                      [selectedMember.id]: {
                        username: selectedMember.username,
                        password: "",
                        avatar: selectedMember.avatar ?? "",
                      },
                    }))
                  }
                >
                  Restablecer
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
