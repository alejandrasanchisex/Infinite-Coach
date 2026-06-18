import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, ShadingType, TableLayoutType,
  PageBreak, convertInchesToTwip, VerticalAlign,
} from 'docx';
import fs from 'fs';
import path from 'path';

// ─── Palette ────────────────────────────────────────────────────────────────
const PURPLE    = '6C3FC8';
const PURPLE_LT = 'EDE7F6';
const GRAY_BG   = 'F5F5F5';
const GRAY_TXT  = '555555';
const WHITE     = 'FFFFFF';
const BLACK     = '1A1A1A';

// ─── Size helper: docx uses HALF-points ─────────────────────────────────────
const hp = (pt) => pt * 2;   // points → half-points

// ─── Helpers ─────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: hp(20), color: PURPLE, font: 'Calibri' })],
  });
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: hp(14), color: PURPLE, font: 'Calibri' })],
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [new TextRun({ text, bold: true, size: hp(12), color: GRAY_TXT, font: 'Calibri' })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 40, after: 60 },
    children: [new TextRun({
      text,
      size: hp(11),
      color: opts.color || BLACK,
      bold: opts.bold || false,
      italics: opts.italic || false,
      font: 'Calibri',
    })],
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 30, after: 40 },
    indent: { left: 360 }, // slight indent
    children: [
      new TextRun({ text: "• ", bold: true, size: hp(11), color: PURPLE, font: 'Calibri' }),
      new TextRun({
        text,
        size: hp(11),
        color: opts.color || BLACK,
        bold: opts.bold || false,
        italics: opts.italic || false,
        font: 'Calibri',
      })
    ]
  });
}

function numbered(num, text, opts = {}) {
  return new Paragraph({
    spacing: { before: 30, after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `${num}. `, bold: true, size: hp(11), color: PURPLE, font: 'Calibri' }),
      new TextRun({
        text,
        size: hp(11),
        color: opts.color || BLACK,
        bold: opts.bold || false,
        italics: opts.italic || false,
        font: 'Calibri',
      })
    ]
  });
}

function callout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 24, color: PURPLE }, // thick left border
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: PURPLE_LT },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: `ℹ️ ${title}`, bold: true, size: hp(11), color: PURPLE, font: 'Calibri' })],
              }),
              new Paragraph({
                spacing: { before: 20 },
                children: [new TextRun({ text, size: hp(10.5), color: BLACK, font: 'Calibri', italics: true })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function indexItem(num, title, desc) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `${num}. `, bold: true, size: hp(11), color: PURPLE, font: 'Calibri' }),
      new TextRun({ text: `${title}: `, bold: true, size: hp(11), color: BLACK, font: 'Calibri' }),
      new TextRun({ text: desc, size: hp(11), color: GRAY_TXT, font: 'Calibri' }),
    ]
  });
}

// ─── Build Document ──────────────────────────────────────────────────────────
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      children: [
        // ─── PORTADA (COVER PAGE) ───
        new Paragraph({ spacing: { before: 1200 } }), // Top spacing
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "👑 INFINITE COACH PRO",
              bold: true,
              size: hp(28),
              color: PURPLE,
              font: 'Calibri',
            }),
          ],
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: "GUÍA DE USO DE LA APLICACIÓN DEL ENTRENADOR",
              bold: true,
              size: hp(17),
              color: GRAY_TXT,
              font: 'Calibri',
            }),
          ],
        }),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: PURPLE },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: PURPLE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: GRAY_BG },
                  margins: { top: 200, bottom: 200, left: 180, right: 180 },
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Manual de administración, CRM de alumnos, planificación deportiva y nutricional, facturación oficial VeriFactu y gestión de licencias SaaS.",
                          italics: true,
                          size: hp(11),
                          color: BLACK,
                          font: 'Calibri',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        
        new Paragraph({ spacing: { before: 2400 } }), // Bottom spacing
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: "Versión: 2.0.0 (Actualización SaaS & Invoicing Fiscal)",
              size: hp(10),
              color: GRAY_TXT,
              font: 'Calibri',
            }),
          ],
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Infinite Coach Pro © 2026. Todos los derechos reservados.",
              size: hp(9.5),
              color: GRAY_TXT,
              font: 'Calibri',
            }),
          ],
        }),
        
        new PageBreak(),

        // ─── ÍNDICE (TABLE OF CONTENTS) ───
        h1("ÍNDICE DE CONTENIDOS"),
        para("Este manual está diseñado para servir de referencia rápida en la administración de tu negocio de asesoramiento online. Encuentra cada módulo de tu backend estructurado a continuación:"),
        
        new Paragraph({ spacing: { after: 120 } }),
        
        indexItem(1, "Acceso y Autenticación", "Inicio de sesión seguro mediante correo y clave de licencia profesional, e inyección automática de branding."),
        indexItem(2, "Panel de Control (Dashboard)", "Vista general del negocio, KPIs en vivo, facturación estimada y sincronización en la nube."),
        indexItem(3, "CRM de Alumnos (Clientes)", "Directorio de clientes, estados de suscripción, asignación de revisiones y límites del Plan Basic."),
        indexItem(4, "Ficha Técnica Integral del Alumno", "Overview, evolución, entrenamiento, dieta, suplementación rich-text, facturación VeriFactu y Stripe."),
        indexItem(5, "Constructor de Dietas y Alimentos", "Gestión de plantillas nutricionales, cálculo automático de macros y base de datos con blindaje de seguridad."),
        indexItem(6, "Planificación Deportiva (Rutinas)", "Creación de programas de entrenamiento, datalist de autocompletado y protección con buffer JSON."),
        indexItem(7, "Bandeja de Revisión Semanal", "Procesamiento de feedbacks, sliders cuantitativos, carrusel de fotos y datos demo de tutoría."),
        indexItem(8, "Configuración de Marca y Facturación", "Personalización de marca (HEX colores), compresor Canvas de logotipos, facturación en remesa y SheetJS Excel Backup."),
        indexItem(9, "Biblioteca Multimedia (Media Pro)", "Gestión de videos de ejercicios y recetas saludables, reparación automática de base de datos e integración de YouTube."),
        indexItem(10, "Control de Suscripción SaaS", "Seguridad de la plataforma SaaS y cortafuegos dinámico frente a licencias expiradas."),
        indexItem(11, "Agenda de Citas y Reuniones", "Organizador cronológico de eventos de agenda e integración instantánea con Google Calendar."),
        indexItem(12, "Preguntas Frecuentes (FAQ)", "Dudas operativas comunes de entrenadores y resolución de problemas recurrentes de clientes."),
        
        new PageBreak(),

        // ─── SECCIÓN 1 ───
        h1("1. ACCESO Y AUTENTICACIÓN (LOGIN)"),
        para("El portal del entrenador cuenta con un acceso encriptado para salvaguardar la privacidad de las fichas clínicas e historiales deportivos de tus alumnos."),
        
        h2("Acceso mediante Credenciales de Licencia"),
        para("El acceso al backend del entrenador se realiza de forma directa mediante un formulario seguro utilizando el Correo Electrónico proporcionado a IngeniaIA y la Clave de Licencia (Contraseña) profesional exclusiva que te hayamos facilitado (ej: FIT-XXXX-26). No se requiere inicio de sesión con Google ni cuentas externas; tus datos son validados de forma directa y privada."),
        
        h2("Soporte de Credenciales Recordadas"),
        para("El formulario incorpora la opción 'Recordar mis credenciales'. Al marcar la casilla, la aplicación guardará de forma local y encriptada en la caché segura de tu dispositivo tu correo y clave de acceso. Esto te permite saltarte la escritura manual en tus siguientes accesos, agilizando enormemente tu entrada diaria."),
        
        h2("Inyección Dinámica de Marca (Branding)"),
        para("Al hacer clic en 'Acceder', el motor de autenticación conecta con la base de datos segura en Supabase (con respaldo redundante en Firebase) para validar el estado de tu licencia activa. En cuanto el acceso es concedido, el software carga tus metadatos y aplica instantáneamente el tema de color hexadecimal y logotipo de tu marca en toda la interfaz, reemplazando la marca por defecto por tu propia identidad corporativa."),
        
        new Paragraph({ spacing: { before: 120 } }),
        callout("Nota del Desarrollador", "Si has iniciado sesión pero se abre una pantalla que indica que tu licencia está inactiva, consulta la Sección 10 para gestionar tu suscripción del software."),

        new PageBreak(),

        // ─── SECCIÓN 2 ───
        h1("2. PANEL DE CONTROL (DASHBOARD)"),
        para("El Dashboard es el centro neurálgico desde donde supervisas la salud y facturación de tu negocio de asesorías online en tiempo real."),
        
        h2("Cuadrícula de Indicadores (KPI Cards)"),
        para("El panel de control resume tus métricas clave de forma modular en 4 tarjetas de gran visibilidad:"),
        bullet("Clientes Activos: El recuento en tiempo real de alumnos dados de alta con estado activo en tu base de datos."),
        bullet("Facturación Estimada: Un pronóstico de tus ingresos mensuales recurrentes basados en la suma de las cuotas de tus clientes activos."),
        bullet("Revisiones Pendientes: El número exacto de cuestionarios semanales enviados por tus clientes que aún no han recibido tu feedback."),
        bullet("Citas de Hoy: El contador de reuniones presenciales, videollamadas o controles agendados para la fecha en curso."),

        h2("Accesos Rápidos y Bandejas de Entrada"),
        para("El diseño del dashboard prioriza tu productividad mediante accesos directos táctiles para crear clientes, pautar nuevas rutinas o dietas al instante. Además, incorpora dos bandejas en la parte inferior: la de Revisiones Recientes (que muestra los cuestionarios pendientes más urgentes) y la de Agenda Semanal (con tus próximas citas sincronizadas)."),

        h2("Sincronización en la Nube Automatizada"),
        para("Cada vez que accedes al dashboard o realizas un cambio, el sistema ejecuta un proceso de sincronización en segundo plano con la base de datos en Supabase, garantizando que si utilizas la aplicación en tu tablet y tu ordenador a la vez, los datos estén perfectamente emparejados sin riesgo de sobrescritura."),

        new PageBreak(),

        // ─── SECCIÓN 3 ───
        h1("3. CRM DE ALUMNOS (CLIENTES)"),
        para("El módulo de gestión de clientes te permite controlar la lista de tus alumnos y configurar los términos de su suscripción al servicio."),
        
        h2("Directorio y Búsqueda de Alumnos"),
        para("A través de una tabla moderna y responsiva, visualizas el nombre, correo electrónico, cuota asignada, día de revisión programado y el estado de cada cliente. La barra de búsqueda superior dispone de un filtro en tiempo real para encontrar alumnos rápidamente por su nombre o correo."),

        h2("Campos de Formulario de Cliente"),
        para("Al registrar o editar un alumno (mediante el modal emergente) debes indicar:"),
        bullet("Nombre y Apellidos (identificador de ficha)."),
        bullet("Email de Acceso (necesario para la conexión y sincronización de su app)."),
        bullet("Teléfono móvil (vital para accesos de WhatsApp directos)."),
        bullet("Cuota Mensual (base imponible para estadísticas y facturas)."),
        bullet("Día de Revisión Semanal (selector del 1 al 7: representa el día de la semana en que se le habilitará su check-in obligatorio)."),
        bullet("Estado del Cliente (Activo / Inactivo)."),

        h2("Límite de Clientes en el Plan Basic (SaaS)"),
        para("La plataforma implementa un control defensivo de negocio basado en tu nivel de suscripción SaaS. Si estás adscrito al 'Plan Basic', la base de datos limita estrictamente tu cupo a un máximo de 15 clientes activos de forma simultánea. Al intentar activar un alumno, el backend verifica tu consumo de licencias; de superar el límite de 15, la app bloqueará el guardado e invitará al entrenador a actualizar su plan en Configuración."),

        new PageBreak(),

        // ─── SECCIÓN 4 ───
        h1("4. FICHA TÉCNICA INTEGRAL DEL ALUMNO"),
        para("La Ficha del Alumno es el panel más potente de la plataforma, unificando en una sola vista toda su planificación deportiva, control calórico, evolución antropométrica y facturación fiscal."),
        
        h2("Barra Lateral e Interacción Directa"),
        para("La zona izquierda muestra una tarjeta de resumen permanente con el avatar del cliente, peso inicial, objetivo actual e iconos de contacto directo mediante plantillas dinámicas de WhatsApp. Puedes reclamar un pago pendiente o enviarle un aviso en lote con un solo clic."),

        h2("Panel de Control de 7 Pestañas"),
        numbered(1, "Overview: Visualiza perímetros corporales, edita campos médicos (lesiones, alergias, notas del coach) y gestiona la fecha de vencimiento de su plan."),
        numbered(2, "Evolución: Lienzo gráfico con curvas interactivas de peso (Chart.js), medidas y un carrusel fotográfico seguro de su transformación física."),
        numbered(3, "Entrenamiento: Diseña programas deportivos por bloques de semanas. Permite importar tus plantillas maestras, duplicar semanas completas y ajustar las series, repeticiones e intensidad RIR en vivo."),
        numbered(4, "Dieta: Establece calorías y macros objetivo. Incorpora una Calculadora Nutricional Harris-Benedict que calcula la TDEE del cliente en base a su edad, peso, altura, sexo y factor de actividad diaria de forma automática."),
        numbered(5, "Suplementación: Editor de suplementos con barra de herramientas rich-text. Incorpora una maqueta en vivo que simula exactamente cómo el cliente lo verá en su smartphone."),
        numbered(6, "Historial de Revisiones: Listado ordenado de todos los check-ins semanales contestados por el alumno para analizar sus sensaciones."),
        numbered(7, "Facturación (VeriFactu & Stripe): Permite generar facturas de curso legal (VeriFactu) que aplican criptografía de encadenamiento hash digital e incorporan un código QR enlazado a la Agencia Tributaria. También permite construir enlaces seguros de Stripe Checkout para cobros automáticos."),

        new PageBreak(),

        // ─── SECCIÓN 5 ───
        h1("5. CONSTRUCTOR DE DIETAS Y ALIMENTOS"),
        para("El módulo nutricional te permite crear estructuras de menús equilibrados y gestionar una biblioteca de ingredientes con control de macros."),

        h2("Plantillas de Dietas Reutilizables"),
        para("Crea plantillas máster de nutrición clasificadas por calorías y número de ingestas (de 3 a 6 comidas diarias). El sistema te permite clonar plantillas con un botón, editarlas cómodamente y publicarlas/asignarlas de forma masiva a cualquier cliente de tu cartera con un clic."),

        h2("Cálculo Dinámico de Macros en Cabecera"),
        para("A medida que agregas recetas e ingredientes a tu plantilla de dieta, el motor calcula en tiempo real la suma exacta de Macronutrientes y Kcal aportadas (por ejemplo, mostrando '155.4g Proteína | 210g Hidratos | 58g Grasas') en la parte superior de la tarjeta, permitiéndote cuadrar los objetivos alimentarios de forma precisa y veloz."),

        h2("Base de Datos y Blindaje del Sistema"),
        para("En la pestaña 'Mis Alimentos' gestionas los ingredientes del sistema. El software cuenta con un mecanismo de seguridad: los alimentos semilla nativos de la base de datos (con IDs prefijados 'seed_') detectan que son esenciales para el funcionamiento básico del recomendador calórico y desactivan por completo sus botones de borrado para evitar pérdidas accidentales de datos."),

        new PageBreak(),

        // ─── SECCIÓN 6 ───
        h1("6. PLANIFICACIÓN DE ENTRENAMIENTO (RUTINAS)"),
        para("El módulo de Rutinas es tu biblioteca biomecánica. Te permite estructurar rutinas avanzadas de entrenamiento y almacenar guías de ejercicios."),

        h2("Biblioteca Biomecánica y Videos Técnicos"),
        para("Organiza tus ejercicios en base a grupos musculares. Cada ejercicio te permite guardar de forma ordenada su nombre oficial y un enlace a video demostrativo de YouTube o Vimeo. Al diseñar la rutina, este video estará disponible para el cliente al instante."),

        h2("Datalist de Autocompletado Inteligente"),
        para("Al redactar una sesión de entrenamiento, no requieres buscar los nombres de los ejercicios de forma manual. El constructor incorpora un datalist que lee en tiempo real la biblioteca multimedia y te sugiere coincidencias normalizadas a medida que escribes, agilizando notablemente el diseño de los bloques de ejercicio."),

        h2("Protección de Plantillas con Buffer JSON"),
        para("Al editar una rutina de entrenamiento, el software realiza un clonado molecular del objeto en memoria mediante un proceso JSON (`JSON.parse(JSON.stringify(routine))`). El entrenador realiza cambios sobre un buffer temporal aislado en memoria. Solo cuando haces clic en 'Guardar Plantilla' los cambios se aplican y escriben en Supabase, previniendo que una edición incompleta o caída de internet corrompa la planificación que el cliente tiene activa."),

        new PageBreak(),

        // ─── SECCIÓN 7 ───
        h1("7. BANDEJA DE REVISIÓN SEMANAL"),
        para("La bandeja de revisiones es tu canal de comunicación periódico con el cliente. Centraliza el feedback de su progreso semanal para que puedas tomar decisiones informadas."),

        h2("Dashboard Cuantitativo y Cualitativo"),
        para("Cada tarjeta de revisión de alumno recopila de forma estructurada:"),
        bullet("Métricas Semanales: Sliders cuantitativos de 1 a 10 evaluando sus niveles de Energía, Calidad de Sueño, Humor, Adherencia a Dieta, y Niveles de Estrés."),
        bullet("Carrusel de Fotos de Estado Físico: Fotos de progreso cargadas por el alumno para valorar su recomposición visual."),
        bullet("Historial de Peso y Medidas: Un extracto de su peso medio en ayunas y perímetros medidos."),
        bullet("Preguntas Subjetivas: Sus respuestas de texto a las preguntas personalizadas configuradas por ti."),

        h2("Área de Respuesta Rápida y WhatsApp Directo"),
        para("Una vez analizado el progreso, puedes escribir tus observaciones en el cuadro de feedback en la propia tarjeta y pulsar 'Enviar Revisión'. El sistema actualizará el estado a 'Resuelto' y notificará al cliente. Si prefieres un contacto directo, dispones del botón de WhatsApp que redacta una respuesta automática pidiéndole hablar por chat."),

        h2("Inyector de Datos Demo Autoejecutable"),
        para("Si eres un entrenador nuevo y accedes a esta pantalla por primera vez, el sistema inyecta automáticamente un reporte completo de revisión simulado de una alumna ficticia ('Ana García'). Este mecanismo sirve como tutorial interactivo integrado para comprender el flujo de trabajo sin requerir clientes reales."),

        new PageBreak(),

        // ─── SECCIÓN 8 ───
        h1("8. CONFIGURACIÓN DE MARCA Y FACTURACIÓN"),
        para("En esta pestaña configuras la infraestructura empresarial de tu marca y ejecutas tareas administrativas masivas."),

        h2("Marca Hexadecimal e Identidad Corporativa"),
        para("Define los colores de la aplicación móvil de tus clientes. Puedes introducir los códigos de color hexadecimal (ej: #6C3FC8) y el logotipo de tu marca. El software incorpora un Compresor Canvas de Logotipo: al subir un logo muy pesado, la app lo redimensiona en segundo plano en un canvas invisible a una resolución optimizada de 200x200px en JPEG de alta calidad antes de subirlo a la nube, ahorrándote cuota y acelerando la carga en el móvil del cliente."),

        h2("Facturación Legal VeriFactu"),
        para("El panel de datos fiscales te permite cumplir con la legislación fiscal española vigente. Configura tu NIF, IVA por defecto, dirección fiscal y serie numérica. Al emitir una factura, el sistema genera de forma automática un código hash encadenado digitalmente con el registro anterior y genera un código QR oficial con enlace de verificación de la Agencia Tributaria Española (AEAT)."),

        h2("Facturación en Remesa y Copias de Seguridad (SheetJS)"),
        para("Para ahorrar tiempo administrativo, dispones del botón de Facturación en Lote, que escanea tu base de datos y genera en un clic facturas para todos los clientes activos que tengan pagos pendientes en el mes. Además, el módulo de backup utiliza la librería SheetJS para exportar al instante toda la base de datos de tu negocio en un archivo Excel unificado con pestañas estructuradas."),

        new PageBreak(),

        // ─── SECCIÓN 9 ───
        h1("9. BIBLIOTECA MULTIMEDIA (MEDIA PRO)"),
        para("El gestor multimedia organiza los recursos educativos que asignas a tus dietas y rutinas de entrenamiento de forma centralizada."),

        h2("Auto-reparación e Inyección de Fichas (v336)"),
        para("La biblioteca de recetas cuenta con un motor autoreparador inteligente (v336). Al iniciarse la biblioteca, escanea los registros guardados por ti; si detecta alguna receta clásica que tenga ingredientes o descripciones incompletas, inyecta automáticamente la información estructurada correcta desde un mapa estático de datos, reparando e hidratando la base de datos al instante sin alterar tu trabajo."),

        h2("Miniaturas de YouTube Automáticas"),
        para("Al registrar un video técnico para la biblioteca de ejercicios, el script procesa tu enlace URL de YouTube a través de una expresión regular, aísla el identificador único de 11 caracteres y realiza una consulta automática a los CDNs de Google para importar directamente la miniatura de alta definición del video (`maxresdefault.jpg`) para lucirla en la tarjeta del ejercicio sin requerir imágenes manuales."),

        new PageBreak(),

        // ─── SECCIÓN 10 ───
        h1("10. CONTROL DE LICENCIA SAAS Y SEGURIDAD"),
        para("El acceso al portal de administración de Infinite Coach Pro está custodiado por un Firewall o Cortafuegos de seguridad de licencia comercial."),

        h2("Cortafuegos de Suscripción"),
        para("El sistema contrasta diariamente la fecha actual con la propiedad `expiryDate` de tu registro de entrenador en la base de datos SaaS. Si tu suscripción a la plataforma ha caducado o tu cobro recurrente ha fallado, la interfaz del panel se congela instantáneamente detrás de una pantalla de bloqueo de seguridad, impidiendo realizar lecturas o escrituras en la base de datos local."),

        h2("Renovación Directa en Stripe"),
        para("Desde la pantalla de bloqueo de licencia, verás los detalles de tu último cobro, un desglose del precio de tu plan asignado y el botón directo de '💳 PAGAR Y ACTIVAR AHORA'. Este enlace abre la pasarela de suscripción de Stripe para que realices el pago y puedas recuperar de inmediato el acceso a toda tu base de datos de clientes."),

        new PageBreak(),

        // ─── SECCIÓN 11 ───
        h1("11. AGENDA DE CITAS Y REUNIONES"),
        para("El módulo de citas cronológicas te permite organizar videollamadas de control o sesiones de entrenamiento presenciales."),

        h2("Organizador de Citas Futuras e Historial"),
        para("Al registrar una cita, el sistema te solicita el alumno, fecha, hora, tipo de evento (Llamada, Seguimiento, Reunión Presencial) y anotaciones de preparación. El motor de la agenda clasifica de forma automática cada registro en la columna de 'Próximas Citas' o en el 'Historial de Citas Pasadas' comparando su timestamp con la fecha del sistema en tiempo real."),

        h2("Sincronización Inteligente con Google Calendar"),
        para("Para evitar que olvides tus compromisos, la app dispone de un botón de sincronización directa con Google Calendar. Al pulsarlo, el script genera una URL estructurada codificada concatenando la fecha, hora, nombre del alumno y notas, y abre en una nueva pestaña el formulario de Google Calendar con todos los campos precompletados listos para que guardes la cita en tu calendario personal en un segundo."),

        new PageBreak(),

        // ─── SECCIÓN 12 ───
        h1("12. PREGUNTAS FRECUENTES (FAQ)"),
        para("En esta sección recopilamos las respuestas detalladas a las preguntas y dudas más recurrentes sobre la gestión administrativa de la plataforma para entrenadores."),

        h3("¿Qué ocurre exactamente cuando alcanzo el límite de 15 clientes en el Plan Basic?"),
        para("El sistema bloqueará cualquier intento de guardar un nuevo alumno como 'Activo'. Para dar de alta a un cliente nuevo, tienes dos opciones: o desactivar temporalmente a otro alumno de tu lista (cambiando su estado a 'Inactivo') o actualizar tu plan SaaS desde la sección de configuración a un plan ilimitado."),

        h3("¿Cómo funciona el cifrado y cumplimiento legal de VeriFactu?"),
        para("El módulo de facturación cumple estrictamente con el reglamento español antifraude. Cada vez que generas una factura, el sistema calcula un hash criptográfico único basándose en el importe, fecha y firma digital de la factura anterior. Esto crea una cadena inalterable en base de datos. El código QR contiene la URL oficial que permite al cliente o a inspectores de Hacienda verificar que la factura ha sido registrada correctamente en el sistema fiscal de la AEAT."),

        h3("¿Es seguro guardar mis claves API secretas de Stripe en la configuración?"),
        para("Es totalmente seguro. Las claves se guardan encriptadas en la base de datos de tu perfil y solo se utilizan del lado del servidor para comunicarse de forma segura con Stripe. Ni los clientes ni terceros pueden leer tus claves secretas en ningún momento."),

        h3("¿Por qué no puedo eliminar algunos alimentos de la lista de ingredientes?"),
        para("Los alimentos que tienen un identificador que comienza con 'seed_' son alimentos nativos del sistema. Son necesarios para garantizar que las dietas base siempre carguen correctamente. Por seguridad de la base de datos, el botón de eliminar se desactiva para estos ingredientes específicos."),

        h3("¿Cómo descargo una copia completa de seguridad de mi base de datos?"),
        para("Ve a la sección '⚙️ Configuración' y desliza hasta abajo hasta la zona de 'Copias de Seguridad'. Pulsa en 'Exportar Excel Completo'. La aplicación recopilará tus tablas de clientes, facturas, rutinas y dietas y descargará un único archivo Excel con pestañas separadas gracias a la librería SheetJS."),

        h3("¿Por qué la revisión semanal de un cliente aparece como pendiente si ya le respondí por WhatsApp?"),
        para("El estado de la revisión es independiente del chat. Para marcar la revisión como completada en tu dashboard y en el panel de tu cliente, debes abrir su tarjeta de revisión, redactar tus notas en el cuadro de texto y hacer clic en el botón 'Enviar Revisión'. El sistema cambiará automáticamente el badge a 'Resuelto' y liberará el bloqueo semanal del cliente."),

        h3("¿Puedo usar mi propio dominio de correo para enviar las facturas VeriFactu?"),
        para("Sí. Si has configurado tu pasarela de correo o has vinculado tu email en el área de facturación, el sistema enviará automáticamente el PDF y el código QR de la factura desde tu dirección fiscal a la dirección de correo registrada de tu alumno."),

        h3("¿Cómo cancelo o pauso mi suscripción del portal SaaS?"),
        para("En el área de Licencia dentro de 'Configuración', dispones del enlace para ir directamente a tu portal de clientes de Stripe. Allí podrás modificar tus datos bancarios, pausar la renovación o descargar tus recibos de pago del software de forma completamente autónoma.")
      ],
    },
  ],
});

// ─── Packer ──────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('Guia_App_Entrenador_InfiniteCoach.docx', buffer);
  console.log('✅ Document created successfully as Guia_App_Entrenador_InfiniteCoach.docx!');
}).catch((error) => {
  console.error('Error generating document:', error);
});
