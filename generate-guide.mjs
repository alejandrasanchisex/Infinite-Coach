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
              text: "💪 INFINITE COACH",
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
              text: "GUÍA DE USO DE LA APLICACIÓN CLIENTE",
              bold: true,
              size: hp(18),
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
                          text: "Todo lo que necesitas saber para dominar tu entrenamiento, nutrición, hábitos diarios y evolución personal desde tu teléfono.",
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
              text: "Versión: 2.0.0 (Actualización de Pagos & PWA)",
              size: hp(10),
              color: GRAY_TXT,
              font: 'Calibri',
            }),
          ],
        }),
        
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: "Plataforma: Web App Móvil Multiplataforma",
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
              text: "Infinite Coach © 2026. Todos los derechos reservados.",
              size: hp(9.5),
              color: GRAY_TXT,
              font: 'Calibri',
            }),
          ],
        }),
        
        new PageBreak(),

        // ─── ÍNDICE (TABLE OF CONTENTS) ───
        h1("ÍNDICE DE CONTENIDOS"),
        para("Esta guía está estructurada en secciones numeradas para facilitar su consulta rápida. Pulsa sobre cualquier funcionalidad en la app si deseas explorarla directamente."),
        
        new Paragraph({ spacing: { after: 120 } }),
        
        indexItem(1, "Acceso a la App", "Código único de 8 caracteres, instalación PWA (iPhone/Android) y sesión persistente."),
        indexItem(2, "Panel Principal", "Resumen del día, marca personalizada de tu coach y accesos directos rápidos."),
        indexItem(3, "Mi Rutina", "Visualización de ejercicios, vídeos técnicos, cronómetro de descanso y registro de marcas en vivo."),
        indexItem(4, "Mi Dieta", "Distribución de comidas por horas, intercambio por alternativas saludables, suplementación y lista de compra semanal."),
        indexItem(5, "Hábitos Diarios", "Seguimiento de hidratación de agua, pasos caminados y calidad del sueño con gráficos de constancia."),
        indexItem(6, "Evolución", "Historial de peso corporal, registro de perímetros, marcas de fuerza (PRs) y galería de fotos físicas segura."),
        indexItem(7, "Revisión Semanal", "Cuestionario de feedback con sliders de valoración física, fotos de control y bloqueo de seguridad de 6 días."),
        indexItem(8, "Ficha y Perfil", "Datos biométricos, selector de tema visual y área de facturación transparente con eliminación de tarjetas guardadas."),
        indexItem(9, "Preguntas Frecuentes", "Respuestas rápidas a las dudas comunes sobre pagos, funcionamiento y soporte de la plataforma."),
        
        new PageBreak(),

        // ─── SECCIÓN 1 ───
        h1("1. ACCESO A LA APP"),
        para("La aplicación cliente está diseñada para ser extremadamente ágil, segura y accesible desde cualquier smartphone sin ocupar espacio de almacenamiento innecesario."),
        
        h2("Código de Acceso Único"),
        para("Para acceder a tu área privada, no necesitas recordar correos ni contraseñas complejas. Tu entrenador personal te facilitará un Código de Acceso Único de 8 caracteres (ej: X8F9A3B2). Al introducirlo por primera vez, el sistema vinculará tu dispositivo de forma segura a tu ficha técnica."),
        
        h2("Instalación como Web App Móvil (PWA)"),
        para("La aplicación funciona como una PWA (Progressive Web App). Puedes instalarla directamente en la pantalla de inicio de tu teléfono para acceder a ella con un solo toque, con comportamiento idéntico a una app nativa:"),
        bullet("En dispositivos iPhone (iOS): Abre el enlace de la aplicación en el navegador Safari. Pulsa el botón de Compartir (el icono de la caja con una flecha hacia arriba) y selecciona la opción 'Añadir a pantalla de inicio'."),
        bullet("En dispositivos Android: Abre el enlace de la aplicación en Google Chrome. Pulsa sobre el banner inferior que dice 'Instalar aplicación' o pulsa en los tres puntos de configuración del navegador (esquina superior derecha) y selecciona 'Instalar aplicación' o 'Añadir a pantalla de inicio'."),
        
        h2("Sesión Persistente y Seguridad"),
        para("Una vez que accedes con tu código por primera vez, la sesión se mantiene guardada indefinidamente. No tendrás que volver a escribir tu código al abrir la app. Si deseas cerrar la sesión por seguridad o acceder con una cuenta diferente, puedes hacerlo pulsando en 'Cerrar Sesión' dentro de la sección de tu Perfil."),
        
        new Paragraph({ spacing: { before: 120 } }),
        callout("Consejo Práctico", "Si por alguna razón la aplicación se muestra desactualizada o no carga nuevos datos, simplemente desliza el dedo hacia abajo en el panel principal para forzar una sincronización en la nube o reinicia la app instalada en tu pantalla."),

        new PageBreak(),

        // ─── SECCIÓN 2 ───
        h1("2. PANEL PRINCIPAL (DASHBOARD)"),
        para("El Panel Principal es tu centro de operaciones diario. Desde aquí puedes supervisar de un solo vistazo tu planificación actual y navegar rápidamente a cada sección."),
        
        h2("Adaptabilidad y Marca del Entrenador"),
        para("La interfaz se adapta de forma 100% dinámica a la imagen de tu entrenador. Si tu coach ha personalizado su perfil en el panel de control, verás su logotipo oficial, su nombre de marca (reemplazando el de Infinite Coach por defecto) y toda la interfaz lucirá sus colores corporativos exclusivos, ofreciéndote una experiencia totalmente premium y personalizada."),
        
        h2("Widgets del Día"),
        para("En la parte superior del panel principal verás widgets informativos clave:"),
        bullet("Tu objetivo principal del día (si tienes un entrenamiento pautado o si es día de descanso y recuperación activa)."),
        bullet("Tu estado actual de hidratación (mostrando si has alcanzado los mililitros mínimos recomendados por tu entrenador)."),
        bullet("Un aviso de Check-in Semanal que parpadeará en color de forma llamativa cuando tu revisión esté lista para ser enviada."),

        h2("Accesos Directos Rápidos"),
        para("El centro de la pantalla está protagonizado por 6 botones táctiles de gran tamaño para acceder a las herramientas esenciales de tu día a día:"),
        numbered(1, "Mi Rutina: Accede directamente a la tabla de ejercicios de tu sesión actual."),
        numbered(2, "Mi Dieta: Abre la distribución de tus comidas e ingredientes diarios."),
        numbered(3, "Hábitos Diarios: Suma tus vasos de agua, pasos del día y horas de sueño."),
        numbered(4, "Evolución: Registra tu peso, añade tus perímetros corporales y consulta tus gráficas de fuerza."),
        numbered(5, "Revisión Semanal: Completa el reporte periódico para que tu entrenador valore tus progresos."),
        numbered(6, "Ficha Técnica: Consulta tus datos biométricos y gestiona tus opciones de pago."),

        new PageBreak(),

        // ─── SECCIÓN 3 ───
        h1("3. MI RUTINA DE ENTRENAMIENTO"),
        para("En este apartado encontrarás el plan de entrenamiento diseñado a medida por tu entrenador. La app te guía paso a paso durante tu sesión en el gimnasio."),
        
        h2("Estructura de la Sesión Diaria"),
        para("Al entrar, se cargará automáticamente la rutina correspondiente al día de la semana. Verás el título de la rutina (ej: 'Empuje - Cadena Anterior') y el listado de ejercicios ordenados de forma lógica."),

        h2("Detalle del Ejercicio"),
        para("Cada tarjeta de ejercicio contiene la información clave e interactiva:"),
        bullet("Vídeo Técnico: Pulsa sobre el icono de reproducción para abrir directamente un vídeo corto demostrativo donde se explica la ejecución correcta del ejercicio, evitando riesgos de lesión."),
        bullet("Instrucciones de Series y Repeticiones: La recomendación exacta (ej: '4 series x 8-10 repeticiones' o 'RPE 9')."),
        bullet("Tiempo de Descanso: Indica los segundos recomendados de pausa entre series."),

        h2("Temporizador de Descanso Integrado"),
        para("Para maximizar tus resultados, la app cuenta con un cronómetro de descanso integrado en cada ejercicio. Al pulsar el botón 'Iniciar Descanso', se activará una cuenta atrás visual y sonora que te avisará cuando sea el momento de realizar la siguiente serie."),

        h2("Registro en Vivo de Cargas y Repeticiones"),
        para("Durante tu entrenamiento, puedes introducir de forma activa las repeticiones que has completado realmente y los kilogramos levantados en cada serie. Al pulsar el botón de guardar en cada fila, esos datos se sincronizan con la ficha técnica que tiene tu entrenador. Esto permite a tu coach analizar tus niveles de fuerza y planificar de forma científica la sobrecarga progresiva."),

        h2("Finalizar Entrenamiento"),
        para("Al completar todos los ejercicios de tu rutina, pulsa el botón 'Finalizar Sesión' en la parte inferior. Tu entrenamiento se marcará como completado en tu calendario y tu entrenador recibirá una notificación con el resumen del trabajo realizado."),

        new PageBreak(),

        // ─── SECCIÓN 4 ───
        h1("4. MI PLAN DE NUTRICIÓN (DIETA)"),
        para("Tu alimentación es el pilar fundamental para conseguir tus metas físicas. La sección 'Mi Dieta' te muestra de manera sumamente clara y práctica tu plan alimentario diario."),

        h2("Distribución de Comidas e Ingredientes"),
        para("Tu plan se divide en las diferentes comidas del día recomendadas por tu entrenador (ej: Desayuno, Almuerzo, Comida, Merienda, Cena). Cada comida muestra su listado de ingredientes con sus pesos exactos en crudo (en gramos) e instrucciones de preparación pautadas por tu coach."),

        h2("Intercambio por Alternativas"),
        para("Si un día no dispones de un ingrediente o simplemente no te apetece comerlo, la aplicación te ofrece una potente herramienta de intercambio. Desliza la tarjeta de comida hacia la izquierda o pulsa en 'Ver Alternativas'. El sistema te mostrará una lista de alimentos sustitutos equivalentes en macronutrientes aprobados previamente por tu entrenador para que puedas realizar el cambio con total tranquilidad sin descompensar tu dieta."),

        h2("Pautas de Suplementación"),
        para("Si tu plan incluye suplementos deportivos o de salud (vitaminas, creatina, proteína en polvo, omega 3, etc.), se detallarán en una sección especial al final del plan, especificando la dosis exacta en gramos o cápsulas y el momento idóneo de su ingesta (ej: 'Pre-entrenamiento' o 'Con el desayuno')."),

        h2("Generador de Lista de la Compra"),
        para("En la parte superior de la sección de nutrición, dispones de un botón para generar automáticamente la Lista de la Compra. El sistema unifica de forma inteligente todos los ingredientes de tu dieta semanal, los suma y los clasifica por familias (carnes, verduras, lácteos, cereales). Puedes abrir esta lista interactiva en tu teléfono en el supermercado e ir marcando con un checklist los alimentos que vas depositando en el carrito."),

        new PageBreak(),

        // ─── SECCIÓN 5 ───
        h1("5. CONTROL DE HÁBITOS DIARIOS"),
        para("Los pequeños hábitos acumulados cada día determinan el 90% de tus resultados a largo plazo. Esta sección te ayuda a registrar y mantener la constancia en tus rutinas de salud diarias."),

        h2("Métricas de Salud Registrables"),
        para("La app te permite monitorizar tres variables fundamentales para tu recuperación y rendimiento físico:"),
        bullet("Consumo de Agua: Lleva la cuenta del agua que bebes durante el día. Tienes botones de acceso rápido para sumar volúmenes habituales (+250ml o un vaso, +500ml o una botella pequeña, +1 Litro) con solo pulsar un botón, facilitando enormemente el registro continuo."),
        bullet("Pasos Diarios (NEAT): Registra los pasos caminados durante el día. Esencial para controlar tu gasto calórico no asociado al ejercicio."),
        bullet("Calidad y Duración del Sueño: Registra las horas totales que has dormido y valora tu descanso de forma subjetiva (Reparador, Normal o Insuficiente) para que tu entrenador pueda valorar si tu fatiga está asociada a un mal descanso."),

        h2("Sincronización Automática con Salud Móvil"),
        para("Si dispones de un dispositivo iOS (Apple Watch/iPhone) o Android, puedes activar la opción de sincronización automática. La app se conectará de manera nativa con Apple Health o Google Fit para importar de forma automática tus pasos diarios y horas de sueño sin que tengas que introducirlos manualmente."),

        h2("Historial Analítico"),
        para("En la parte inferior de la pantalla de hábitos, podrás ver gráficas de tu consistencia durante la semana actual y la anterior, permitiéndote motivarte al ver cómo mantienes tus rachas de hábitos saludables."),

        new PageBreak(),

        // ─── SECCIÓN 6 ───
        h1("6. REGISTRO DE EVOLUCIÓN"),
        para("La sección de Evolución es tu diario visual y analítico de progresos. Aquí se registran todos los datos que demuestran que tu esfuerzo está dando frutos."),

        h2("Registro de Peso y Medidas Corporales"),
        para("Para una valoración completa de tu composición corporal, cuentas con dos herramientas de entrada de datos:"),
        bullet("Historial de Peso: Introduce tu peso en ayunas tantas veces por semana como te paute tu entrenador. El sistema generará una curva de evolución suavizada que filtra las oscilaciones normales de agua para mostrarte tu tendencia real de pérdida de grasa o ganancia muscular."),
        bullet("Medidas Antropométricas: Registra periódicamente tus perímetros en centímetros (pecho, cintura, cadera, brazo relajado, muslo). Esta métrica es crucial, ya que muchas veces el peso no varía debido a la recomposición corporal, pero las medidas demuestran la pérdida de volumen de grasa."),

        h2("Gráficas de Evolución de Fuerza y PRs"),
        para("La app realiza un seguimiento de tus mejores marcas (PR o Personal Record) en ejercicios básicos del gimnasio (Sentadilla, Peso Muerto, Press Banca, etc.). Podrás ver de forma interactiva una gráfica con tu progresión de fuerza a lo largo del tiempo, lo cual es el mejor indicador de la ganancia de masa muscular."),

        h2("Galería de Fotos de Progreso Seguro"),
        para("Sube fotos tuyas de frente, perfil y espalda. Las fotos se almacenan de manera totalmente segura y encriptada en la base de datos de tu entrenador. Esta galería visual te permite comparar tu físico actual con tus fotos de inicio en un formato deslizante tipo 'antes y después', lo que resulta altamente motivador."),

        new PageBreak(),

        // ─── SECCIÓN 7 ───
        h1("7. REVISIÓN SEMANAL (FEEDBACK)"),
        para("La comunicación bidireccional es la clave del éxito en el entrenamiento online. El formulario de revisión semanal es el medio oficial para informar a tu coach de cómo está respondiendo tu cuerpo."),

        h2("¿Cómo Funciona la Revisión?"),
        para("Cada 7 días (habitualmente programado para los viernes o fines de semana), se habilitará en tu panel principal el botón de Revisión Semanal. Es fundamental que respondas al cuestionario de manera honesta para que tu entrenador pueda valorar si tu plan necesita ajustes en calorías, volumen de entrenamiento o descanso."),

        h2("Campos de Valoración y Subida de Fotos"),
        para("El formulario te solicitará información cuantitativa y cualitativa:"),
        bullet("Sliders de Escala 1-10: Califica de forma rápida tu Nivel de Energía, Calidad de Sueño, Niveles de Estrés, Sensación de Hambre y Salud Digestiva de la semana."),
        bullet("Comentarios sobre el Plan: Espacio para detallar si has podido cumplir la dieta al 100%, si has tenido molestias en algún ejercicio o si necesitas cambios logísticos."),
        bullet("Fotos del Check-in: Un espacio específico para subir tus fotos de control semanales con la luz y postura idóneas."),

        h2("Bloqueo de Seguridad de 6 Días"),
        para("Una vez que revisas tus respuestas y pulsas el botón 'Enviar Reporte Semanal', los datos se envían al servidor y la sección de revisión quedará bloqueada automáticamente durante 6 días. Este bloqueo de seguridad es crucial por dos motivos:"),
        numbered(1, "Evita el envío accidental de múltiples formularios duplicados en una misma semana."),
        numbered(2, "Otorga el tiempo necesario para que tu entrenador estudie detalladamente tus fotos y datos, te redacte su feedback semanal y realice los ajustes oportunos en tu rutina y dieta."),

        new PageBreak(),

        // ─── SECCIÓN 8 ───
        h1("8. FICHA TÉCNICA Y PERFIL"),
        para("En esta sección puedes revisar tu estado general en el servicio, configurar el aspecto visual de la aplicación y gestionar de forma completamente segura tus detalles financieros."),

        h2("Ficha Técnica Biométrica"),
        para("La parte superior muestra tu ficha oficial del cliente: tus datos de altura, tu porcentaje de grasa inicial y los objetivos generales marcados. También verás la fecha de vigencia de tu plan actual para conocer exactamente cuándo vence tu suscripción."),

        h2("Personalización y Preferencias Visuales"),
        para("Puedes actualizar tu foto de perfil (que aparecerá en el dashboard de tu entrenador) y seleccionar tu nombre de visualización. También dispones de un selector de Tema Visual para alternar entre el tema Oscuro Premium, Claro Premium, o sincronizar automáticamente el aspecto con el tema de tu dispositivo móvil."),

        h2("Gestión y Eliminación de Opciones de Pago"),
        para("Infinite Coach incorpora un panel financiero privado y extremadamente seguro para que gestiones tus cuotas directamente desde tu teléfono:"),
        bullet("Métodos de Pago Autorizados: Visualiza de forma transparente las vías de abono configuradas por tu entrenador para tu servicio (Stripe, PayPal, Bizum, Revolut, transferencia o efectivo)."),
        bullet("Información de Renovación Transparente: La app te indicará mediante etiquetas visuales muy claras si tu pago es de Renovación Automática (🔄) (pago recurrente mediante tarjeta bancaria gestionado por Stripe, donde tu cuota mensual se cobra automáticamente en tu fecha de vencimiento) o si se trata de un Pago Manual (✋) (donde deberás realizar tú el envío del dinero por Bizum o transferencia y confirmar al coach)."),
        bullet("Eliminación de Tarjetas Guardadas: Si has guardado tu tarjeta de crédito o débito en tus compras del plan, verás el listado de tus opciones de pago activas. Tienes a tu disposición un botón de color rojo para borrar tus datos de pago guardados de forma instantánea. Al pulsarlo, el método de pago se elimina por completo de la base de datos de Stripe de forma segura e irreversible para tu total tranquilidad."),

        new PageBreak(),

        // ─── SECCIÓN 9 ───
        h1("9. PREGUNTAS FRECUENTES (FAQ)"),
        para("A continuación, recopilamos las respuestas detalladas a las preguntas y dudas más recurrentes que suelen plantear los clientes durante el uso de la aplicación."),

        h3("¿Cómo instalo la aplicación en mi móvil?"),
        para("Como es una Web App (PWA), no necesitas buscarla en App Store ni Google Play. Simplemente abre el enlace de la app en Safari (iPhone) o Chrome (Android), pulsa en el botón compartir o menú de opciones, y selecciona 'Añadir a pantalla de inicio'. Se creará un acceso directo con icono oficial en tu pantalla."),

        h3("¿Qué hago si mi código de acceso de 8 caracteres da un mensaje de error?"),
        para("Comprueba que no estás introduciendo espacios accidentales antes o después del código. Asegúrate de distinguir entre la letra 'O' y el número '0' o la letra 'I' y el número '1'. Si el problema persiste, ponte en contacto con tu entrenador para que verifique si tu perfil está activo en su panel de administración."),

        h3("¿Cómo realizo un cambio de ingrediente en mi menú diario?"),
        para("Dentro de la pestaña 'Mi Dieta', localiza el plato del cual quieres cambiar un ingrediente. Desliza la tarjeta hacia la izquierda o pulsa en 'Alternativas'. La aplicación te mostrará las alternativas nutricionales aprobadas por tu coach. Elige la que prefieras y el plan se actualizará automáticamente con las cantidades equivalentes."),

        h3("¿Puedo registrar mi entrenamiento si no tengo cobertura o conexión en el gimnasio?"),
        para("Sí, por supuesto. La aplicación almacena de forma local y segura en la memoria de tu navegador tus series, repeticiones y cargas anotadas durante el entrenamiento. En cuanto vuelvas a tener cobertura móvil o te conectes a una red Wi-Fi, la app sincronizará en segundo plano todos tus registros con el servidor de tu entrenador."),

        h3("¿Por qué no me deja volver a enviar la Revisión Semanal si me he equivocado?"),
        para("Para mantener el orden en la planificación, el cuestionario semanal tiene un bloqueo de seguridad de 6 días una vez enviado. Si has cometido un error grave en los datos aportados, ponte en contacto con tu coach a través del botón de chat de WhatsApp integrado en tu perfil para que pueda corregir el reporte manualmente en su panel."),

        h3("¿Es seguro introducir y guardar mis datos bancarios en la aplicación?"),
        para("Es totalmente seguro. Infinite Coach no almacena en sus servidores locales ningún número de tarjeta de crédito ni códigos CVV. Todos los pagos, suscripciones y gestión de datos bancarios se realizan mediante pasarelas de pago externas e hiperseguras de nivel bancario gestionadas por Stripe. Ni tu entrenador personal ni los administradores del software tienen acceso en ningún momento a los datos de tu tarjeta completa."),

        h3("¿Cómo borro una tarjeta guardada que ya no quiero utilizar?"),
        para("Ve a la sección 'Ficha Técnica' desde tu panel principal, desliza hasta abajo hasta la zona de 'Cómo Pagar' y en tus opciones de pago guardadas pulsa en el botón rojo con el icono de papelera. La tarjeta se borrará instantáneamente de las bases de datos de forma permanente."),

        h3("¿Cómo sé si mi plan se renovará automáticamente y cómo cancelo la suscripción?"),
        para("En tu área de 'Ficha Técnica' verás de forma muy clara una etiqueta verde que dice '🔄 RENOVACIÓN AUTOMÁTICA' o una etiqueta amarilla de '✋ PAGO MANUAL'. Si tienes activada la renovación automática y deseas cancelarla para el próximo mes, pulsa en el botón 'Gestionar Suscripción' de Stripe y selecciona 'Cancelar Suscripción'. Tu plan continuará activo hasta la fecha de vigencia actual y no se te realizará ningún cobro adicional.")
      ],
    },
  ],
});

// ─── Packer ──────────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('Guia_App_Cliente_InfiniteCoach.docx', buffer);
  console.log('✅ Document created successfully as Guia_App_Cliente_InfiniteCoach.docx!');
}).catch((error) => {
  console.error('Error generating document:', error);
});
