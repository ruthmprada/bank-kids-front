import { useNavigate } from "react-router-dom";
import type { Transaction } from "../context/types";
import Button from "./Button";
import { categoryUI } from "../utils/categories";

type Props = {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
};

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  const navigate = useNavigate();

  if (transactions.length === 0) {
    return <p>No hay movimientos aún</p>;
  }

  // 🧠 Agrupar por fecha
  function getGroupLabel(date: string) {
    const today = new Date();
    const d = new Date(date);

    const diff = Math.floor(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    if (diff < 7) return "Esta semana";
    return "Anterior";
  }

  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  const grouped = sorted.reduce((acc, t) => {
    const label = getGroupLabel(t.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          {/* HEADER GRUPO */}
          <p className="mb-2 text-xs font-bold uppercase text-on-surface-variant">
            {group}
          </p>

          <div className="space-y-3">
            {items.map((t) => {
              const isIngreso = t.type === "Ingreso";

              // 🔥 categoría segura
              const cat =
                categoryUI[
                  (t.category as keyof typeof categoryUI) || "otro"
                ] || categoryUI.otro;

              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/transaction/${t.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-surface-container bg-surface px-4 py-4 transition hover:shadow-md"
                >
                  {/* IZQUIERDA */}
                  <div className="flex items-center gap-4">

                    {/* 🔥 ICONO CON IMAGEN */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-lg">
                      {cat.icon}
                    </div>

                    {/* TEXTO */}
                    <div>
                      <p className="font-bold">
                        {t.child} {isIngreso ? "recibió" : "gastó"}
                      </p>

                      <p className="text-sm text-on-surface">
                        {cat.label}
                      </p>

                      <p className="text-xs text-on-surface-variant">
                        {new Date(t.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* DERECHA */}
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-bold ${
                        isIngreso
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {isIngreso ? "+" : "-"}
                      {t.amount} €
                    </p>

                    {(onEdit || onDelete) && (
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(t)}
                          >
                            Editar
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(t)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            Borrar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}