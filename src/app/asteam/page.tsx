"use client";

import React, { useState } from "react";
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

export default function ASTeamLanding() {
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
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
    <div className="min-h-screen bg-[#0F111A] text-white font-sans antialiased overflow-x-hidden selection:bg-[#fdbfec] selection:text-black">
      {/* Background Orbs & Effects with ASTeam Pink branding */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#fdbfec]/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[500px] h-[500px] rounded-full bg-[#ff6b6b]/4 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#fdbfec]/3 blur-[150px]" />
        
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(rgba(253,191,236,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(253,191,236,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Logo */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <img 
              src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779724548154_Gemini_Generated_Image_vse84nvse84nvse8.png" 
              alt="ASTeam Logo" 
              className="w-12 h-12 rounded-xl object-contain bg-white p-0.5 shadow-lg shadow-[#fdbfec]/10 border border-[#fdbfec]/20"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight">ASTeam</span>
              <span className="text-xs text-[#fdbfec] block font-semibold tracking-widest uppercase">Asesorías</span>
            </div>
          </div>
          <a
            href="#formulario"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-semibold hover:bg-white/10 hover:border-[#fdbfec]/20 transition-all text-[#fdbfec]"
          >
            Empezar Ahora <ChevronRight size={14} />
          </a>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fdbfec]/10 text-[#fdbfec] text-xs font-bold uppercase tracking-wider mb-6 border border-[#fdbfec]/20">
            <Sparkles size={12} /> Exclusivo Plan de Asesoría 1-a-1
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8">
            Lleva tu físico y rendimiento al <span className="text-[#fdbfec] italic font-serif">Siguiente Nivel</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10">
            Únete a ASTeam y accede a nuestra aplicación privada de asesoramiento premium. Todo tu plan de entrenamiento, nutrición y seguimiento diario estructurado de forma inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#formulario"
              className="px-8 py-4 bg-[#fdbfec] text-black font-extrabold rounded-2xl hover:bg-[#efa6db] transition-all shadow-lg shadow-[#fdbfec]/25 flex items-center justify-center gap-2 text-base"
            >
              Comenzar Asesoría <ArrowRight size={18} />
            </a>
            <a
              href="#que-ofrecemos"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center"
            >
              Descubrir la App
            </a>
          </div>
        </section>

        {/* What Client Finds in the App Section */}
        <section id="que-ofrecemos" className="mb-24 md:mb-36 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              ¿Qué encontrarás dentro de la <span className="text-[#fdbfec]">App de ASTeam</span>?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Todo lo que necesitas para optimizar tus resultados reunido en un solo ecosistema digital de alto rendimiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Rutinas */}
            <div className="bg-[#1A1D2B]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#fdbfec]/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#fdbfec]/10 text-[#fdbfec] flex items-center justify-center mb-6 group-hover:bg-[#fdbfec] group-hover:text-black transition-all">
                <Dumbbell size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Rutinas de Entrenamiento a Medida</h3>
              <p className="text-gray-400 leading-relaxed">
                Planes adaptados a tu nivel, material disponible y objetivos. Cada ejercicio cuenta con un vídeo explicativo en HD para que ejecutes la técnica de forma impecable y evites lesiones. Registro e indicaciones de intensidad.
              </p>
            </div>

            {/* Card 2: Nutrición */}
            <div className="bg-[#1A1D2B]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#fdbfec]/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#fdbfec]/10 text-[#fdbfec] flex items-center justify-center mb-6 group-hover:bg-[#fdbfec] group-hover:text-black transition-all">
                <Apple size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Plan de Nutrición Flexible</h3>
              <p className="text-gray-400 leading-relaxed">
                Menús semanales adaptados a tus gustos y macros. Con recetas saludables, variadas y muy fáciles de preparar que te permitirán disfrutar del proceso sin pasar hambre.
              </p>
            </div>

            {/* Card 3: Evolución */}
            <div className="bg-[#1A1D2B]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#ff6b6b]/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#ff6b6b]/10 text-[#ff6b6b] flex items-center justify-center mb-6 group-hover:bg-[#ff6b6b] group-hover:text-black transition-all">
                <LineChart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Control de Hábitos y Evolución</h3>
              <p className="text-gray-400 leading-relaxed">
                Herramienta interactiva para registrar evolución, fotos de progreso y hábitos clave (sueño, pasos, hidratación). Observa tus métricas en gráficos interactivos en tiempo real.
              </p>
            </div>

            {/* Card 4: Soporte */}
            <div className="bg-[#1A1D2B]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-[#fdbfec]/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#fdbfec]/10 text-[#fdbfec] flex items-center justify-center mb-6 group-hover:bg-[#fdbfec] group-hover:text-black transition-all">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Contacto y Chat Directo</h3>
              <p className="text-gray-400 leading-relaxed">
                Estaremos comunicados a diario a través del chat. Podrás realizar tus revisiones periódicas y resolver dudas rápidamente para mantenerte siempre motivado y enfocado.
              </p>
            </div>
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="formulario" className="max-w-3xl mx-auto scroll-mt-20">
          
          {/* Header Card (inspired by Google Form / Premium Cards style) with pink color strip */}
          <div className="relative bg-[#1A1D2B] rounded-t-3xl border-t-[6px] border-[#fdbfec] p-8 border-x border-b border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-[#fdbfec]">
              <ShieldCheck size={140} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779724548154_Gemini_Generated_Image_vse84nvse84nvse8.png" 
                alt="ASTeam Logo Mini" 
                className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Asesorías ASTeam</h2>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              ¡Gracias por interesarte por la asesoría! Rellena el formulario y me pondré en contacto contigo en las próximas horas :)
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="bg-[#1A1D2B]/40 backdrop-blur-md border border-white/5 rounded-b-3xl p-12 text-center shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-[#fdbfec]/10 text-[#fdbfec] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3">¡Formulario Recibido!</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Tus respuestas han sido enviadas con éxito. Me pondré en contacto contigo lo antes posible para valorar tu caso y empezar a trabajar en tus metas.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all hover:border-[#fdbfec]/30"
              >
                Volver a enviar
              </button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Question 1: Name */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Nombre y Apellidos <span className="text-[#ff6b6b]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu respuesta corta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all"
                  />
                </div>
              </div>

              {/* Question 2: Age */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Edad <span className="text-[#ff6b6b]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="Escribe tu respuesta corta"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all"
                  />
                </div>
              </div>

              {/* Question 3: Goal (Multiselect) */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cuál es tu objetivo? <span className="text-[#ff6b6b]">*</span>
                </label>
                
                <div className="space-y-3">
                  {objectivesList.map((obj, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(obj)}
                          onChange={() => handleCheckboxChange(obj)}
                          className="w-5 h-5 rounded bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 focus:ring-offset-0 focus:ring-2 cursor-pointer transition-all"
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
                        className="w-5 h-5 rounded bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 cursor-pointer transition-all"
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
                        className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all ml-8 w-[calc(100%-2rem)]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Question 4: Attitude (Radio) */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Con qué actitud entrarías a la asesoría? <span className="text-[#ff6b6b]">*</span>
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
                        className="w-5 h-5 rounded-full bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 cursor-pointer transition-all"
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
                        className="w-5 h-5 rounded-full bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Tengo muchas ganas de empezar el cambio y mejorar. ¡Estoy 100% comprometido/a!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question: Como Continuar (Radio) */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Dime cómo quieres continuar: <span className="text-[#ff6b6b]">*</span>
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
                        className="w-5 h-5 rounded-full bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 cursor-pointer transition-all"
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
                        className="w-5 h-5 rounded-full bg-[#0F111A] border border-white/10 text-[#fdbfec] focus:ring-[#fdbfec]/20 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base group-hover:text-white transition-colors">
                      Quiero que me envies el formulario para que puedas diseñar y comenzar mi plan!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question 5: Expectations (TextArea) */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  ¿Cómo crees que te puedo ayudar? ¿Qué esperas de la asesoría?
                </label>
                <textarea
                  rows={4}
                  placeholder="Texto de respuesta larga"
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all resize-none"
                />
              </div>

              {/* Question 6: Phone */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Número de teléfono para ponerme en contacto <span className="text-[#ff6b6b]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Escribe tu respuesta corta"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all"
                  />
                </div>
              </div>

              {/* Question 7: Email */}
              <div className="bg-[#1A1D2B]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold text-gray-200">
                  Y correo electrónico para trabajar juntos/as <span className="text-[#ff6b6b]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Escribe tu respuesta corta"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0F111A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fdbfec] focus:ring-1 focus:ring-[#fdbfec] transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] text-sm px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-center bg-[#fdbfec] hover:bg-[#efa6db] disabled:bg-[#efa6db]/50 text-black font-extrabold rounded-2xl shadow-xl shadow-[#fdbfec]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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

          {/* Footer branding */}
          <div className="text-center text-gray-500 text-xs mt-12 mb-8">
            © {new Date().getFullYear()} ASTeam. Todos los derechos reservados.<br />
            Impulsado por la plataforma premium <span className="text-[#fdbfec] font-semibold">Infinite Coach</span>.
          </div>

        </section>

      </div>
    </div>
  );
}
