import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Menu, X, Shield, FileText, Users, Brain, Home, UserCog, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  const handleAdminRegister = () => {
    navigate('/admin/register');
  };

  const handleTenantLogin = () => {
    navigate('/tenant/login');
  };

  const features = [
    {
      icon: <Building2 className="w-7 h-7 text-emerald-600" />,
      title: "Todo Centralizado",
      description: "Gestiona todas tus propiedades, contratos, pagos e inquilinos desde un solo lugar."
    },
    {
      icon: <Shield className="w-7 h-7 text-emerald-600" />,
      title: "Seguridad Inteligente",
      description: "Control de accesos vehiculares con reconocimiento de placas mediante IA avanzada."
    },
    {
      icon: <FileText className="w-7 h-7 text-emerald-600" />,
      title: "Automatización Completa",
      description: "Genera recibos, facturas y contratos automáticamente. Ahorra horas de trabajo manual."
    },
    {
      icon: <Users className="w-7 h-7 text-emerald-600" />,
      title: "Gestión de Postulantes",
      description: "Administra solicitudes de arrendamiento, evalúa candidatos y selecciona los mejores inquilinos."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER/NAVBAR */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">
                <span className="text-slate-800">Depa</span>
                <span className="text-emerald-600">Manager</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('inicio')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Inicio
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('nosotros')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Nosotros
              </button>
              <button onClick={() => scrollToSection('acceso')} className="text-slate-700 hover:text-emerald-600 transition-colors">
                Acceso
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('inicio')} className="text-slate-700 hover:text-emerald-600 transition-colors text-left px-4 py-2">
                  Inicio
                </button>
                <button onClick={() => scrollToSection('funcionalidades')} className="text-slate-700 hover:text-emerald-600 transition-colors text-left px-4 py-2">
                  Funcionalidades
                </button>
                <button onClick={() => scrollToSection('nosotros')} className="text-slate-700 hover:text-emerald-600 transition-colors text-left px-4 py-2">
                  Nosotros
                </button>
                <button onClick={() => scrollToSection('acceso')} className="text-slate-700 hover:text-emerald-600 transition-colors text-left px-4 py-2">
                  Acceso
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="pt-24 pb-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-emerald-100 text-emerald-700 border-emerald-200 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                Sistema de Gestión Inmobiliaria
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-slate-900">
                Gestión Inteligente de{' '}
                <span className="text-emerald-600">Propiedades</span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-2xl">
                Plataforma integral para administrar inquilinos, propiedades y contratos. 
                Automatiza pagos, genera recibos y controla tu negocio inmobiliario con 
                inteligencia artificial.
              </p>

              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-900">
                    <span>Incluye </span>
                    <span className="text-emerald-600">reconocimiento de placas vehiculares</span>
                    <span> con Inteligencia Artificial</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
                <div className="text-3xl text-emerald-600 mb-2">9+</div>
                <div className="text-slate-700">Inmuebles</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-shadow">
                <div className="text-3xl text-teal-600 mb-2">100%</div>
                <div className="text-slate-700">Seguro</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-shadow">
                <div className="text-3xl text-cyan-600 mb-2">Auto</div>
                <div className="text-slate-700">Facturas</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
                <div className="text-3xl text-emerald-600 mb-2">Digital</div>
                <div className="text-slate-700">Gestión</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES SECTION */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-slate-900 mb-4">
              Toma el control, ahorra tiempo y dinero
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                  {React.cloneElement(feature.icon, {
                    className: "w-7 h-7 text-emerald-600 group-hover:text-white transition-colors"
                  })}
                </div>
                <h3 className="text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN SECTION */}
      <section id="nosotros" className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Misión */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🤝</span>
                <h3 className="text-2xl">Nuestra Misión</h3>
              </div>
              <p className="text-emerald-50 text-lg leading-relaxed">
                Simplificar la gestión inmobiliaria mediante tecnología innovadora, 
                permitiendo a los administradores enfocarse en hacer crecer su negocio 
                mientras nuestra plataforma se encarga de las operaciones diarias con 
                eficiencia y precisión.
              </p>
            </div>

            {/* Visión */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🌐</span>
                <h3 className="text-2xl">Nuestra Visión</h3>
              </div>
              <p className="text-emerald-50 text-lg leading-relaxed">
                Ser la plataforma líder en gestión inmobiliaria inteligente, 
                transformando la administración de propiedades mediante inteligencia 
                artificial y automatización, estableciendo nuevos estándares en 
                eficiencia y seguridad en el sector.
              </p>
            </div>
          </div>

          {/* Frase destacada */}
          <div className="text-center">
            <p className="text-2xl sm:text-3xl text-white/95">
              💡 Innovación que administra, tecnología que protege
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE ACCESO */}
      <section id="acceso" className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-slate-900 mb-4">
              Accede al Sistema
            </h2>
            <p className="text-lg text-slate-600">
              Selecciona tu tipo de acceso
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tarjeta Administradores */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <UserCog className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl mb-2">Administradores</h3>
                <p className="text-emerald-50">
                  Acceso completo al panel de administración y gestión de propiedades
                </p>
              </div>
              
              <div className="p-8 space-y-4">
                <button 
                  onClick={handleAdminLogin}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-md flex items-center justify-center transition-colors"
                >
                  Iniciar Sesión
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                
                <button 
                  onClick={handleAdminRegister}
                  className="w-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 h-12 rounded-md transition-colors"
                >
                  Registrarse
                </button>

                <p className="text-sm text-slate-500 text-center pt-2">
                  ¿Primera vez? Crea tu cuenta de administrador
                </p>
              </div>
            </div>

            {/* Tarjeta Inquilinos */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl mb-2">Inquilinos</h3>
                <p className="text-teal-50">
                  Consulta tus pagos, reporta incidencias y gestiona tu arrendamiento
                </p>
              </div>
              
              <div className="p-8 space-y-4">
                <button 
                  onClick={handleTenantLogin}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-md flex items-center justify-center transition-colors"
                >
                  Iniciar Sesión
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Las cuentas de inquilinos son creadas por los administradores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">
                <span className="text-white">Depa</span>
                <span className="text-emerald-400">Manager</span>
              </span>
            </div>

            <p className="text-slate-400">
              Sistema integral de gestión inmobiliaria
            </p>

            <div className="pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-500">
                © 2025 DepaManager. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}