"use client";

import React, { useState, useRef } from "react";
import {
  Dumbbell,
  Apple,
  LineChart,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  User,
  CheckCircle,
  Calendar,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function ToledoTheBullLanding() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    goals: [] as string[],
    customGoal: "",
    attitude: "",
    expectations: "",
    phone: "",
    email: "",
    howToContinue: ""
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const objectivesList = [
    "Mejorar composición corporal y hábitos",
    "Ganar masa muscular (Hipertrofia)",
    "Pérdida de grasa / Definición",
    "Aumento de fuerza y rendimiento deportivo",
    "Competir en culturismo"
  ];

  const transformations = [
    "/img/toledo_transform_1.png",
    "/img/toledo_transform_2.png",
    "/img/toledo_transform_3.png",
    "/img/toledo_transform_4.png",
    "/img/toledo_transform_5.png",
    "/img/toledo_transform_6.png",
    "/img/toledo_transform_7.png",
    "/img/toledo_transform_8.png",
    "/img/toledo_transform_9.png",
    "/img/toledo_transform_10.png"
  ];



  // Handle Objective Checkbox Changes
  const handleCheckboxChange = (option: string) => {
    if (formData.goals.includes(option)) {
      setFormData({
        ...formData,
        goals: formData.goals.filter(item => item !== option)
      });
    } else {
      setFormData({
        ...formData,
        goals: [...formData.goals, option]
      });
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate inputs
    if (!formData.name.trim()) return setErrorMsg("El nombre y apellidos son obligatorios.");
    if (!formData.age.trim()) return setErrorMsg("La edad es obligatoria.");
    if (formData.goals.length === 0 && !formData.customGoal.trim()) {
      return setErrorMsg("Por favor, selecciona al menos un objetivo.");
    }
    if (!formData.attitude) return setErrorMsg("Por favor, responde a la actitud con la que entrarías.");
    if (!formData.howToContinue) return setErrorMsg("Por favor, responde a cómo quieres continuar.");
    if (!formData.phone.trim()) return setErrorMsg("El número de teléfono es obligatorio.");
    if (!formData.email.trim()) return setErrorMsg("El correo electrónico es obligatorio.");

    setLoading(true);

    try {
      const payload = {
        ...formData,
        toEmail: "vtoledonutrition@gmail.com",
        brand: "Toledo The Bull",
        primaryColor: "#E60026",
        subject: "Nuevo formulario - Web The Bull"
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Ocurrió un error al enviar el formulario.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de red. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white font-sans antialiased overflow-x-hidden selection:bg-[#E60026] selection:text-white relative">
      
      {/* Background Orbs & Effects in Crimson Red */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#E60026]/10 blur-[130px]" />
        <div className="absolute top-[30%] -right-[15%] w-[500px] h-[500px] rounded-full bg-[#E60026]/8 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#E60026]/6 blur-[160px]" />
        
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(rgba(230,0,38,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(230,0,38,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Logo */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <img 
              src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1781711106755_toledo_the_bull.png" 
              alt="Toledo The Bull Logo" 
              className="w-12 h-12 rounded-xl object-contain bg-black p-0.5 shadow-lg shadow-[#E60026]/20 border border-[#E60026]/30"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight block">Toledo The Bull</span>
              <span className="text-xs text-[#E60026] block font-bold tracking-widest uppercase">IFBB Pro Athlete</span>
            </div>
          </div>
          <a
            href="#formulario"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-semibold hover:bg-[#E60026]/25 hover:border-[#E60026]/40 transition-all text-[#E60026] shadow-sm hover:shadow-[#E60026]/10"
          >
            Empezar Ahora <ChevronRight size={14} />
          </a>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60026]/10 text-[#E60026] text-xs font-bold uppercase tracking-wider mb-6 border border-[#E60026]/20">
            <Sparkles size={12} className="animate-pulse" /> Desata tu máximo potencial físico
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8">
            Lleva tu físico y rendimiento al <span className="text-[#E60026] italic font-serif">Máximo Nivel</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10">
            Asesoría deportiva y nutricional de élite guiada directamente por el atleta profesional IFBB Pro Víctor Toledo "The Bull". Con el Método The Bull conseguirás una transformación física definitiva y llevarás tu rendimiento al siguiente nivel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#formulario"
              className="px-8 py-4 bg-[#E60026] text-white font-extrabold rounded-2xl hover:bg-[#b5001e] transition-all shadow-lg shadow-[#E60026]/35 flex items-center justify-center gap-2 text-base scale-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar Asesoría <ArrowRight size={18} />
            </a>
            <a
              href="#metodo"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center"
            >
              Descubrir el Método
            </a>
          </div>
        </section>

        {/* Transformations Section */}
        <section className="mb-24 md:mb-36 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Cambios Reales, <span className="text-[#E60026]">Resultados Garantizados</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Visualiza las transformaciones físicas de personas que decidieron confiar en mi método y tomaron el control de su cuerpo.
            </p>
          </div>

          {/* Slidable Carousel with arrows */}
          <div className="relative group px-1">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#E60026] border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#E60026] border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Carousel track */}
            <div 
              ref={carouselRef}
              className="flex items-center overflow-x-auto snap-x snap-mandatory gap-6 scrollbar-none scroll-smooth pb-4 px-2"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {/* Inject CSS to hide scrollbar in Webkit browsers */}
              <style jsx global>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {transformations.map((src, index) => (
                <div 
                  key={index}
                  className="snap-center shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] flex items-center justify-center p-2 rounded-3xl border border-white/5 bg-[#121217]/40 backdrop-blur-sm hover:border-[#E60026]/30 transition-all duration-300 group shadow-md shadow-[#E60026]/2"
                >
                  <img 
                    src={src} 
                    alt={`Cambio físico Toledo The Bull ${index + 1}`} 
                    className="w-full h-auto block rounded-2xl max-h-[450px] object-contain group-hover:scale-[1.02] transition-all duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Method & Process Section */}
        <section id="metodo" className="mb-24 md:mb-36 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              El Método The Bull de Alto Rendimiento
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Estrategias científicas de entrenamiento y nutrición adaptadas al nivel de competición y aplicadas a tu vida diaria para lograr un cambio físico real y duradero.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-[#121217]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#E60026]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E60026]/10 text-[#E60026] flex items-center justify-center mb-6 group-hover:bg-[#E60026] group-hover:text-white transition-all">
                  <Dumbbell size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Entrenamiento Personalizado</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Rutinas planificadas en base a tus objetivos y nivel para conseguir un rendimiento superior.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#121217]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#E60026]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E60026]/10 text-[#E60026] flex items-center justify-center mb-6 group-hover:bg-[#E60026] group-hover:text-white transition-all">
                  <Apple size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Nutrición de Precisión</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Estructura nutricional adaptada a tus requerimientos energéticos y gustos. Planes flexibles con recetas deliciosas y fáciles de preparar para hacer el proceso sostenible en el tiempo.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#121217]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#E60026]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E60026]/10 text-[#E60026] flex items-center justify-center mb-6 group-hover:bg-[#E60026] group-hover:text-white transition-all">
                  <LineChart size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Feedback y Optimización</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Revisiones periódicas exhaustivas para valorar tu evolución y reajustar las variables necesarias. Soporte continuo mediante chat directo para resolver cualquier duda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="formulario" className="max-w-3xl mx-auto scroll-mt-20">
          
          {/* Header Card */}
          <div className="relative bg-[#121217] rounded-t-3xl border-t-[6px] border-[#E60026] p-8 border-x border-b border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-[#E60026]">
              <ShieldCheck size={96} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1781711106755_toledo_the_bull.png" 
                alt="Toledo The Bull Logo Mini" 
                className="w-10 h-10 rounded-lg object-contain bg-black p-0.5"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Postular a Asesoría</h2>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Completa el siguiente cuestionario detalladamente. Analizaré tu caso personalmente y me pondré en contacto contigo en las próximas horas si cumples con el perfil de compromiso requerido.
            </p>
          </div>

          {/* Form Content */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              
              {/* Question 1: Name */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Nombre y Apellidos <span className="text-[#E60026]">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Escribe tu respuesta"
                    className="w-full bg-[#0A0A0E] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all"
                  />
                </div>
              </div>

              {/* Question 2: Age */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Edad <span className="text-[#E60026]">*</span>
                </label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Escribe tu edad"
                    className="w-full bg-[#0A0A0E] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all"
                  />
                </div>
              </div>

              {/* Question 3: Goals */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cuáles son tus objetivos principales? <span className="text-[#E60026]">*</span>
                </label>
                <div className="space-y-3">
                  {objectivesList.map((obj, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(obj)}
                        onChange={() => handleCheckboxChange(obj)}
                        className="w-5 h-5 rounded bg-[#0A0A0E] border border-white/10 text-[#E60026] focus:ring-[#E60026]/20 cursor-pointer transition-all mt-0.5"
                      />
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        {obj}
                      </span>
                    </label>
                  ))}

                  {/* Custom Option */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="chk-otro"
                        checked={formData.customGoal !== ""}
                        onChange={(e) => {
                          if (!e.target.checked) setFormData({ ...formData, customGoal: "" });
                          else setFormData({ ...formData, customGoal: " " });
                        }}
                        className="w-5 h-5 rounded bg-[#0A0A0E] border border-white/10 text-[#E60026] focus:ring-[#E60026]/20 cursor-pointer transition-all"
                      />
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        Otro objetivo:
                      </span>
                    </label>
                    {formData.customGoal !== "" && (
                      <input
                        type="text"
                        value={formData.customGoal.trim()}
                        onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                        placeholder="Escribe tu otro objetivo aquí"
                        className="w-[calc(100%-2rem)] ml-8 bg-[#0A0A0E] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Question 4: Attitude */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Con qué nivel de compromiso entras a la asesoría? <span className="text-[#E60026]">*</span>
                </label>
                <div className="space-y-4">
                  {[
                    "Quiero ver de qué se trata, no es mi máxima prioridad actual",
                    "¡Estoy al 100% y dispuesto/a a darlo todo"
                  ].map((opt, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="attitude"
                        required
                        checked={formData.attitude === opt}
                        onChange={() => setFormData({ ...formData, attitude: opt })}
                        className="w-5 h-5 rounded-full bg-[#0A0A0E] border border-white/10 text-[#E60026] focus:ring-[#E60026]/20 cursor-pointer transition-all mt-0.5"
                      />
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: How to continue */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cómo prefieres que continuemos? <span className="text-[#E60026]">*</span>
                </label>
                <div className="space-y-4">
                  {[
                    "Quiero más información general porque tengo algunas dudas",
                    "¡Quiero que me envíes el formulario de admisión completo para empezar cuanto antes!"
                  ].map((opt, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="howToContinue"
                        required
                        checked={formData.howToContinue === opt}
                        onChange={() => setFormData({ ...formData, howToContinue: opt })}
                        className="w-5 h-5 rounded-full bg-[#0A0A0E] border border-white/10 text-[#E60026] focus:ring-[#E60026]/20 cursor-pointer transition-all mt-0.5"
                      />
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 6: Expectations */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Qué esperas conseguir y cómo crees que puedo ayudarte?
                </label>
                <textarea
                  rows={4}
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  placeholder="Escribe tus respuestas o dudas..."
                  className="w-full bg-[#0A0A0E] border border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all resize-none"
                />
              </div>

              {/* Question 7: Phone */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Número de teléfono para contacto rápido (WhatsApp) <span className="text-[#E60026]">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Escribe tu número de teléfono"
                    className="w-full bg-[#0A0A0E] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all"
                  />
                </div>
              </div>

              {/* Question 8: Email */}
              <div className="bg-[#121217]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Dirección de correo electrónico <span className="text-[#E60026]">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Escribe tu correo electrónico"
                    className="w-full bg-[#0A0A0E] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E60026] focus:ring-1 focus:ring-[#E60026] transition-all"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-[#E60026]/10 border border-[#E60026]/30 text-[#E60026] text-sm px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-center bg-[#E60026] hover:bg-[#b5001e] disabled:bg-[#E60026]/40 text-white font-extrabold rounded-2xl shadow-xl shadow-[#E60026]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.377 0 0 5.377 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando respuestas...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Formulario</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-[#121217]/40 backdrop-blur-md border border-white/5 rounded-b-3xl p-12 text-center shadow-2xl mt-6">
              <div className="w-20 h-20 rounded-full bg-[#E60026]/10 text-[#E60026] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">¡Formulario Recibido!</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Tus respuestas han sido enviadas correctamente. Valoraré tu información y me pondré en contacto contigo por teléfono o email en un plazo de 24-48 horas.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all hover:border-[#E60026]/30"
              >
                Volver a enviar
              </button>
            </div>
          )}

          {/* Social Media & Footer Branding */}
          <div className="text-center mt-16 mb-8 space-y-4">
            <p className="text-gray-400 text-sm font-semibold">SÍGUEME EN MIS REDES SOCIALES</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://www.instagram.com/toledo_thebull/" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#E60026] hover:border-[#E60026] transition-all"
              >
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
            </div>
            <div className="text-center text-gray-500 text-xs pt-4">
              © {new Date().getFullYear()} Toledo The Bull. Todos los derechos reservados.<br />
              Impulsado por la plataforma premium <span className="text-[#E60026] font-semibold">Infinite Coach</span>.
            </div>
          </div>

        </section>

      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/34600000000" // Generic or customizable link
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="Contactar por WhatsApp"
      >
        <span className="absolute -top-12 right-0 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          ¿Dudas? Escríbeme
        </span>
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2c-5.514 0-9.99 4.478-9.99 9.99 0 2.08.647 4.01 1.747 5.612l-1.144 4.173 4.29-1.127c1.545.922 3.338 1.455 5.26 1.455 5.516 0 10.002-4.478 10.002-9.99C22.005 6.478 17.519 2 12.031 2zm6.273 14.253c-.256.716-1.5 1.401-2.062 1.488-.518.082-1.189.146-3.414-.775-2.845-1.177-4.636-4.075-4.777-4.263-.143-.188-1.152-1.533-1.152-2.924 0-1.392.73-2.072 1.01-2.353.28-.28.616-.352.822-.352.207 0 .414.002.595.01.187.008.438-.073.684.52.256.617.876 2.132.953 2.285.077.154.128.334.026.54-.103.205-.154.333-.307.513-.153.18-.323.401-.462.538-.154.154-.316.323-.136.634.18.31.8 1.309 1.716 2.128.784.7 1.442.92 1.75 1.045.309.125.49.103.673-.105.183-.207.784-.912.994-1.22.21-.309.422-.257.712-.149.29.11 1.842.868 2.152 1.023.31.154.518.23.595.36.078.13.078.752-.178 1.47z"/>
        </svg>
      </a>

    </div>
  );
}
