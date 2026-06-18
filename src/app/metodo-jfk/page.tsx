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

export default function MetodoJFKLanding() {
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
    "Mejorar y aprender hábitos saludables",
    "Ganar masa muscular",
    "Pérdida de grasa",
    "Potenciarme como atleta"
  ];

  const transformations = [
    "/img/jfk_transform_1.webp",
    "/img/jfk_transform_2.webp",
    "/img/jfk_transform_3.webp",
    "/img/jfk_transform_4.webp",
    "/img/jfk_transform_5.webp",
    "/img/jfk_transform_6.webp",
    "/img/jfk_transform_7.webp",
    "/img/jfk_transform_8.webp",
    "/img/jfk_transform_9.webp"
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
        toEmail: "julian.fitkraff@gmail.com",
        brand: "Método JFK",
        primaryColor: "#C61B23"
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
    <div className="min-h-screen bg-[#090A0F] text-white font-sans antialiased overflow-x-hidden selection:bg-[#C61B23] selection:text-white relative">
      
      {/* Background Orbs & Effects in Crimson Red */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#C61B23]/8 blur-[130px]" />
        <div className="absolute top-[30%] -right-[15%] w-[500px] h-[500px] rounded-full bg-[#C61B23]/6 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#C61B23]/4 blur-[160px]" />
        
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(rgba(198,27,35,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(198,27,35,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Logo */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <img 
              src="/img/metodo_jfk_logo.png" 
              alt="Método JFK Logo" 
              className="w-12 h-12 rounded-xl object-contain bg-black p-0.5 shadow-lg shadow-[#C61B23]/20 border border-[#C61B23]/30"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight block">Método JFK</span>
              <span className="text-xs text-[#C61B23] block font-bold tracking-widest uppercase">JFK Coach</span>
            </div>
          </div>
          <a
            href="#formulario"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-semibold hover:bg-[#C61B23]/25 hover:border-[#C61B23]/40 transition-all text-[#C61B23] shadow-sm hover:shadow-[#C61B23]/10"
          >
            Empezar Ahora <ChevronRight size={14} />
          </a>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C61B23]/10 text-[#C61B23] text-xs font-bold uppercase tracking-wider mb-6 border border-[#C61B23]/20">
            <Sparkles size={12} className="animate-pulse" /> Construye el futuro que siempre soñaste
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8">
            Lleva tu físico y rendimiento al <span className="text-[#C61B23] italic font-serif">Siguiente Nivel</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10">
            ¿Has trabajado duro para alcanzar tus metas sin ver los resultados que esperabas? Yo también lo he vivido y sé lo frustrante que es. Pero no te preocupes, ¡tiene solución! Lo clave es enfocarse en lo que realmente importa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#formulario"
              className="px-8 py-4 bg-[#C61B23] text-white font-extrabold rounded-2xl hover:bg-[#a5151c] transition-all shadow-lg shadow-[#C61B23]/35 flex items-center justify-center gap-2 text-base scale-100 hover:scale-[1.02] active:scale-[0.98]"
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
              Ellos lo lograron, <span className="text-[#C61B23]">tú puedes ser el siguiente</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Echa un vistazo a los cambios físicos reales de personas que confiaron en el Método JFK y tomaron el control de su salud.
            </p>
          </div>

          {/* Slidable Carousel with arrows */}
          <div className="relative group px-1">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#C61B23] border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#C61B23] border border-white/10 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
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
                  className="snap-center shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] overflow-hidden rounded-3xl border border-white/5 bg-[#12131A]/40 backdrop-blur-sm hover:border-[#C61B23]/30 transition-all duration-300 group shadow-md shadow-[#C61B23]/2"
                >
                  <img 
                    src={src} 
                    alt={`Cambio físico Método JFK ${index + 1}`} 
                    className="w-full h-auto block group-hover:scale-[1.03] transition-all duration-500"
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
              ¿Te ves igual que hace 6 meses?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Si estás estancado/a, es hora de cambiar la estrategia. Todo lo que necesitas para optimizar tus resultados reunido en un solo ecosistema digital de alto rendimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#C61B23]/10 text-[#C61B23] flex items-center justify-center mb-6 group-hover:bg-[#C61B23] group-hover:text-white transition-all">
                  <Dumbbell size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Entrenamiento Inteligente</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Planes adaptados a tu nivel, material disponible y objetivos. Cada ejercicio cuenta con un vídeo explicativo en HD para que ejecutes la técnica de forma impecable y evites lesiones. Registro e indicaciones de intensidad.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#C61B23]/10 text-[#C61B23] flex items-center justify-center mb-6 group-hover:bg-[#C61B23] group-hover:text-white transition-all">
                  <Apple size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Nutrición Flexible</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Menús semanales adaptados a tus gustos y macros. Con recetas saludables, variadas y muy fáciles de preparar que te permitirán disfrutar del proceso sin pasar hambre.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#C61B23]/10 text-[#C61B23] flex items-center justify-center mb-6 group-hover:bg-[#C61B23] group-hover:text-white transition-all">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">Control y Soporte Diario</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Estaremos comunicados a diario a través del chat. Podrás realizar tus revisiones periódicas, registrar tu evolución, fotos y hábitos clave (sueño, pasos, hidratación) y resolver dudas rápidamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Steps Section (from the image steps) */}
        <section id="pasos-comenzar" className="mb-24 md:mb-36 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              ¿Cómo empezar a trabajar juntos?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Sigue estos 3 sencillos pasos para iniciar tu cambio físico y comenzar tu asesoramiento personalizado.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#C61B23]">01.</span> Rellena el cuestionario
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Rellenar el formulario es dar el primer paso para conseguir tu cambio físico y lograr tu objetivo.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#C61B23]">02.</span> Espera a ser contactado/a
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Te mandaré un mensaje por WhatsApp en un plazo máximo de 24 horas para agendar nuestra primera charla.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#12131A]/60 backdrop-blur-md p-6 rounded-3xl border border-white/5 hover:border-[#C61B23]/30 transition-all group flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#C61B23]">03.</span> Comienza tu programa
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Te llamaré para que me cuentes cuál es tu objetivo y podamos resolver tus dudas sobre cómo trabajo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="formulario" className="max-w-3xl mx-auto scroll-mt-20">
          
          {/* Header Card with Crimson red color strip */}
          <div className="relative bg-[#12131A] rounded-t-3xl border-t-[6px] border-[#C61B23] p-8 border-x border-b border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-[#C61B23]">
              <ShieldCheck size={140} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/img/metodo_jfk_logo.png" 
                alt="Método JFK Logo Mini" 
                className="w-10 h-10 rounded-lg object-contain bg-black p-0.5"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Asesorías Método JFK</h2>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              ¡Gracias por interesarte por mi asesoría! Rellena el cuestionario a continuación y me pondré en contacto contigo en las próximas horas para valorar tu caso y empezar a trabajar juntos.
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="bg-[#12131A]/40 backdrop-blur-md border border-white/5 rounded-b-3xl p-12 text-center shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-[#C61B23]/10 text-[#C61B23] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">¡Formulario Recibido!</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Tus respuestas han sido enviadas con éxito. Me pondré en contacto contigo lo antes posible para valorar tu caso y empezar a trabajar en tus metas.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all hover:border-[#C61B23]/30"
              >
                Volver a enviar
              </button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              
              {/* Question 1: Name */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Nombre y Apellidos <span className="text-[#C61B23]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu respuesta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all"
                  />
                </div>
              </div>

              {/* Question 2: Age */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Edad <span className="text-[#C61B23]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="Escribe tu edad"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all"
                  />
                </div>
              </div>

              {/* Question 3: Goal (Multiselect) */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cuál es tu objetivo? <span className="text-[#C61B23]">*</span>
                </label>
                
                <div className="space-y-3">
                  {objectivesList.map((obj, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(obj)}
                          onChange={() => handleCheckboxChange(obj)}
                          className="w-5 h-5 rounded bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 focus:ring-offset-0 focus:ring-2 cursor-pointer transition-all"
                        />
                      </div>
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        {obj}
                      </span>
                    </label>
                  ))}

                  {/* Custom Option "Otro" */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.goals.includes("Otro")}
                        onChange={() => handleCheckboxChange("Otro")}
                        className="w-5 h-5 rounded bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 cursor-pointer transition-all"
                      />
                      <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                        Otro:
                      </span>
                    </label>
                    
                    {formData.goals.includes("Otro") && (
                      <input
                        type="text"
                        placeholder="Escribe tu otro objetivo aquí"
                        value={formData.customGoal}
                        onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                        className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all ml-8 w-[calc(100%-2rem)]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Question 4: Attitude (Radio) */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Con qué actitud entrarías a la asesoría? <span className="text-[#C61B23]">*</span>
                </label>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="attitude"
                        required
                        value="Quiero ver qué tal, no es una prioridad"
                        checked={formData.attitude === "Quiero ver qué tal, no es una prioridad"}
                        onChange={(e) => setFormData({ ...formData, attitude: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Quiero ver qué tal, no es una prioridad
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="attitude"
                        value="Tengo muchas ganas de empezar el cambio y mejorar. ¡Estoy 100% comprometido/a!"
                        checked={formData.attitude === "Tengo muchas ganas de empezar el cambio y mejorar. ¡Estoy 100% comprometido/a!"}
                        onChange={(e) => setFormData({ ...formData, attitude: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Tengo muchas ganas de empezar el cambio y mejorar. ¡Estoy 100% comprometido/a!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question: Como Continuar (Radio) */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Dime cómo quieres continuar: <span className="text-[#C61B23]">*</span>
                </label>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="howToContinue"
                        value="Quiero más información, tengo algunas dudas"
                        checked={formData.howToContinue === "Quiero más información, tengo algunas dudas"}
                        onChange={(e) => setFormData({ ...formData, howToContinue: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Quiero más información, tengo algunas dudas
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="howToContinue"
                        value="Quiero que me envies el formulario para que puedas diseñar y comenzar mi plan!"
                        checked={formData.howToContinue === "Quiero que me envies el formulario para que puedas diseñar y comenzar mi plan!"}
                        onChange={(e) => setFormData({ ...formData, howToContinue: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#090A0F] border border-white/10 text-[#C61B23] focus:ring-[#C61B23]/25 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Quiero que me envies el formulario para que puedas diseñar y comenzar mi plan!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question 5: Expectations (TextArea) */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cómo crees que te puedo ayudar? ¿Qué esperas de la asesoría?
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe tus expectativas detalladas..."
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all resize-none"
                />
              </div>

              {/* Question 6: Phone */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Número de teléfono para ponerme en contacto <span className="text-[#C61B23]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Escribe tu número de teléfono"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all"
                  />
                </div>
              </div>

              {/* Question 7: Email */}
              <div className="bg-[#12131A]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Y correo electrónico para trabajar juntos/as <span className="text-[#C61B23]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Escribe tu correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#C61B23] focus:ring-1 focus:ring-[#C61B23] transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-[#C61B23]/10 border border-[#C61B23]/30 text-[#C61B23] text-sm px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-center bg-[#C61B23] hover:bg-[#a5151c] disabled:bg-[#C61B23]/50 text-white font-extrabold rounded-2xl shadow-xl shadow-[#C61B23]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Enviando respuestas...
                  </>
                ) : (
                  <>
                    Enviar Formulario
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Video Presentation */}
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/5 hover:border-[#C61B23]/25 transition-all shadow-2xl mt-12 mb-16">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/78pn4788INE"
                title="Presentación Método JFK"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Social Media & Footer Branding */}
          <div className="text-center mt-16 mb-8 space-y-4">
            <p className="text-gray-400 text-sm font-semibold">SÍGUEME EN MIS REDES SOCIALES</p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://www.instagram.com/metodo_jfk/" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#C61B23] hover:border-[#C61B23] transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            <div className="text-center text-gray-500 text-xs pt-4">
              © {new Date().getFullYear()} Método JFK. Todos los derechos reservados.<br />
              Impulsado por la plataforma premium <span className="text-[#C61B23] font-semibold">Infinite Coach</span>.
            </div>
          </div>

        </section>

      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.link/qwto85"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        title="Contactar por WhatsApp"
      >
        <span className="absolute -top-12 right-0 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          ¿Dudas? Escríbeme
        </span>
        <svg 
          className="w-8 h-8 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M12.031 2c-5.514 0-9.99 4.478-9.99 9.99 0 2.08.647 4.01 1.747 5.612l-1.144 4.173 4.29-1.127c1.545.922 3.338 1.455 5.26 1.455 5.516 0 10.002-4.478 10.002-9.99C22.005 6.478 17.519 2 12.031 2zm6.273 14.253c-.256.716-1.5 1.401-2.062 1.488-.518.082-1.189.146-3.414-.775-2.845-1.177-4.636-4.075-4.777-4.263-.143-.188-1.152-1.533-1.152-2.924 0-1.392.73-2.072 1.01-2.353.28-.28.616-.352.822-.352.207 0 .414.002.595.01.187.008.438-.073.684.52.256.617.876 2.132.953 2.285.077.154.128.334.026.54-.103.205-.154.333-.307.513-.153.18-.323.401-.462.538-.154.154-.316.323-.136.634.18.31.8 1.309 1.716 2.128.784.7 1.442.92 1.75 1.045.309.125.49.103.673-.105.183-.207.784-.912.994-1.22.21-.309.422-.257.712-.149.29.11 1.842.868 2.152 1.023.31.154.518.23.595.36.078.13.078.752-.178 1.47z"/>
        </svg>
      </a>
    </div>
  );
}
