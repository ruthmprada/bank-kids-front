import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-surface text-on-background min-h-screen">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-violet-50/80 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🐷</span>
            <span className="text-2xl font-black text-blue-700">
              PiggyBank
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <span className="text-blue-700 font-bold">Inicio</span>
            <span className="text-gray-500">Cómo funciona</span>
            <span className="text-gray-500">Padres</span>
          </div>

          <div>
            <Link
              to="/login"
              className="font-bold text-blue-600 px-6 py-2 rounded-xl hover:bg-violet-100 transition"
            >
              Iniciar
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">

        {/* HERO */}
        <section className="relative px-6 py-12 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

            {/* TEXTO */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-sm font-bold mb-6">
                ⭐ ¡Ahorrar es un juego!
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                Aprende a ahorrar de{" "}
                <span className="text-primary italic">
                  forma divertida
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-lg mb-10">
                Convierte cada moneda en una aventura. Los niños aprenden
                el valor del dinero mientras alcanzan sus metas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <button className="bg-primary text-white px-10 py-5 rounded-xl font-bold text-lg shadow hover:scale-105 transition">
                    Únete
                  </button>
                </Link>

                <Link to="/login">
                  <button className="bg-gray-200 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-300 transition">
                    Acceso
                  </button>
                </Link>
              </div>
            </div>

            {/* IMAGEN */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden bg-primary/10">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMjOr6s45lUKLm6_4wG3IN1dlnSu1tyGFba5FNklgOfROC6TQENX4maRZy0sEsU7OsyT6Z-PEthMxz4DJJGnWRXvzfG4fcnmOsZ3u5OGp6Q02CVUtuEirI7AFd9G17gVZ-leIfW1I7yUSS2oCAUNbcweXKmADejcETOkPiBoJ0yL_PHxs6O3Ed2wL51FgLbHkRRhlPQXwIiSwMBeI1rCNDefkXkYukZDrbYPJF0MhGSW7Uy72H5gL7et-W1eK-PoH9TC6ef_wkXOYG"
                  alt="PiggyBank"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>

          </div>

          {/* DECORACIÓN */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>
        </section>

        {/* FEATURES (BENTO SIMPLIFICADO) */}
        <section className="px-6 py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                ¡Tú tienes el control!
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Aprende a gestionar dinero de forma sencilla y divertida.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              <div className="bg-white p-8 rounded-xl shadow">
                <h3 className="text-xl font-black mb-3">
                  🎯 Metas de ahorro
                </h3>
                <p className="text-gray-600">
                  Define objetivos y alcanza tus sueños paso a paso.
                </p>
              </div>

              <div className="bg-primary text-white p-8 rounded-xl shadow">
                <h3 className="text-xl font-black mb-3">
                  ⚡ Recompensas
                </h3>
                <p>
                  Gana dinero por tareas y aprende jugando.
                </p>
              </div>

              <div className="bg-green-100 p-8 rounded-xl shadow">
                <h3 className="text-xl font-black mb-3">
                  🔐 Seguro
                </h3>
                <p className="text-gray-600">
                  Control total para padres y entorno seguro.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 bg-indigo-600 text-white">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-4xl md:text-6xl font-black mb-8">
              ¿Listo para empezar tu tesoro?
            </h2>

            <p className="text-xl mb-12 opacity-90">
              Únete a familias que ya están aprendiendo a ahorrar.
            </p>

            <Link to="/register">
              <button className="bg-white text-indigo-600 px-12 py-5 rounded-xl font-bold text-lg hover:scale-105 transition">
                Crear mi cuenta gratis
              </button>
            </Link>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐷</span>
              <span className="font-bold text-blue-700">
                PiggyBank
              </span>
            </div>

            <p className="text-sm text-gray-500">
              © 2024 PiggyBank
            </p>
          </div>

          <div className="flex gap-6 text-sm text-gray-500">
            <span>Privacidad</span>
            <span>Seguridad</span>
            <span>Guía</span>
          </div>

        </div>
      </footer>

    </div>
  );
}