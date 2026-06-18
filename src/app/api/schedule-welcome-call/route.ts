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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientGoal,
      trainerEmail,
      trainerName = "Alejandra Sanchis",
      callDate,
      callDateIso,
      callTimeStart = "09:00",
    } = body;

    if (!clientName || !clientEmail || !trainerEmail || !callDate || !callDateIso) {
      return NextResponse.json(
        { success: false, error: "Faltan datos obligatorios para agendar la llamada" },
        { status: 400, headers }
      );
    }

    // 1. Calcular fechas de inicio y fin en UTC
    const [year, month, day] = callDateIso.split("-").map(Number);
    const cleanTimeStart = callTimeStart.split(" ")[0].trim();
    const [hour, min] = cleanTimeStart.split(":").map(Number);
    const tempDate = new Date(Date.UTC(year, month - 1, day, hour, min, 0));
    const offset = getMadridUTCOffset(tempDate);
    const startDate = new Date(Date.UTC(year, month - 1, day, hour - offset, min, 0));
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 min de llamada

    // 2. Generar enlaces
    const teamsLink = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_welcomecall_ingeniaia";
    const demoLink = `https://coachdemo.infinitecoach.es/trainer-login.html?name=${encodeURIComponent(
      clientName
    )}&email=${encodeURIComponent(clientEmail)}&goal=${encodeURIComponent(
      clientGoal || "lose"
    )}&admin_email=${encodeURIComponent(trainerEmail)}&date=${encodeURIComponent(
      callDate
    )}&date_iso=${callDateIso}`;
    const uid = `welcome-call-${Date.now()}@ingeniaia.es`;
    const confirmLink = `https://coachdemo.infinitecoach.es/api/confirm-appointment?name=${encodeURIComponent(
      clientName
    )}&email=${encodeURIComponent(clientEmail)}&trainer_email=${encodeURIComponent(
      trainerEmail
    )}&trainer_name=${encodeURIComponent(trainerName)}&date=${encodeURIComponent(
      callDate
    )}&date_iso=${callDateIso}&uid=${uid}&time_start=${callTimeStart}&demo=${encodeURIComponent(demoLink)}`;

    // Calcular slotKey y generar enlace de cancelación
    let cancelLink = "";
    let slotKey = "";
    const timeMatch = callDate.match(/(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/);
    const timeRange = timeMatch ? timeMatch[1].replace(/\s/g, "") : "";
    if (callDateIso && timeRange) {
      slotKey = `${callDateIso}_${timeRange}`;
      cancelLink = `https://coachdemo.infinitecoach.es/api/cancel-appointment?slot=${encodeURIComponent(slotKey)}&name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(clientEmail)}&trainer_email=${encodeURIComponent(trainerEmail)}&trainer_name=${encodeURIComponent(trainerName)}&date=${encodeURIComponent(callDate)}`;
    }

    // 2.5 Registrar la cita como reservada/bloqueada en Supabase saas_config
    if (slotKey) {
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
            
            const isAlreadyBooked = configData.bookedWelcomeCalls.some((item: any) => {
              if (typeof item === 'string') {
                return item === slotKey;
              } else if (item && typeof item === 'object') {
                const isConfirmed = item.confirmed === true;
                const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0;
                const isExpired = !isConfirmed && (Date.now() - createdAt > 4 * 60 * 60 * 1000);
                return item.slot === slotKey && !isExpired;
              }
              return false;
            });

            if (!isAlreadyBooked) {
              // Limpiar cualquier reserva previa (ej. expirada) para este mismo slot
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
                confirmed: false
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
              console.log("Welcome Call scheduled slot booked (unconfirmed) in Supabase:", slotKey);
            }
          }
        }
      } catch (dbErr) {
        console.error("Error updating bookedWelcomeCalls in schedule-welcome-call:", dbErr);
      }
    }

    // 3. Crear el archivo iCalendar (.ics) para autoprogramación en Outlook
    const icsString = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ingenia IA//Welcome Call//ES",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      "SEQUENCE:0",
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:Welcome Call: ${trainerName} (Infinite Coach Onboarding)`,
      `DESCRIPTION:Videollamada de Activación de tu Licencia de Infinite Coach.\\n\\nEnlace de Teams: ${teamsLink}\\n\\nAcceso a tu Demo: ${demoLink}${cancelLink ? `\\n\\nPara cancelar o cambiar la fecha, haz clic aquí: ${cancelLink}` : ""}\\n\\n¡Nos vemos pronto!`,
      "LOCATION:Microsoft Teams Meeting",
      'ORGANIZER;CN="Ingenia IA":mailto:ingenia@ingeniaia.es',
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="Ingenia IA":mailto:ingenia@ingeniaia.es`,
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${trainerName}":mailto:${trainerEmail}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Recordatorio",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    // 4. Diseñar HTML del correo en modo oscuro premium
    const emailBody = `
      <meta charset="utf-8">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; border-radius: 16px; background-color: #0B0B1A; color: white;">
          <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">🏋️</div>
              <h2 style="color: #00D9FF; margin: 0; font-size: 1.8rem; font-weight: 700; letter-spacing: -0.5px;">Welcome Call Agendada</h2>
              <p style="color: rgba(255, 255, 255, 0.6); margin: 5px 0 0 0; font-size: 0.95rem;">Tu licencia de Infinite Coach está lista para activar</p>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
              ¡Hola <strong>${trainerName}</strong>!
          </p>
          <p style="font-size: 1rem; line-height: 1.5; color: rgba(255, 255, 255, 0.9);">
              Hemos recibido tu solicitud de licencia e implantación para <strong>Infinite Coach</strong>. Tu llamada de bienvenida (Welcome Call) de 15 minutos ha quedado registrada.
          </p>

          <!-- Caja de Cita -->
          <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #a78bfa; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">📅 Detalles de tu Cita</h3>
              <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7); width: 35%;">Fecha y Hora:</td>
                      <td style="padding: 6px 0; color: white;">${callDate}</td>
                  </tr>
                  <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: rgba(255,255,255,0.7);">Plataforma:</td>
                      <td style="padding: 6px 0; color: white;">Microsoft Teams</td>
                  </tr>
              </table>
              
              <div style="margin-top: 15px; border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 15px; text-align: center;">
                  <a href="${confirmLink}" style="display: inline-block; background: #10B981; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; margin: 5px;">
                      ✅ CONFIRME CITA
                  </a>
                  <a href="${teamsLink}" style="display: inline-block; background: #8B5CF6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; margin: 5px;">
                      💻 Unirse a la reunión de Teams
                  </a>
              </div>
          </div>

          <!-- Caja de Demo -->
          <div style="background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <h3 style="margin-top: 0; color: #00D9FF; font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">🚀 Tu Demo Interactiva está Activa</h3>
              <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 16px;">
                  Ya puedes acceder a tu entorno real de Infinite Coach en modo de prueba con el cliente de demostración que has creado.
              </p>
              <a href="${demoLink}" style="display: inline-block; background: #00D9FF; color: #0B0B1A; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 0.95rem;">
                  💻 Entrar a mi Demo de Infinite Coach
              </a>
          </div>

          <p style="font-size: 0.9rem; line-height: 1.5; color: rgba(255, 255, 255, 0.7); margin-top: 30px;">
              Hemos adjuntado una invitación de calendario a este correo. Por favor, <strong>acepta la invitación</strong> para agregar la videollamada a tu calendario personal de Outlook o Google.
          </p>
          <p style="font-size: 0.9rem; line-height: 1.5; color: #FF6B6B; font-weight: 500; margin-top: 15px;">
              ⚠️ En caso de querer cancelar o modificar la llamada, puedes liberar el horario directamente <a href="${cancelLink}" style="color: #FF6B6B; text-decoration: underline; font-weight: bold;">haciendo clic aquí</a> o indicárnoslo respondiendo a este mismo correo.
          </p>

          <div style="text-align: center; margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; font-size: 0.8rem; color: rgba(255,255,255,0.4);">
              Soporte Técnico de Ingenia IA & Infinite Coach <br>
              <a href="https://ingeniaia.es" style="color: rgba(255, 255, 255, 0.5); text-decoration: underline;">www.ingeniaia.es</a>
          </div>
      </div>
    `;

    // 5. Configurar Nodemailer
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Faltan variables de entorno SMTP en el servidor");
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: parseInt(SMTP_PORT || "587") === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Enviar correo a Alejandra y copia oculta/directa a Ingenia IA con el archivo de invitación (.ics)
    await transporter.sendMail({
      from: SMTP_FROM || `"Ingenia IA" <${SMTP_USER}>`,
      to: `${trainerEmail}, ingenia@ingeniaia.es`,
      subject: `📅 Confirmación de Welcome Call: ${callDate}`,
      html: emailBody,
      icalEvent: {
        filename: "invite.ics",
        method: "REQUEST",
        content: icsString,
      },
    });

    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch (err: any) {
    console.error("Error scheduling welcome call:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error al procesar el envío de la cita" },
      { status: 500, headers }
    );
  }
}
