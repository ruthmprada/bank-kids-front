import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-88px)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl bg-white/85 p-10 text-center shadow-xl shadow-primary/10 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-black">
          Esta ruta no existe en PiggyBank
        </h1>
        <p className="mt-4 text-on-surface-variant">
          Vuelve a la portada o entra en tu cuenta para seguir navegando.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button>Ir a inicio</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Entrar</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
