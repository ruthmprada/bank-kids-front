import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Card from "../components/Card";
import Button from "../components/Button";
import { getFamilyTransactions } from "../services/transactionService";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const familyId = user?.familyId ?? "";

  // 🔥 Obtener transacciones de la familia
  const transactions = familyId
    ? getFamilyTransactions(familyId)
    : [];

  // 🔥 Buscar la transacción concreta
  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="p-6">
        <p>Movimiento no encontrado</p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const isIngreso = transaction.type === "Ingreso";

  return (
    <div className="min-h-screen bg-surface p-6 max-w-md mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xl"
        >
          ←
        </button>

        <h1 className="text-primary font-bold text-lg">
          Detalle del movimiento
        </h1>
      </div>

      {/* ICONO + IMPORTE */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-xl bg-primary-container flex items-center justify-center text-4xl">
          {isIngreso ? "💰" : "💸"}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            MONTO TOTAL
          </p>

          <div
            className={`text-4xl font-black ${
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
        <Card className="col-span-2 p-4">
          <p className="text-sm text-on-surface-variant">
            Categoría
          </p>
          <p className="font-bold">
            {transaction.concept || "Sin concepto"}
          </p>
        </Card>

        {/* Fecha */}
        <Card className="p-4">
          <p className="text-sm text-on-surface-variant">
            Fecha
          </p>
          <p className="font-bold">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </Card>

        {/* Tipo */}
        <Card className="p-4">
          <p className="text-sm text-on-surface-variant">
            Tipo
          </p>
          <p className="font-bold">
            {transaction.type}
          </p>
        </Card>

        {/* Hijo */}
        <Card className="col-span-2 p-4">
          <p className="text-sm text-on-surface-variant">
            Usuario
          </p>
          <p className="font-bold">
            {transaction.child}
          </p>
        </Card>

        {/* Descripción */}
        {transaction.concept && (
          <Card className="col-span-2 p-4">
            <p className="text-sm text-on-surface-variant">
              Descripción
            </p>
            <p>{transaction.concept}</p>
          </Card>
        )}
      </div>

      {/* BOTONES */}
      <div className="mt-10 flex flex-col gap-4">
        <Button onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </div>
  );
}