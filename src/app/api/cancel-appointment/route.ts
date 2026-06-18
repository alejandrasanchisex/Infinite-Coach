import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get("slot") || "";
  const clientName = searchParams.get("name") || "Cliente";
  const clientEmail = searchParams.get("email") || "";
  const trainerEmail = searchParams.get("trainer_email") || "";
  const trainerName = searchParams.get("trainer_name") || "Asesor";
  const callDate = searchParams.get("date") || slot.replace("_", " ");

  const responseHeaders = {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  };

  if (!slot) {
    return new NextResponse(
      renderHtml({
        success: false,
        title: "Parámetro Inválido",
        message: "No se ha especificado el horario a liberar. Verifica el enlace e inténtalo de nuevo.",
        detailsHtml: "",
      }),
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    const supabaseUrl = "https://bieeydhacavxymoosasx.supabase.co";
    const supabaseKey = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

    // 1. Obtener la configuración actual de Supabase
    const getRes = await fetch(`${supabaseUrl}/rest/v1/saas_config?id=eq.config`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    if (!getRes.ok) {
      throw new Error(`Error al leer de Supabase (Status: ${getRes.status})`);
    }

    const rows = await getRes.json();
    if (!rows || rows.length === 0) {
      throw new Error("No se encontró la fila de configuración en Supabase.");
    }

    const configRow = rows[0];
    const configData = configRow.data || {};
    let bookedWelcomeCalls: any[] = configData.bookedWelcomeCalls || [];

    // 2. Comprobar si el slot está en la lista y removerlo
    const initialLength = bookedWelcomeCalls.length;
    bookedWelcomeCalls = bookedWelcomeCalls.filter((item: any) => {
      if (typeof item === 'string') {
        return item !== slot;
      } else if (item && typeof item === 'object') {
        return item.slot !== slot;
      }
      return true;
    });

    if (bookedWelcomeCalls.length === initialLength) {
      // El slot no estaba o ya había sido liberado
      return new NextResponse(
        renderHtml({
          success: true,
          title: "Cita Ya Liberada",
          message: "Esta cita no estaba reservada o ya ha sido liberada previamente.",
          detailsHtml: `
            <div class="details-box">
              <div class="details-row">
                <span class="details-label">Horario:</span>
                <span class="details-val">${slot.replace("_", " ")}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Estado:</span>
                <span class="details-val" style="color: #00D9FF;">Disponible</span>
              </div>
            </div>
          `,
        }),
        { status: 200, headers: responseHeaders }
      );
    }

    // 3. Guardar la configuración actualizada
    configData.bookedWelcomeCalls = bookedWelcomeCalls;

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/saas_config?id=eq.config`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: "config",
        data: configData,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateRes.ok) {
      throw new Error(`Error al actualizar Supabase (Status: ${updateRes.status})`);
    }

    // 3.5 Enviar notificación de cancelación por email
    try {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

      if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        const emailBody = `
          <meta charset="utf-8">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; border-radius: 16px; background-color: #0B0B1A; color: white;">
              <div style="text-align: center; margin-bottom: 25px;">
                  <div style="font-size: 3rem; margin-bottom: 10px;">❌</div>
                  <h2 style="color: #FF6B6B; margin: 0; font-size: 1.8rem; font-weight: 700; letter-spacing: -0.5px;">Cita Cancelada</h2>
                  <p style="color: rgba(255, 255, 255, 0.6); margin: 5px 0 0 0; font-size: 0.95rem;">Un horario de Welcome Call ha sido liberado</p>
              </div>
              
              <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
                  Hola <strong>${trainerName}</strong>,
              </p>
              <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
                  Te informamos que la cita de Welcome Call agendada por el cliente ha sido <strong>cancelada</strong>. El horario correspondiente ha sido liberado automáticamente en la web de Ingenia IA y vuelve a estar disponible para reservas.
              </p>

              <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #f87171; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">📅 Detalles de la Cita Cancelada</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7); width: 35%;">Cliente:</td>
                          <td style="padding: 6px 0; color: white;">${clientName} (${clientEmail || "No especificado"})</td>
                      </tr>
                      <tr>
                          <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Fecha y Hora:</td>
                          <td style="padding: 6px 0; color: white;">${callDate}</td>
                      </tr>
                      <tr>
                          <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Estado actual:</td>
                          <td style="padding: 6px 0; color: #10B981; font-weight: bold;">DISPONIBLE EN LA WEB</td>
                      </tr>
                  </table>
              </div>

              <p style="font-size: 0.9rem; line-height: 1.5; color: rgba(255, 255, 255, 0.7); margin-top: 30px;">
                  Esta es una notificación automática del sistema. No es necesario realizar ninguna acción adicional.
              </p>

              <div style="text-align: center; margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; font-size: 0.8rem; color: rgba(255,255,255,0.4);">
                  Soporte Técnico de Ingenia IA & Infinite Coach <br>
                  <a href="https://ingeniaia.es" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">www.ingeniaia.es</a>
              </div>
          </div>
        `;

        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || "587"),
          secure: parseInt(SMTP_PORT || "587") === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        const recipients = [trainerEmail, "ingenia@ingeniaia.es"].filter(Boolean).join(", ");

        await transporter.sendMail({
          from: SMTP_FROM || `"Ingenia IA" <${SMTP_USER}>`,
          to: recipients,
          subject: `❌ Cancelación de Welcome Call: ${clientName}`,
          html: emailBody,
        });
        console.log("Cancellation email sent successfully to:", recipients);
      }
    } catch (mailErr) {
      console.error("Error sending cancellation email:", mailErr);
    }

    // 4. Mostrar pantalla de éxito
    return new NextResponse(
      renderHtml({
        success: true,
        title: "Cita Cancelada con Éxito",
        message: "El horario se ha liberado correctamente en la web de Ingenia IA para que otra persona pueda reservar.",
        detailsHtml: `
          <div class="details-box">
            <div class="details-row">
              <span class="details-label">Horario Liberado:</span>
              <span class="details-val">${slot.replace("_", " ")}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Acción:</span>
              <span class="details-val" style="color: #10B981;">Liberación Exitosa</span>
            </div>
          </div>
        `,
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (err: any) {
    console.error("Error en cancel-appointment API:", err);
    return new NextResponse(
      renderHtml({
        success: false,
        title: "Error de Servidor",
        message: err.message || "Ha ocurrido un error inesperado al procesar la cancelación de la cita.",
        detailsHtml: "",
      }),
      { status: 500, headers: responseHeaders }
    );
  }
}

function renderHtml({
  success,
  title,
  message,
  detailsHtml,
}: {
  success: boolean;
  title: string;
  message: string;
  detailsHtml: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | Ingenia IA</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-dark: #0B0B1A;
                --c-cyan: #00D9FF;
                --c-purple: #8B5CF6;
                --c-text: #F3F4F6;
                --c-text-muted: rgba(255, 255, 255, 0.6);
                --border-color: rgba(255, 255, 255, 0.08);
            }
            body {
                margin: 0;
                padding: 0;
                background-color: var(--bg-dark);
                color: var(--c-text);
                font-family: 'Inter', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                overflow: hidden;
                position: relative;
            }
            /* Background Glows */
            .bg-glow {
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, transparent 70%);
                top: 20%;
                left: 20%;
                z-index: 1;
                filter: blur(40px);
            }
            .bg-glow-2 {
                position: absolute;
                width: 500px;
                height: 500px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
                bottom: 10%;
                right: 15%;
                z-index: 1;
                filter: blur(50px);
            }
            .card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--border-color);
                border-radius: 24px;
                padding: 40px;
                max-width: 480px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 10;
                position: relative;
                box-sizing: border-box;
            }
            .icon-wrap {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px auto;
                color: #EF4444;
                font-size: 2.5rem;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
            }
            .success-icon-wrap {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px auto;
                color: #10B981;
                font-size: 2.5rem;
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
            }
            h1 {
                font-family: 'Outfit', sans-serif;
                font-size: 1.8rem;
                margin: 0 0 12px 0;
                font-weight: 700;
                letter-spacing: -0.5px;
                background: linear-gradient(90deg, #fff 0%, var(--c-cyan) 50%, var(--c-purple) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            p {
                font-size: 0.95rem;
                line-height: 1.6;
                color: var(--c-text-muted);
                margin: 0 0 24px 0;
            }
            .details-box {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
                font-size: 0.9rem;
            }
            .details-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .details-row:last-child {
                margin-bottom: 0;
            }
            .details-label {
                color: var(--c-text-muted);
            }
            .details-val {
                font-weight: 600;
                color: var(--c-text);
            }
            .btn {
                display: inline-block;
                background: var(--c-cyan);
                color: #0b0b1a;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
                cursor: pointer;
                border: none;
                width: 100%;
                box-sizing: border-box;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 25px rgba(0, 217, 255, 0.4);
            }
            .footer-text {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.3);
                margin-top: 24px;
            }
        </style>
    </head>
    <body>
        <div class="bg-glow"></div>
        <div class="bg-glow-2"></div>
        <div class="card">
            <div class="${success ? "success-icon-wrap" : "icon-wrap"}">${success ? "📅" : "⚠️"}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            ${detailsHtml}
            <button class="btn" onclick="window.close()">Cerrar pestaña</button>
            <div class="footer-text">Soporte Técnico de Ingenia IA & Infinite Coach</div>
        </div>
    </body>
    </html>
  `;
}
