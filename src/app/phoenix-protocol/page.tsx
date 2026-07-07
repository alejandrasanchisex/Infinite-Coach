"use client";

import React, { useState, useRef } from "react";
import {
  Flame,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  Apple,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function PhoenixProtocolLanding() {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll function for transformations carousel
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
    "Ganar masa muscular y fuerza (Hipertrofia)",
    "Pérdida de grasa y definición máxima",
    "Aumento de disciplina y hábitos inquebrantables",
    "Recomposición corporal (ganar músculo y perder grasa)"
  ];

  const transformations = [
    {
      image: "/img/phoenix_transform_1.jpg",
      name: "Cambio Físico Radical",
      desc: "Recomposición corporal con pérdida de grasa y ganancia muscular simultánea.",
      label: "-6 KG EN 20 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_2.jpg",
      name: "Construcción de Masa Muscular",
      desc: "Transformación a largo plazo ganando densidad, fuerza y volumen muscular limpio.",
      label: "+20 KG EN 6 AÑOS"
    },
    {
      image: "/img/phoenix_transform_3.jpg",
      name: "Definición y Pérdida de Grasa",
      desc: "Reducción drástica del porcentaje de grasa corporal revelando la musculatura.",
      label: "-9 KG EN 20 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_4.jpg",
      name: "Recomposición Rápida",
      desc: "Pérdida de grasa rebelde en la zona abdominal y tonificación general.",
      label: "-7 KG EN 12 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_5.jpg",
      name: "Evolución de Ectomorfo",
      desc: "Superación del estado 'skinny-fat' para lograr un físico atlético, fuerte y saludable.",
      label: "+5 KG EN 24 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_6.jpg",
      name: "Definición y Vientre Plano",
      desc: "Pérdida de grasa localizada en el abdomen y mejora en la definición de la musculatura abdominal.",
      label: "-4 KG EN 24 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_7.jpg",
      name: "Recomposición Muscular Estética",
      desc: "Reducción de grasa y aumento de masa muscular magra en el mismo peso, logrando un físico más estético.",
      label: "= KG EN 8 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_8.jpg",
      name: "Pérdida de Peso y Volumen",
      desc: "Eliminación de grasa corporal general y retención de líquidos con marcada mejora en la postura.",
      label: "-7 KG EN 24 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_9.jpg",
      name: "Definición y Densidad",
      desc: "Mantenimiento del peso total pero con una ganancia notable en densidad muscular y reducción de porcentaje graso.",
      label: "= KG EN 8 SEMANAS"
    },
    {
      image: "/img/phoenix_transform_10.jpg",
      name: "Definición Corporal Avanzada",
      desc: "Pérdida de grasa subcutánea y mejora del tono muscular en todo el core.",
      label: "-6 KG EN 20 SEMANAS"
    }
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
    if (!formData.attitude) return setErrorMsg("Por favor, responde a tu nivel de compromiso.");
    if (!formData.howToContinue) return setErrorMsg("Por favor, selecciona cómo quieres continuar.");
    if (!formData.phone.trim()) return setErrorMsg("El número de teléfono es obligatorio.");
    if (!formData.email.trim()) return setErrorMsg("El correo electrónico es obligatorio.");

    setLoading(true);

    try {
      const payload = {
        ...formData,
        toEmail: "brianarribas@gmail.com",
        brand: "Phoenix Protocol",
        primaryColor: "#E50914",
        subject: "Nuevo formulario - Web Phoenix Protocol"
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
    <div className="min-h-screen bg-[#0b0a0a] text-[#ffffff] font-sans antialiased overflow-x-hidden selection:bg-[#E50914] selection:text-white relative">
      
      {/* Background Glow Orbs & Effects */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#E50914]/12 blur-[130px]" />
        <div className="absolute top-[25%] -right-[15%] w-[550px] h-[550px] rounded-full bg-[#E50914]/8 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[750px] h-[750px] rounded-full bg-[#e65c00]/6 blur-[160px]" />
        
        {/* Subtle grid lines background overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `linear-gradient(rgba(229,9,20,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(229,9,20,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Logo */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            {/* Custom Glowing SVG Phoenix Logo */}
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center p-1.5 shadow-lg shadow-[#E50914]/25 border border-[#E50914]/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#E50914] drop-shadow-[0_0_8px_#E50914]" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight block uppercase text-white">Phoenix Protocol</span>
              <span className="text-[10px] text-[#E50914] block font-bold tracking-widest uppercase">Brian Arribas</span>
            </div>
          </div>
          <a
            href="#cuestionario"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#E50914]/30 bg-black/60 text-sm font-bold uppercase tracking-wider hover:bg-[#E50914] hover:text-white transition-all text-[#E50914] shadow-md shadow-[#E50914]/5"
          >
            Domina tu Fuego <Flame size={14} className="animate-pulse" />
          </a>
        </header>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-24 md:mb-36">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold uppercase tracking-wider mb-6 border border-[#E50914]/20">
            <Zap size={12} className="animate-bounce" /> Programa de Alto Rendimiento 1-a-1
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-8 uppercase text-white">
            Phoenix <span className="text-[#E50914] italic font-serif">Protocol</span>
          </h1>
          
          <p className="text-[#e2e8f0] text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Mi sistema privado. 6 meses contigo, mano a mano, para hombres listos para resurgir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cuestionario"
              className="px-8 py-4 bg-[#E50914] hover:bg-[#c40710] text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#E50914]/30 flex items-center justify-center gap-2 text-base"
            >
              Domina tu Fuego <Flame size={18} />
            </a>
            <a
              href="#metodo"
              className="px-8 py-4 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-sm"
            >
              Ver el Método
            </a>
          </div>
        </section>

        {/* Metodo Section */}
        <section id="metodo" className="mb-24 md:mb-36 scroll-mt-20">
          <div className="bg-[#141313] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E50914]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl space-y-6">
              <span className="text-[#E50914] text-xs font-extrabold uppercase tracking-widest block">El Concepto</span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                No es solo entrenar. <span className="text-[#E50914] italic">Es renacer.</span>
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                Por eso me senté a construir el sistema que les faltaba a esos hombres. Phoenix Protocol no es un programa fitness. Es lo que separa al hombre que eras del que vas a ser. A través de tu cuerpo y mente.
              </p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-gray-400 italic">
                  "Phoenix Protocol no es para todos. Es para hombres hartos de ir a medias, dispuestos a invertir 6 meses para hacerlo bien de una vez."
                </p>
              </div>
            </div>

            {/* Metodología posts grid */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/5] shadow-lg shadow-black/50">
                <img src="/img/phoenix_metodo_1.jpg" alt="Metodología 1" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/5] shadow-lg shadow-black/50">
                <img src="/img/phoenix_metodo_2.jpg" alt="Metodología 2" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/5] shadow-lg shadow-black/50">
                <img src="/img/phoenix_metodo_3.jpg" alt="Metodología 3" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/5] shadow-lg shadow-black/50">
                <img src="/img/phoenix_metodo_4.jpg" alt="Metodología 4" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 aspect-[4/5] shadow-lg shadow-black/50 col-span-1 sm:col-span-2 md:col-span-1">
                <img src="/img/phoenix_metodo_5.jpg" alt="Metodología 5" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Achievables Section */}
        <section className="mb-24 md:mb-36">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-white">Dentro del Protocolo Conseguirás</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              El camino estructurado de forma quirúrgica para que actúes sin tener que pensar en el proceso.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#141313] p-8 rounded-2xl border border-white/5 hover:border-[#E50914]/30 transition-all group flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center shrink-0 group-hover:bg-[#E50914] group-hover:text-white transition-all">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase mb-2 text-white">El Físico de tus Sueños</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Construcción de masa muscular sin grasa y optimización corporal total. Un físico estético y atlético del que te sientas orgulloso.
                </p>
              </div>
            </div>

            <div className="bg-[#141313] p-8 rounded-2xl border border-white/5 hover:border-[#E50914]/30 transition-all group flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center shrink-0 group-hover:bg-[#E50914] group-hover:text-white transition-all">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase mb-2 text-white">Paso a Paso Quirúrgico</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Te doy la pauta exacta de alimentación y entreno de forma tan estructurada que no tendrás que pensar nada. Solo ejecutar y avanzar.
                </p>
              </div>
            </div>

            <div className="bg-[#141313] p-8 rounded-2xl border border-white/5 hover:border-[#E50914]/30 transition-all group flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center shrink-0 group-hover:bg-[#E50914] group-hover:text-white transition-all">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase mb-2 text-white">Confianza y Liderazgo</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Aumento radical de la confianza en ti mismo. La disciplina que construyes en los entrenamientos se traslada a tu vida diaria y tus metas.
                </p>
              </div>
            </div>

            <div className="bg-[#141313] p-8 rounded-2xl border border-white/5 hover:border-[#E50914]/30 transition-all group flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center shrink-0 group-hover:bg-[#E50914] group-hover:text-white transition-all">
                <Flame size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold uppercase mb-2 text-white">Volver a Respetarte</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Volver a respetarte cuando te miras al espejo. Eliminarás la pereza mental y sabrás que cumples diariamente con lo que te propones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* App Section */}
        <section className="mb-24 md:mb-36">
          <div className="bg-[#141313] rounded-3xl border border-white/5 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-bold uppercase tracking-wider border border-[#E50914]/20">
                <Smartphone size={14} /> App Phoenix Protocol
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Tu plan de asesoría siempre contigo
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Sin PDFs confusos ni mensajes perdidos. Accede a tus rutinas de ejercicios estructuradas, registra tus marcas, controla tus comidas y mantén contacto directo conmigo. Todo centralizado en tu móvil para asegurar un seguimiento quirúrgico diario.
              </p>
            </div>
            <div className="flex items-center justify-center bg-black/60 p-8 rounded-2xl border border-white/5 w-full md:w-auto min-w-[260px] shadow-inner">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 text-[#E50914] flex items-center justify-center mx-auto mb-3 border border-[#E50914]/20 shadow-md">
                  <Smartphone size={24} />
                </div>
                <div className="font-extrabold text-white text-sm uppercase tracking-wide">Phoenix Protocol App</div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">Desarrollado por Infinite Coach</div>
                <div className="text-[10px] text-[#E50914] mt-2 font-bold uppercase">Disponible para iOS y Android</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Cases Placeholder */}
        <section className="mb-24 md:mb-36">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[#E50914] text-xs font-extrabold uppercase tracking-widest block mb-2">Transformaciones</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Casos de Éxito</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-[#E50914] flex items-center justify-center text-white hover:text-[#E50914] transition-all bg-black/50"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-[#E50914] flex items-center justify-center text-white hover:text-[#E50914] transition-all bg-black/50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
          >
            {transformations.map((t, idx) => (
              <div 
                key={idx}
                className="min-w-[280px] sm:min-w-[350px] bg-[#141313] border border-white/5 rounded-2xl p-6 snap-start shrink-0 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-[4/5] relative rounded-xl mb-4 overflow-hidden border border-white/5 bg-black/40">
                    <img 
                      src={t.image} 
                      alt={t.label} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-extrabold uppercase text-white mb-1">{t.name}</h3>
                  <p className="text-xs text-[#E50914] font-bold uppercase tracking-wider mb-2">{t.label}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lead Form Section */}
        <section id="cuestionario" className="max-w-3xl mx-auto scroll-mt-20">
          <div className="relative bg-[#141313] rounded-t-3xl border-t-[6px] border-[#E50914] p-8 border-x border-b border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none text-[#E50914]">
              <Flame size={140} />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center p-1 border border-[#E50914]/20 shadow-md">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#E50914]" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">Unirse al Equipo</h2>
            </div>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Completa el cuestionario a continuación con la máxima precisión posible. Analizaré personalmente tu caso y me pondré en contacto contigo para valorar tu admisión en Phoenix Protocol.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#141313] border border-white/5 rounded-b-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#E50914]/10 text-[#E50914] flex items-center justify-center mx-auto border border-[#E50914]/20">
                <ShieldCheck size={36} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">Solicitud Recibida</h3>
              <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
                Tu postulación se ha registrado con éxito. Revisaré personalmente tu perfil en las próximas horas y me pondré en contacto contigo a través de WhatsApp para valorar tu entrada.
              </p>
              <div className="pt-4">
                <a
                  href="https://wa.link/v1rxmh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold uppercase rounded-xl transition-all shadow-lg"
                >
                  Contactar Directamente en WhatsApp <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              
              {/* Field: Name */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">Nombre y Apellidos <span className="text-[#E50914]">*</span></label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Field: Age */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">Edad <span className="text-[#E50914]">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="Escribe tu edad"
                    className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              {/* Field: Objectives */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">¿Cuál es tu objetivo? <span className="text-[#E50914]">*</span></label>
                <div className="space-y-3">
                  {objectivesList.map(option => (
                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                          checked={formData.goals.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                        />
                      </div>
                      <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">{option}</span>
                    </label>
                  ))}
                  
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                        checked={!!formData.customGoal}
                        onChange={e => {
                          if (!e.target.checked) setFormData({ ...formData, customGoal: "" });
                        }}
                      />
                      <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">Otro:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Escribe otro objetivo"
                      className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                      value={formData.customGoal}
                      onChange={e => setFormData({ ...formData, customGoal: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Field: Commitment Level */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">¿Con qué nivel de compromiso entras? <span className="text-[#E50914]">*</span></label>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        required
                        className="w-5 h-5 rounded-full bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                        name="commitment"
                        value="Quiero probar a ver qué tal, sin prisas"
                        checked={formData.attitude === "Quiero probar a ver qué tal, sin prisas"}
                        onChange={e => setFormData({ ...formData, attitude: e.target.value })}
                      />
                    </div>
                    <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">Quiero probar a ver qué tal, sin prisas</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        className="w-5 h-5 rounded-full bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                        name="commitment"
                        value="¡Estoy al 100% y dispuesto a darlo todo por mi cambio! 🔥"
                        checked={formData.attitude === "¡Estoy al 100% y dispuesto a darlo todo por mi cambio! 🔥"}
                        onChange={e => setFormData({ ...formData, attitude: e.target.value })}
                      />
                    </div>
                    <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">¡Estoy al 100% y dispuesto a darlo todo por mi cambio! 🔥</span>
                  </label>
                </div>
              </div>

              {/* Field: Phone */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">Número de WhatsApp <span className="text-[#E50914]">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="Escribe tu número de teléfono"
                    className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Field: Email */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">Dirección de correo <span className="text-[#E50914]">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Field: Expectations */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">¿Qué esperas conseguir y cómo crees que puedo ayudarte?</label>
                <textarea
                  rows={4}
                  placeholder="Detalla tu situación física actual, tu experiencia entrenando y tus expectativas..."
                  className="w-full bg-[#0b0a0a] border border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all resize-none"
                  value={formData.expectations}
                  onChange={e => setFormData({ ...formData, expectations: e.target.value })}
                />
              </div>

              {/* Field: How to Continue */}
              <div className="bg-[#141313] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
                <label className="block text-base font-bold uppercase tracking-wide text-white">¿Cómo prefieres que continuemos? <span className="text-[#E50914]">*</span></label>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        required
                        className="w-5 h-5 rounded-full bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                        name="howToContinue"
                        value="Quiero más información porque tengo algunas dudas"
                        checked={formData.howToContinue === "Quiero más información porque tengo algunas dudas"}
                        onChange={e => setFormData({ ...formData, howToContinue: e.target.value })}
                      />
                    </div>
                    <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">Quiero más información porque tengo algunas dudas</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="radio"
                        className="w-5 h-5 rounded-full bg-[#0b0a0a] border-white/10 text-[#E50914] focus:ring-[#E50914]/20 cursor-pointer transition-all accent-[#E50914]"
                        name="howToContinue"
                        value="¡Quiero entrar ya al equipo y empezar a trabajar!"
                        checked={formData.howToContinue === "¡Quiero entrar ya al equipo y empezar a trabajar!"}
                        onChange={e => setFormData({ ...formData, howToContinue: e.target.value })}
                      />
                    </div>
                    <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">¡Quiero entrar ya al equipo y empezar a trabajar!</span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-center bg-[#E50914] hover:bg-[#c40710] disabled:bg-[#E50914]/50 text-white font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-[#E50914]/10"
              >
                {loading ? "Procesando..." : "Enviar Formulario"} <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="text-center text-gray-600 text-xs mt-16 mb-8 uppercase tracking-widest font-semibold">
            © 2026 Phoenix Protocol. Todos los derechos reservados.<br />
            Impulsado por la plataforma premium <span className="text-[#E50914] font-bold">Infinite Coach</span>.
          </div>
        </section>

      </div>
    </div>
  );
}
