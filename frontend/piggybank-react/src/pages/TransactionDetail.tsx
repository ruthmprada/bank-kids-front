import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import type { Transaction } from "../types";
import { categoryUI, normalizeCategory } from "../services/categoryService";

type BackendTransaction = {
  id: number;
  child: string | null;
  amount: string | number;
  type: string;
  description?: string;
  created_at?: string;
  category?: string;
};

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const familyId = user?.familyId ?? "";

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const res = await fetch(
          `http://localhost:3000/api/transactions/${familyId}`
        );

        const data: BackendTransaction[] = await res.json();

        if (Array.isArray(data)) {
          const formatted: Transaction[] = data.map((t) => ({
            id: String(t.id),
            child: t.child ?? "",
            amount: Number(t.amount),
            type: t.type === "Ingreso" ? "Ingreso" : "Gasto",
            concept: t.description ?? "",
            category: normalizeCategory(t.category),
            familyId,
            date: t.created_at ?? new Date().toISOString(),
          }));

          const found = formatted.find((t) => t.id === id);

          setTransaction(found || null);
        }

      } catch (error) {
        console.error("ERROR DETAIL:", error);
      }
    }

    if (familyId && id) loadTransaction();
  }, [familyId, id]);

  if (!transaction) {
    return (
      <div className="p-6">
        <p>Movimiento no encontrado</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const isIngreso = transaction.type === "Ingreso";
  const category = categoryUI[transaction.category ?? "otro"];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">

      {/* HEADER */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-[#f9f5ff]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ←
          </button>

          <h1 className="text-blue-600 font-bold text-lg">
            Detalle del movimiento
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md px-6 pt-8 pb-32">

        {/* ICONO + IMPORTE */}
        <div className="flex flex-col items-center mb-12 relative">

          <div className="w-32 h-32 rounded-xl bg-blue-100 flex items-center justify-center text-5xl">
            {isIngreso ? "💰" : "💸"}
          </div>

          <div className="mt-8 text-center">
            <span className="text-sm text-gray-500 uppercase">
              MONTO TOTAL
            </span>

            <div
              className={`text-5xl font-black mt-1 ${
                isIngreso ? "text-green-500" : "text-red-500"
              }`}
            >
              {isIngreso ? "+" : "-"}
              {transaction.amount.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4">

          {/* Categoría */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <p className="text-xs text-gray-500 uppercase">
              Categoría
            </p>
            <p className="text-lg font-bold">
              {category.label}
            </p>
          </div>

          {/* Descripción */}
          <div className="col-span-2 bg-gray-50 p-6 rounded-lg">
            <p className="text-xs text-gray-500 uppercase mb-2">
              Descripción
            </p>
            <p className="text-lg">
              {transaction.concept || "Sin descripción"}
            </p>
          </div>

          {/* Fecha */}
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-xs text-gray-500 uppercase">
              Fecha
            </p>
            <p className="font-bold">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>

          {/* Tipo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-xs text-gray-500 uppercase">
              Tipo
            </p>
            <p className="font-bold">
              {transaction.type}
            </p>
          </div>

          {/* Hijo */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <p className="text-xs text-gray-500 uppercase">
              Usuario
            </p>
            <p className="font-bold">
              {transaction.child}
            </p>
          </div>
        </div>

        {/* BOTONES */}
        <div className="mt-12 flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 font-bold"
          >
            Volver
          </button>
        </div>

      </main>
    </div>
  );
}
