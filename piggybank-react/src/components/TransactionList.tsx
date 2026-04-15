import type { Transaction } from "../context/types";
import Button from "./Button";

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
  if (transactions.length === 0) {
    return <p>No hay movimientos aún</p>;
  }

  return (
    <div className="space-y-3">
      {[...transactions] // 🔥 copia para no mutar
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
        .map((t) => {
          const isIngreso = t.type === "Ingreso";

          return (
            <div
              key={t.id}
              className="flex flex-col gap-4 rounded-2xl border border-surface-container bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold">
                  {t.child} {isIngreso ? "recibió" : "gastó"}
                </p>
                {t.concept && (
                  <p className="text-sm text-on-surface">
                    {t.concept}
                  </p>
                )}
                <p className="text-sm text-on-surface-variant">
                  {new Date(t.date).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
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
                  <div className="flex items-center gap-2">
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
  );
}
