import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getMadridUTCOffset(date: Date): number {
  const year = date.getFullYear();
  const dstStart = SetDSTSunday(year, 2); // March
  const dstEnd = SetDSTSunday(year, 9); // October

  if (date >= dstStart && date < dstEnd) {
    return 2; // Summer Time (UTC+2)
  }
  return 1; // Winter Time (UTC+1)
}

function SetDSTSunday(year: number, monthIndex: number): Date {
  const d = new Date(Date.UTC(year, monthIndex, 31, 1, 0, 0));
  const day = d.getUTCDay();
  d.setUTCDate(31 - day);
  return d;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientName = searchParams.get("name") || "Cliente";
  const clientEmail = searchParams.get("email") || "";
  const trainerEmail = searchParams.get("trainer_email") || "";
  const trainerName = searchParams.get("trainer_name") || "Asesor";
  const callDate = searchParams.get("date") || "";
  const callDateIso = searchParams.get("date_iso") || "";
  const timeStart = searchParams.get("time_start") || "09:00";
  const uid = searchParams.get("uid") || "";
  const demoLink = searchParams.get("demo") || "#";

  if (!clientEmail || !trainerEmail || !callDateIso || !uid) {
    // Fallback redirect if parameters are missing
    return NextResponse.redirect(
      new URL(
        `/confirmar-cita.html?name=${encodeURIComponent(clientName)}&trainer=${encodeURIComponent(
          trainerName
        )}&date=${encodeURIComponent(callDate)}&demo=${encodeURIComponent(demoLink)}`,
        request.url
      )
    );
  }

  try {
    // Calcular slotKey y generar enlace de cancelación
    let cancelLink = "";
    let slotKey = "";
    const timeMatch = callDate.match(/(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/);
    const timeRange = timeMatch ? timeMatch[1].replace(/\s/g, "") : "";
    if (callDateIso && timeRange) {
      slotKey = `${callDateIso}_${timeRange}`; // e.g. "2026-06-15_09:30-09:45"
      cancelLink = `https://coachdemo.infinitecoach.es/api/cancel-appointment?slot=${encodeURIComponent(slotKey)}&name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(clientEmail)}&trainer_email=${encodeURIComponent(trainerEmail)}&trainer_name=${encodeURIComponent(trainerName)}&date=${encodeURIComponent(callDate)}`;
    }

    // 0. Registrar la cita como reservada/bloqueada en Supabase saas_config
    const supabaseUrl = "https://bieeydhacavxymoosasx.supabase.co";
    const supabaseKey = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
    
    try {
      const getRes = await fetch(`${supabaseUrl}/rest/v1/saas_config?id=eq.config`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });
      if (getRes.ok) {
        const rows = await getRes.json();
        if (rows && rows.length > 0) {
          const configRow = rows[0];
          const configData = configRow.data || {};
          
          if (!configData.bookedWelcomeCalls) {
            configData.bookedWelcomeCalls = [];
          }
          
          if (slotKey) {
            // Eliminar cualquier entrada previa para este slot (ej. sin confirmar)
            configData.bookedWelcomeCalls = configData.bookedWelcomeCalls.filter((item: any) => {
              if (typeof item === 'string') {
                return item !== slotKey;
              } else if (item && typeof item === 'object') {
                return item.slot !== slotKey;
              }
              return true;
            });

            configData.bookedWelcomeCalls.push({
              slot: slotKey,
              created_at: new Date().toISOString(),
              confirmed: true
            });
            
            await fetch(`${supabaseUrl}/rest/v1/saas_config?id=eq.config`, {
              method: "POST",
              headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
              },
              body: JSON.stringify({
                id: "config",
                data: configData,
                updated_at: new Date().toISOString()
              })
            });
            console.log("Welcome Call slot confirmed and booked in Supabase:", slotKey);
          }
        }
      }
    } catch (dbErr) {
      console.error("Error updating bookedWelcomeCalls in Supabase:", dbErr);
    }

    // 1. Calcular fechas de inicio y fin en UTC
    const [year, month, day] = callDateIso.split("-").map(Number);
    const cleanTimeStart = timeStart.split(" ")[0].trim();
    const [hour, min] = cleanTimeStart.split(":").map(Number);
    const tempDate = new Date(Date.UTC(year, month - 1, day, hour, min, 0));
    const offset = getMadridUTCOffset(tempDate);
    const startDate = new Date(Date.UTC(year, month - 1, day, hour - offset, min, 0));
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 min de llamada

    // 2. Crear el archivo iCalendar de REPLY (.ics)
    const icsReplyString = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ingenia IA//Welcome Call//ES",
      "METHOD:REPLY",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      "SEQUENCE:0",
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      'ORGANIZER;CN="Ingenia IA":mailto:ingenia@ingeniaia.es',
      `ATTENDEE;CN="${clientName}";PARTSTAT=ACCEPTED;RSVP=TRUE:mailto:${clientEmail}`,
      `ATTENDEE;CN="${trainerName}";PARTSTAT=ACCEPTED;RSVP=TRUE:mailto:${trainerEmail}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    // 3. Diseñar correo de aviso para el asesor
    const notificationHtml = `
      <meta charset="utf-8">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; border-radius: 16px; background-color: #0B0B1A; color: white;">
          <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
              <h2 style="color: #10B981; margin: 0; font-size: 1.8rem; font-weight: 700; letter-spacing: -0.5px;">Cita Confirmada por Cliente</h2>
              <p style="color: rgba(255, 255, 255, 0.6); margin: 5px 0 0 0; font-size: 0.95rem;">La Welcome Call ha sido aceptada oficialmente</p>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
              Hola <strong>${trainerName}</strong>,
          </p>
          <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
              El cliente <strong>${clientName}</strong> (${clientEmail}) ha hecho clic en el botón de confirmación en su correo.
          </p>

          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #10B981; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">📅 Detalles de la Cita</h3>
              <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7); width: 35%;">Cliente:</td>
                      <td style="padding: 6px 0; color: white;">${clientName} (${clientEmail})</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Fecha y Hora:</td>
                      <td style="padding: 6px 0; color: white;">${callDate}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Estado en Outlook:</td>
                      <td style="padding: 6px 0; color: #10B981; font-weight: bold;">ACEPTADO (Autoprocesado)</td>
                  </tr>
                  ${cancelLink ? `
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Gestión:</td>
                      <td style="padding: 6px 0; color: white;">
                          <a href="${cancelLink}" style="color: #FF6B6B; text-decoration: underline; font-weight: bold;">Liberar / Cancelar Horario</a>
                      </td>
                  </tr>
                  ` : ""}
              </table>
          </div>

          <p style="font-size: 0.9rem; line-height: 1.5; color: rgba(255, 255, 255, 0.7); margin-top: 30px;">
              El estado de la reunión en tu calendario de Outlook ha sido actualizado automáticamente a <strong>Aceptado</strong> mediante el archivo de respuesta adjunto a esta confirmación.
          </p>

          <div style="text-align: center; margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; font-size: 0.8rem; color: rgba(255,255,255,0.4);">
              Soporte Técnico de Ingenia IA & Infinite Coach <br>
              <a href="https://ingeniaia.es" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">www.ingeniaia.es</a>
          </div>
      </div>
    `;

    // 4. Configurar Nodemailer
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587"),
        secure: parseInt(SMTP_PORT || "587") === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      // Enviar correo de REPLY al organizador (e ingenias)
      await transporter.sendMail({
        from: SMTP_FROM || `"Ingenia IA" <${SMTP_USER}>`,
        to: `${trainerEmail}, ingenia@ingeniaia.es`,
        subject: `Aceptado: Welcome Call: ${trainerName} (Infinite Coach Onboarding)`,
        html: notificationHtml,
        icalEvent: {
          filename: "invite.ics",
          method: "REPLY",
          content: icsReplyString,
        },
      });
    }
  } catch (err) {
    console.error("Error processing confirm-appointment:", err);
  }

  // 5. Redireccionar al usuario a la página estática final de éxito
  return NextResponse.redirect(
    new URL(
      `/confirmar-cita.html?name=${encodeURIComponent(clientName)}&trainer=${encodeURIComponent(
        trainerName
      )}&date=${encodeURIComponent(callDate)}&demo=${encodeURIComponent(demoLink)}`,
      request.url
    )
  );
}
