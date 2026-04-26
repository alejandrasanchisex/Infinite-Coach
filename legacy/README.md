# 💪 Plataforma Fitness Multi-Entrenador

Aplicación web completa para gestión de asesorías fitness con interfaces separadas para entrenadores y clientes.

## 🚀 Características Principales

### Para Entrenadores
- ✅ **Dashboard** con métricas de negocio (ingresos, clientes activos, pagos pendientes)
- 👥 **Gestión de Clientes** completa (añadir, editar, eliminar, fichas técnicas)
- 💪 **Creador de Rutinas** personalizadas con ejercicios, series, repeticiones
- 🥗 **Creador de Dietas** con planes semanales y cálculo de macros
- 📚 **Biblioteca Multimedia** para vídeos de técnicas y fotos de recetas
- 📅 **Agenda de Citas** para llamadas y reuniones
- 💬 **Integración WhatsApp** para contacto directo

### Para Clientes
- 📊 **Dashboard Personal** con ficha técnica y métricas (peso, altura, IMC)
- 🥗 **Visualización de Dieta** semanal con macros detallados
- 💪 **Visualización de Rutina** de entrenamiento por días
- 📝 **Sistema de Feedback** semanal con valoraciones y comentarios
- 💬 **Contacto WhatsApp** directo con el entrenador
- 🔐 **Acceso por Código** único generado por el entrenador

## 🎨 Personalización de Marca

Cada entrenador puede configurar:
- Nombre del negocio
- Logo personalizado
- Colores de marca (primario, secundario, acento)
- Número de WhatsApp para contacto

## 📦 Instalación y Uso

### Opción 1: Abrir directamente
1. Abre `index.html` en tu navegador
2. Completa el asistente de configuración inicial
3. ¡Listo! Ya puedes empezar a usar la plataforma

### Opción 2: Servidor local (recomendado)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Luego abre: http://localhost:8000
```

## 🗂️ Estructura del Proyecto

```
App Fitness/
├── index.html                    # Configuración inicial
├── trainer-dashboard.html        # Dashboard del entrenador
├── trainer-clients.html          # Gestión de clientes
├── trainer-routines.html         # Gestión de rutinas
├── trainer-diets.html            # Gestión de dietas
├── trainer-media.html            # Biblioteca multimedia
├── trainer-appointments.html     # Agenda de citas
├── client-login.html             # Login de clientes
├── client-dashboard.html         # Dashboard del cliente
├── client-diet.html              # Vista de dieta del cliente
├── client-routine.html           # Vista de rutina del cliente
├── client-feedback.html          # Formulario de revisión
├── js/
│   ├── data-models.js            # Modelos de datos y CRUD
│   └── utils.js                  # Funciones auxiliares
├── styles/
│   ├── theme.css                 # Sistema de diseño
│   └── components.css            # Componentes UI
└── data/
    ├── sample-routines.json      # Rutinas de ejemplo
    └── sample-diets.json         # Dietas de ejemplo
```

## 💾 Almacenamiento de Datos

La aplicación utiliza **LocalStorage** del navegador para guardar todos los datos:
- Configuración de marca
- Clientes y fichas técnicas
- Rutinas de entrenamiento
- Planes nutricionales
- Feedbacks y revisiones
- Citas programadas

⚠️ **Importante**: Los datos se guardan en el navegador. Si borras el caché o cambias de navegador, perderás la información. Para producción, se recomienda migrar a una base de datos en la nube.

## 📱 Flujo de Trabajo

### Configuración Inicial (Entrenador)
1. Abre la aplicación por primera vez
2. Completa el asistente de configuración:
   - Nombre del negocio
   - Logo (opcional)
   - Colores de marca
   - Número de WhatsApp
3. Marca la opción de cargar datos de ejemplo (recomendado)

### Añadir un Cliente
1. Ve a "Clientes" → "Nuevo Cliente"
2. Rellena los datos del cliente
3. Se genera automáticamente un **código de acceso** (ej: ABC12345)
4. Comparte este código con tu cliente

### Asignar Rutina y Dieta
1. Crea rutinas en "Rutinas" (o usa las de ejemplo)
2. Crea dietas en "Dietas" (o usa las de ejemplo)
3. En la ficha del cliente, asigna rutina y dieta

### Acceso del Cliente
1. El cliente abre `client-login.html`
2. Introduce el código de acceso proporcionado
3. Accede a su dashboard personalizado
4. Puede ver su dieta, rutina y enviar feedback semanal

## 🔧 Tecnologías Utilizadas

- **HTML5** - Estructura
- **CSS3** - Estilos (CSS Variables para temas dinámicos)
- **JavaScript Vanilla** - Lógica (sin frameworks)
- **LocalStorage API** - Persistencia de datos
- **Google Fonts** (Inter) - Tipografía

## 🎯 Datos de Ejemplo Incluidos

### Rutinas
1. Fullbody 3x Semana (Principiantes)
2. Push/Pull/Legs (Intermedios)
3. Hipertrofia 5 Días (Avanzados)
4. Pérdida de Grasa HIIT
5. Fuerza Powerlifting

### Dietas
1. Déficit Calórico 1800 kcal
2. Mantenimiento 2200 kcal
3. Volumen 2800 kcal
4. Dieta Flexible IIFYM
5. Dieta Mediterránea

## 📞 Soporte

Para consultas o problemas, contacta con el desarrollador.

## 📄 Licencia

Uso libre para entrenadores personales y pequeños negocios fitness.

---

**Desarrollado con 💪 para entrenadores que quieren digitalizar su negocio**
