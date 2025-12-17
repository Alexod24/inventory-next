"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Package,
  Lock,
  User,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Menu,
  X,
} from "lucide-react";

// --- Componente: Navbar (Navegación sencilla) ---
const Navbar = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span
            className={`font-bold text-xl tracking-tight ${
              isScrolled ? "text-slate-900" : "text-slate-800"
            }`}
          >
            StockMaster
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Características
          </a>
          <a
            href="#benefits"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Beneficios
          </a>
          <button
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            Acceder al Sistema
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 md:hidden flex flex-col gap-4 shadow-xl">
          <a
            href="#features"
            className="text-slate-600 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Características
          </a>
          <a
            href="#benefits"
            className="text-slate-600 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Beneficios
          </a>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white py-2 rounded-lg font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};

// --- Componente: Landing Page Completa ---
const LandingPage = ({ onNavigate }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Navbar onLoginClick={() => router.push("/login")} />

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-400/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Versión 2.0 Disponible
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Control total de tu inventario, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              sin complicaciones.
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Optimiza tu flujo de trabajo, gestiona ventas en tiempo real y toma
            decisiones basadas en datos. La plataforma diseñada para crecer
            contigo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Comenzar Ahora <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1">
              Ver Demo
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Herramientas potentes encapsuladas en una interfaz minimalista y
              fácil de usar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
                title: "Analíticas en Tiempo Real",
                desc: "Visualiza tus ventas y stock con gráficos actualizados al instante.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
                title: "Seguridad Avanzada",
                desc: "Tus datos están protegidos con encriptación de grado bancario y backups diarios.",
              },
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: "Gestión Ultrarrápida",
                desc: "Registra entradas y salidas de productos en segundos, no en minutos.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            <span className="text-white font-bold text-lg">StockMaster</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Alex Dev Industries. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

// --- Componente: Login Minimalista (Reutilizado) ---
const LoginPage = ({ onLogin, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 relative overflow-hidden">
      {/* Decoración sutil */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 mb-8 flex items-center gap-2 transition-colors font-medium"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Volver al inicio
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Ingresa a tu panel de control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Email / Usuario
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
                placeholder="admin@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-lg hover:shadow-slate-900/20 mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Ingresar al Dashboard"
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-slate-400 text-xs mt-6">
          Protegido por reCAPTCHA Enterprise
        </p>
      </div>
    </div>
  );
};

// --- Componente: Dashboard Stub ---
const DashboardStub = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Mockup */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight ml-3 hidden lg:block">
            StockMaster
          </span>
        </div>

        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 lg:px-4 py-3 bg-blue-600 rounded-xl text-white text-sm font-medium cursor-pointer shadow-lg shadow-blue-900/50">
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Dashboard</span>
          </div>
          {["Inventario", "Ventas", "Usuarios"].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 lg:px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm transition-all cursor-pointer"
            >
              <div className="w-5 h-5 bg-slate-800 rounded shrink-0" />
              <span className="hidden lg:block">{item}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="flex items-center justify-center lg:justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors text-sm w-full px-4 py-3"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">Panel General</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
            <span className="text-sm font-medium text-slate-600">Admin</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                label: "Ingresos Totales",
                val: "$24,500",
                color: "text-blue-600",
              },
              {
                label: "Productos Activos",
                val: "142",
                color: "text-emerald-600",
              },
              { label: "Alertas de Stock", val: "3", color: "text-red-500" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  {stat.label}
                </h3>
                <p className={`text-3xl font-extrabold ${stat.color}`}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center h-96 flex flex-col items-center justify-center border-dashed border-2">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Área de Trabajo
            </h3>
            <p className="text-slate-500">
              Aquí se cargarán tus tablas y gráficos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- App Main Component ---
export default function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing', 'login', 'dashboard'

  return (
    <>
      {currentView === "landing" && <LandingPage onNavigate={setCurrentView} />}
      {currentView === "login" && (
        <LoginPage
          onLogin={() => setCurrentView("dashboard")}
          onBack={() => setCurrentView("landing")}
        />
      )}
      {currentView === "dashboard" && (
        <DashboardStub onLogout={() => setCurrentView("landing")} />
      )}
    </>
  );
}
