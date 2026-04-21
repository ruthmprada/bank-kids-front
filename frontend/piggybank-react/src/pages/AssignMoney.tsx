import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import type { Category } from "../types";

type TransactionType = "Ingreso" | "Gasto";

const categories: { key: Category; label: string }[] = [
  { key: "comida", label: "Comida" },
  { key: "juegos", label: "Juegos" },
  { key: "estudios", label: "Aprender" },
  { key: "regalo", label: "Regalo" },
  { key: "ahorro", label: "Metas" },
  { key: "cine", label: "Entretenimiento" },
  { key: "tienda", label: "Compras" },
  { key: "otro", label: "Otro" },
];

export default function AssignMoney() {
  const { user } = useAuth();

  const [child, setChild] = useState("");
  const [type, setType] = useState<TransactionType>("Ingreso");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("otro");
  const [memo, setMemo] = useState("");

  const children = ["Leo", "Sofía"];

  // ✅ SOLO UNA FUNCIÓN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!child || !amount) {
      alert("Faltan campos");
      return;
    }

    try {
      const payload = {
        child,
        amount: Number(amount),
        type,
        description: memo,
        category,
        familyId: user?.familyId,
      };

      console.log("📤 ENVIANDO:", payload);

      const res = await fetch("http://localhost:3000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "No se pudo guardar la transacción");
      }

      console.log("✅ Guardado:", data);

      alert("Transacción creada 🎉");

      // 🔄 reset
      setAmount("");
      setMemo("");
      setCategory("otro");
      setChild("");

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error creando transacción");
    }
  };

  function getTypeButtonClass(option: TransactionType) {
    const isSelected = type === option;

    if (option === "Ingreso") {
      return isSelected
        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-200"
        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50";
    }

    return isSelected
      ? "bg-rose-600 text-white border-rose-600 shadow-lg ring-2 ring-rose-200"
      : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50";
  }

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-bold uppercase text-primary">
            Portal de Padres
          </p>
          <h1 className="text-3xl font-black mt-2">
            Asignar Dinero
          </h1>
          <p className="text-on-surface-variant">
            Crea una nueva transacción para tus hijos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* HIJO */}
          <div>
            <p className="font-bold mb-3">Selecciona un hijo</p>
            <div className="flex gap-3">
              {children.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChild(c)}
                  className={`px-4 py-3 rounded-xl border ${
                    child === c ? "bg-primary text-white" : "bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* TIPO */}
          <div>
            <p className="font-bold mb-3">Tipo</p>
            <div className="flex gap-3">
              {["Ingreso", "Gasto"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t as TransactionType)}
                  aria-pressed={type === t}
                  className={`px-4 py-3 rounded-xl border font-bold transition-all ${getTypeButtonClass(
                    t as TransactionType
                  )}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* MONTO */}
          <div>
            <p className="font-bold mb-3">Monto</p>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 rounded-xl border text-2xl"
              placeholder="0.00 €"
            />
          </div>

          {/* CATEGORÍA */}
          <div>
            <p className="font-bold mb-3">Categoría</p>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-xl text-sm ${
                    category === cat.key
                      ? "bg-primary text-white"
                      : "bg-white border"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* MEMO */}
          <div>
            <p className="font-bold mb-3">Descripción</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-4 rounded-xl border"
              placeholder="Ej: Mesada semanal"
            />
          </div>

          <Button type="submit" className="w-full">
            Crear Transacción
          </Button>
        </form>
      </div>
    </div>
  );
}
