import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Container from "../components/Container";

const features = [
  {
    title: "Asignaciones rápidas",
    description:
      "Envía dinero en segundos y deja cada movimiento asociado a la familia correcta.",
  },
  {
    title: "Visión por hijo",
    description:
      "Consulta el saldo de cada niño sin mezclar datos ni perder el contexto familiar.",
  },
  {
    title: "Aprendizaje claro",
    description:
      "Los niños ven un panel simple y entienden qué reciben, qué gastan y cuánto conservan.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(8,70,237,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(0,105,77,0.15),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#f9f5ff_55%,_#fffdf8_100%)]" />

      <main className="relative">
        <section className="px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <Container>
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
                  Economía familiar para empezar bien
                </div>

                <h1 className="mb-6 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.04em] md:text-7xl">
                  Educar con dinero puede ser simple y bonito.
                </h1>

                <p className="mb-8 max-w-xl text-lg leading-8 text-on-surface-variant">
                  PiggyBank ayuda a madres, padres e hijos a compartir saldos,
                  asignaciones y movimientos desde una experiencia clara,
                  cercana y sin fricción.
                </p>

                <div className="mb-12 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Crear familia
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Entrar a mi cuenta
                    </Button>
                  </Link>
                </div>

                <div
                  id="familias"
                  className="grid gap-4 text-left sm:grid-cols-3"
                >
                  <Card className="border-white/70 bg-white/75 p-5 backdrop-blur">
                    <p className="text-3xl font-black text-primary">2 min</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      para crear una familia y empezar
                    </p>
                  </Card>
                  <Card className="border-white/70 bg-white/75 p-5 backdrop-blur">
                    <p className="text-3xl font-black text-primary">100%</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      del historial visible por familia
                    </p>
                  </Card>
                  <Card className="border-white/70 bg-white/75 p-5 backdrop-blur">
                    <p className="text-3xl font-black text-primary">1 panel</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      sencillo para padres y otro para hijos
                    </p>
                  </Card>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-secondary/20 blur-3xl md:block" />
                <div className="absolute -right-4 bottom-8 hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl md:block" />

                <Card className="relative overflow-hidden border-white/70 bg-white/82 p-6 shadow-[0_24px_80px_rgba(43,42,81,0.12)] backdrop-blur-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                        Familia Soto
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-on-surface">
                        128,50 €
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Código
                      </p>
                      <p className="mt-1 text-lg font-black text-primary">
                        FAM82X
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl bg-surface p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold">Nora</p>
                          <p className="text-sm text-on-surface-variant">
                            Última asignación hace 2 días
                          </p>
                        </div>
                        <p className="text-lg font-black text-green-500">
                          64,50 €
                        </p>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-primary/10">
                        <div className="h-full w-[72%] rounded-full bg-primary" />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-surface p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold">Leo</p>
                          <p className="text-sm text-on-surface-variant">
                            Movimiento más reciente hoy
                          </p>
                        </div>
                        <p className="text-lg font-black text-green-500">
                          64,00 €
                        </p>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-secondary/10">
                        <div className="h-full w-[63%] rounded-full bg-secondary" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">
                      Movimiento reciente
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      +15 € añadidos a Nora para su meta de bicicleta.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="como-funciona" className="px-6 py-20">
          <Container>
            <div className="mb-14 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Cómo funciona
              </p>
              <h2 className="text-4xl font-black md:text-5xl">
                Una navegación clara para cada persona de la familia
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="border-white/70 bg-white/75 p-7 shadow-lg shadow-primary/5 backdrop-blur"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-black text-primary">
                    0{index + 1}
                  </div>
                  <h3 className="mb-3 text-xl font-black">{feature.title}</h3>
                  <p className="leading-7 text-on-surface-variant">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section id="seguridad" className="px-6 py-20">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-white/70 bg-secondary text-on-secondary p-8 shadow-[0_24px_60px_rgba(0,105,77,0.22)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                  Seguridad
                </p>
                <h2 className="mt-4 text-4xl font-black text-on-secondary">
                  Cada vista muestra solo lo que toca.
                </h2>
                <p className="mt-4 leading-8 text-on-secondary/85">
                  Padres e hijos acceden a rutas protegidas con un flujo más
                  claro y con datos filtrados por familia.
                </p>
              </Card>

              <div className="grid gap-5 sm:grid-cols-2">
                <Card className="bg-white/80 p-6">
                  <h3 className="text-lg font-black">Sesión consistente</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    El login, el registro y la sesión usan una única fuente de
                    verdad.
                  </p>
                </Card>
                <Card className="bg-white/80 p-6">
                  <h3 className="text-lg font-black">Datos separados</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Los movimientos se guardan con `familyId` para evitar mezclar
                    familias.
                  </p>
                </Card>
                <Card className="bg-white/80 p-6 sm:col-span-2">
                  <h3 className="text-lg font-black">Experiencia más fluida</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    Formularios más claros, navegación unificada y dashboards con
                    jerarquía visual mejor resuelta.
                  </p>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className="px-6 pb-24 pt-8">
          <Container>
            <Card className="overflow-hidden border-primary/10 bg-[linear-gradient(135deg,_rgba(8,70,237,0.95),_rgba(0,105,77,0.92))] p-10 text-on-primary shadow-[0_30px_70px_rgba(8,70,237,0.22)] md:p-14">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                    Empieza hoy
                  </p>
                  <h2 className="mt-3 text-4xl font-black text-on-primary md:text-5xl">
                    Crea tu familia y pruébalo en unos minutos.
                  </h2>
                  <p className="mt-4 max-w-xl text-on-primary/80">
                    La estructura ya está lista para registrar usuarios, separar
                    familias y mostrar movimientos con una experiencia más cuidada.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="w-full bg-blue text-primary hover:bg-white/90 sm:w-auto"
                    >
                      Registrarme
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto"
                    >
                      Ya tengo cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </section>
      </main>
    </div>
  );
}
