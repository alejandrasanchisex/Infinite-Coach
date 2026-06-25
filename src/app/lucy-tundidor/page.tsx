"use client";

import React, { useState } from "react";
import {
  Dumbbell,
  Apple,
  Heart,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  User,
  CheckCircle,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";

export default function LucyTundidorLanding() {
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
    "Ganar fuerza y tonificar",
    "Pérdida de grasa de forma saludable",
    "Desarrollo personal y bienestar mental"
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
        toEmail: "lucytundidor@gmail.com",
        brand: "Lucy Tundidor",
        primaryColor: "#816e61",
        subject: "Nuevo formulario - Web Lucy Tundidor"
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
    <div className="min-h-screen bg-[#faf7f5] text-[#2b2520] font-sans antialiased overflow-x-hidden selection:bg-[#816e61] selection:text-white relative">
      {/* Background Orbs & Effects with Lucy's warm taupe branding */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#816e61]/5 blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] w-[500px] h-[500px] rounded-full bg-[#a79788]/6 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#816e61]/4 blur-[150px]" />
        
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(rgba(129,110,97,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(129,110,97,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Logo */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <img 
              src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/lucy_logo_cropped.png?v=2" 
              alt="Lucy Tundidor Logo" 
              className="w-12 h-12 rounded-xl object-contain bg-white p-0.5 shadow-md shadow-[#816e61]/10 border border-[#816e61]/20"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight block">Lucy Tundidor</span>
              <span className="text-xs text-[#816e61] block font-bold tracking-widest uppercase">Coaching</span>
            </div>
          </div>
          <a
            href="#formulario"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#816e61]/20 bg-white text-sm font-semibold hover:bg-[#faf7f5] hover:border-[#816e61] transition-all text-[#816e61] shadow-sm"
          >
            Empezar Ahora <ChevronRight size={14} />
          </a>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#816e61]/10 text-[#816e61] text-xs font-bold uppercase tracking-wider mb-6 border border-[#816e61]/20">
            <Sparkles size={12} className="text-[#816e61]" /> Exclusivo Plan de Asesoría 1-a-1
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8 text-[#2b2520]">
            Entrenamiento, nutrición y <span className="text-[#816e61] italic font-serif">desarrollo personal</span>
          </h1>
          
          {/* Prominent Slogan Block */}
          <p className="text-[#615349] text-lg sm:text-xl font-medium leading-relaxed italic mb-10 max-w-2xl mx-auto">
            🌸 Para mujeres cansadas de un fitness lleno de ruido.
          </p>

          <p className="text-[#615349] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Únete a mi asesoría y accede a mi <strong>aplicación móvil privada</strong>. Todo tu plan de entrenamiento, nutrición, mentalidad y seguimiento diario estructurado de forma personalizada en la palma de tu mano.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#formulario"
              className="px-8 py-4 bg-[#816e61] text-white font-extrabold rounded-2xl hover:bg-[#6c5a4f] transition-all shadow-lg shadow-[#816e61]/25 flex items-center justify-center gap-2 text-base"
            >
              Comenzar Asesoría <ArrowRight size={18} />
            </a>
            <a
              href="#que-ofrecemos"
              className="px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-[#615349] font-bold rounded-2xl transition-all flex items-center justify-center shadow-sm"
            >
              Descubrir la App Móvil
            </a>
          </div>
        </section>

        {/* Mobile App Promo Banner */}
        <section className="mb-24 md:mb-36">
          <div className="bg-white rounded-3xl border border-[#816e61]/10 p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#816e61]/10 text-[#816e61] text-xs font-bold uppercase tracking-wider">
                <Smartphone size={14} /> Todo en tu Móvil
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2b2520]">
                Tu plan de asesoría siempre contigo con mi App Móvil
              </h2>
              <p className="text-[#615349] text-sm sm:text-base leading-relaxed">
                Sin PDFs confusos ni mensajes perdidos. Accede a tus rutinas de ejercicios, registra tus comidas, controla tus métricas diarias y mantén contacto directo conmigo para guiarte en todo momento.
              </p>
            </div>
            <div className="flex items-center justify-center bg-[#faf7f5] p-6 rounded-2xl border border-gray-100 w-full md:w-auto min-w-[240px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#816e61]/10 text-[#816e61] flex items-center justify-center mx-auto mb-3">
                  <Smartphone size={24} />
                </div>
                <div className="font-extrabold text-[#2b2520] text-sm">Infinite Coach App</div>
                <div className="text-xs text-gray-500 mt-1">Disponible para iOS y Android</div>
              </div>
            </div>
          </div>
        </section>

        {/* What Client Finds in the App Section */}
        <section id="que-ofrecemos" className="mb-24 md:mb-36 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-[#2b2520]">
              ¿Qué encontrarás dentro de mi <span className="text-[#816e61]">App Móvil</span>?
            </h2>
            <p className="text-[#615349] max-w-xl mx-auto">
              Todo lo que necesitas para tu transformación física y bienestar mental reunido en un solo ecosistema digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Rutinas */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#816e61]/30 transition-all group shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#816e61]/10 text-[#816e61] flex items-center justify-center mb-6 group-hover:bg-[#816e61] group-hover:text-white transition-all">
                  <Dumbbell size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2b2520]">Rutinas de Entrenamiento Consciente</h3>
                <p className="text-[#615349] leading-relaxed text-sm">
                  Planes adaptados a ti, a tu nivel y al material del que dispongas, estructurados de forma óptima para asegurar una ejecución impecable, maximizar tus resultados y entrenar de forma segura.
                </p>
              </div>
            </div>

            {/* Card 2: Nutrición */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#816e61]/30 transition-all group shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#816e61]/10 text-[#816e61] flex items-center justify-center mb-6 group-hover:bg-[#816e61] group-hover:text-white transition-all">
                  <Apple size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2b2520]">Plan de Nutrición Flexible</h3>
                <p className="text-[#615349] leading-relaxed text-sm">
                  Planes de alimentación adaptados a tus necesidades energéticas, gustos y estilo de vida. Disfruta de recetas variadas, ricas y sencillas de cocinar que demuestran que comer saludable puede ser un placer diario.
                </p>
              </div>
            </div>

            {/* Card 3: Evolución y Hábitos */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#816e61]/30 transition-all group shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#a79788]/10 text-[#a79788] flex items-center justify-center mb-6 group-hover:bg-[#a79788] group-hover:text-white transition-all">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2b2520]">Hábitos, Bienestar y Ciclos</h3>
                <p className="text-[#615349] leading-relaxed text-sm">
                  Registra de manera interactiva tus fotos de progreso, peso, nivel de energía, horas de sueño, hidratación y estado de ánimo. Analiza tus cambios a través de gráficos integrados directamente en la aplicación.
                </p>
              </div>
            </div>

            {/* Card 4: Soporte */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#816e61]/30 transition-all group shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#816e61]/10 text-[#816e61] flex items-center justify-center mb-6 group-hover:bg-[#816e61] group-hover:text-white transition-all">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#2b2520]">Desarrollo Personal y Soporte Diario</h3>
                <p className="text-[#615349] leading-relaxed text-sm">
                  Tendrás soporte directo conmigo para resolver todas tus dudas a diario y valorar tus avances periódicamente, garantizando que te mantengas motivada y alineada con tus objetivos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="formulario" className="max-w-3xl mx-auto scroll-mt-20">
          
          {/* Header Card */}
          <div className="relative bg-white rounded-t-3xl border-t-[6px] border-[#816e61] p-8 border-x border-b border-gray-100 shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-[#816e61]">
              <ShieldCheck size={140} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/lucy_logo_cropped.png?v=2" 
                alt="Lucy Tundidor Logo Mini" 
                className="w-10 h-10 rounded-lg object-contain bg-[#faf7f5] p-0.5 border border-gray-100"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2b2520]">Unirse a la Asesoría</h2>
            </div>
            <p className="text-[#615349] text-sm sm:text-base leading-relaxed">
              Completa el cuestionario a continuación de la forma más detallada posible. Analizaré personalmente tu caso y me pondré en contacto contigo para valorar tu admisión en el programa.
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="bg-white border border-gray-100 rounded-b-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 rounded-full bg-[#816e61]/10 text-[#816e61] flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#2b2520]">¡Cuestionario Enviado!</h3>
              <p className="text-[#615349] max-w-md mx-auto mb-8 text-sm sm:text-base">
                Tus respuestas se han guardado con éxito. Lucy analizará tu perfil personalmente y se pondrá en contacto contigo en las próximas horas.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 bg-[#faf7f5] hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold transition-all text-[#615349]"
              >
                Volver a enviar
              </button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              
              {/* Question 1: Name */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  Nombre y Apellidos <span className="text-[#816e61]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu respuesta"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all"
                  />
                </div>
              </div>

              {/* Question 2: Age */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  Edad <span className="text-[#816e61]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="Escribe tu edad"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all"
                  />
                </div>
              </div>

              {/* Question 3: Goal (Multiselect) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  ¿Cuál es tu objetivo? <span className="text-[#816e61]">*</span>
                </label>
                
                <div className="space-y-3">
                  {objectivesList.map((obj, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(obj)}
                          onChange={() => handleCheckboxChange(obj)}
                          className="w-5 h-5 rounded bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                        />
                      </div>
                      <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
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
                        className="w-5 h-5 rounded bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                      />
                      <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
                        Otro:
                      </span>
                    </label>
                    
                    {formData.goals.includes("Otro") && (
                      <input
                        type="text"
                        placeholder="Escribe tu otro objetivo aquí"
                        value={formData.customGoal}
                        onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                        className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-3 px-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all ml-8 w-[calc(100%-2rem)]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Question 4: Attitude (Radio) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  ¿Con qué nivel de compromiso entras a la asesoría? <span className="text-[#816e61]">*</span>
                </label>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="attitude"
                        required
                        value="Quiero ver de qué se trata, no es mi prioridad actual"
                        checked={formData.attitude === "Quiero ver de qué se trata, no es mi prioridad actual"}
                        onChange={(e) => setFormData({ ...formData, attitude: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                      />
                    </div>
                    <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
                      Quiero ver de qué se trata, no es mi prioridad actual
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="attitude"
                        value="¡Estoy al 100% y lista para darlo todo por mi cambio!"
                        checked={formData.attitude === "¡Estoy al 100% y lista para darlo todo por mi cambio!"}
                        onChange={(e) => setFormData({ ...formData, attitude: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                      />
                    </div>
                    <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
                      ¡Estoy al 100% y lista para darlo todo por mi cambio!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question: Como Continuar (Radio) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  ¿Cómo prefieres que continuemos? <span className="text-[#816e61]">*</span>
                </label>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="howToContinue"
                        value="Quiero más información general porque tengo algunas dudas"
                        checked={formData.howToContinue === "Quiero más información general porque tengo algunas dudas"}
                        onChange={(e) => setFormData({ ...formData, howToContinue: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                      />
                    </div>
                    <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
                      Quiero más información general porque tengo algunas dudas
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        name="howToContinue"
                        value="¡Quiero que me envíes el formulario de admisión completo para empezar cuanto antes!"
                        checked={formData.howToContinue === "¡Quiero que me envíes el formulario de admisión completo para empezar cuanto antes!"}
                        onChange={(e) => setFormData({ ...formData, howToContinue: e.target.value })}
                        className="w-5 h-5 rounded-full bg-[#faf7f5] border-gray-300 text-[#816e61] focus:ring-[#816e61]/20 cursor-pointer transition-all accent-[#816e61]"
                      />
                    </div>
                    <span className="text-[#615349] text-sm sm:text-base group-hover:text-[#2b2520] transition-colors">
                      ¡Quiero que me envíes el formulario de admisión completo para empezar cuanto antes!
                    </span>
                  </label>
                </div>
              </div>

              {/* Question 5: Expectations (TextArea) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  ¿Qué esperas conseguir y cómo crees que puedo ayudarte?
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe tu respuesta detalladamente"
                  value={formData.expectations}
                  onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                  className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-4 px-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all resize-none"
                />
              </div>

              {/* Question 6: Phone */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  Número de teléfono para contacto rápido (WhatsApp) <span className="text-[#816e61]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Escribe tu número de teléfono"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all"
                  />
                </div>
              </div>

              {/* Question 7: Email */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
                <label className="block text-base font-bold text-[#2b2520]">
                  Dirección de correo electrónico <span className="text-[#816e61]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Escribe tu correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#faf7f5] border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-[#2b2520] placeholder-gray-400 focus:outline-none focus:border-[#816e61] focus:ring-1 focus:ring-[#816e61] transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-center bg-[#816e61] hover:bg-[#6c5a4f] disabled:bg-[#816e61]/50 text-white font-extrabold rounded-2xl shadow-xl shadow-[#816e61]/10 transition-all cursor-pointer flex items-center justify-center gap-2"
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

          {/* Footer branding */}
          <div className="text-center text-gray-500 text-xs mt-16 mb-8">
            © {new Date().getFullYear()} Lucy Tundidor. Todos los derechos reservados.<br />
            Impulsado por la plataforma premium <span className="text-[#816e61] font-semibold">Infinite Coach</span>.
          </div>

        </section>

      </div>
    </div>
  );
}
