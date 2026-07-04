"use client";

import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Activity, 
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus
} from "lucide-react";

export default function TrainerDashboard() {
  const [isRedirecting] = useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.hostname === 'coachdemo.infinitecoach.es') {
          if (window.location.search) {
            window.location.replace('/trainer-login.html' + window.location.search);
          } else if (localStorage.getItem('_trainerAuthed') === '1') {
            const activeTrainerId = localStorage.getItem('activeTrainerId') || 'demo';
            window.location.replace('/trainer-dashboard.html?t=' + activeTrainerId);
          } else {
            window.location.replace('/trainer-login.html');
          }
        } else if (window.location.hostname.includes('licencias.ingeniaia.es')) {
          window.location.replace('/admin-login.html');
        } else if (localStorage.getItem('_trainerAuthed') === '1') {
          const activeTrainerId = localStorage.getItem('activeTrainerId') || 'default';
          window.location.replace('/trainer-dashboard.html?t=' + activeTrainerId);
        } else if (localStorage.getItem('clientId')) {
          window.location.replace('/client-dashboard.html?v=534');
        } else if (window.location.hostname.includes('infinitecoach.es')) {
          window.location.replace('/client-login.html?v=534');
        } else {
          window.location.replace('/trainer-login.html');
        }
      } catch (e) {
        window.location.replace('/trainer-login.html');
      }
    }
  }, []);

  const [stats] = useState({
    activeClients: 42,
    monthlyRevenue: "3,250€",
    pendingPayments: 4,
    pendingReviews: 12,
    callsToday: 5
  });

  const recentClients = [
    { name: "Juan Pérez", status: "Active", plan: "Hípertrofia 5 Días" },
    { name: "María García", status: "Active", plan: "Pérdida de Grasa" },
    { name: "Carlos López", status: "Active", plan: "Powerlifting" }
  ];

  if (isRedirecting) {
    return (
      <div style={{
        backgroundColor: '#0B0B1A',
        color: 'white',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderLeftColor: '#00D9FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem' }}>Cargando aplicación...</p>
          <style>{`
            @keyframes spin {
              100% { transform: rotate(362deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-height-screen bg-background text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Buenos días, <span className="text-primary italic">Coach</span>
            </h1>
            <p className="text-gray-400 text-lg">Resumen de tu academia para hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark transition-colors px-6 py-3 rounded-xl text-black font-bold shadow-lg shadow-primary/20">
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Card: Clientes */}
          <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
            <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl group-hover:bg-primary group-hover:text-black transition-all">
              <Users size={24} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stats.activeClients}</div>
            <div className="text-gray-400 text-sm font-medium">Clientes Activos</div>
          </div>

          {/* Card: Ingresos */}
          <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
            <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl group-hover:bg-primary group-hover:text-black transition-all">
              <TrendingUp size={24} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stats.monthlyRevenue}</div>
            <div className="text-gray-400 text-sm font-medium">Ingresos Mes</div>
          </div>

          {/* Card: Pagos */}
          <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-all group">
            <div className="text-accent mb-4 bg-accent/10 w-fit p-3 rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
              <Clock size={24} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stats.pendingPayments}</div>
            <div className="text-gray-400 text-sm font-medium">Pagos Pendientes</div>
          </div>

          {/* Card: Revisiones */}
          <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
            <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl group-hover:bg-primary group-hover:text-black transition-all">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stats.pendingReviews}</div>
            <div className="text-gray-400 text-sm font-medium">Revisiones Hoy</div>
          </div>

          {/* Card: Llamadas */}
          <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-all group">
            <div className="text-accent mb-4 bg-accent/10 w-fit p-3 rounded-xl group-hover:bg-accent group-hover:text-black transition-all">
              <Phone size={24} />
            </div>
            <div className="text-3xl font-bold mb-1 tracking-tight">{stats.callsToday}</div>
            <div className="text-gray-400 text-sm font-medium">Llamadas Hoy</div>
          </div>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-8 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="text-primary" size={20} />
                  Últimos Clientes
                </h3>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  Ver todos <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {recentClients.map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background border border-white/5 hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.plan}</div>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                 <Calendar size={120} />
               </div>
               <h3 className="text-xl font-bold mb-4">Agenda Semanal</h3>
               <p className="text-gray-400 text-sm mb-6">Tienes 5 llamadas para hoy. Revisa los horarios y el material de apoyo.</p>
               <button className="w-full py-4 text-center bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-all hover:text-primary">
                 Ir al Calendario
               </button>
            </div>
            
            <div className="bg-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                 <MessageSquare size={120} />
               </div>
               <h3 className="text-xl font-bold mb-4">Feedbacks Recientes</h3>
               <p className="text-gray-400 text-sm mb-6">Recibiste 12 revisiones en las últimas 24h que necesitan respuesta.</p>
               <button className="w-full py-4 text-center bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all border border-primary/20 hover:border-primary">
                 Gestionar Revisiones
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
