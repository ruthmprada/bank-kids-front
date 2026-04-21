import { Link, Outlet } from "react-router-dom";
import Container from "./Container";
import Button from "./Button";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-50 border-b border-surface-container bg-white/80 backdrop-blur-xl">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 font-headline text-xl font-black text-primary">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
                P
              </span>
              <span>PiggyBank</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-on-surface-variant md:flex">
              <a href="/#como-funciona" className="transition-colors hover:text-primary">
                Cómo funciona
              </a>
              <a href="/#familias" className="transition-colors hover:text-primary">
                Familias
              </a>
              <a href="/#seguridad" className="transition-colors hover:text-primary">
                Seguridad
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Crear cuenta</Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
