import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, goals, customGoal, attitude, expectations, phone, email, howToContinue, toEmail, brand, primaryColor, subject } = body;

    // Validaciones básicas
    const hasGoals = (goals && goals.length > 0) || (customGoal && customGoal.trim());
    if (!name || !age || !hasGoals || !attitude || !phone || !email) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const goalList = goals ? [...goals] : [];
    if (customGoal) {
      goalList.push(`Otro: ${customGoal}`);
    }

    const targetBrand = brand || "ASTeam";
    const targetColor = primaryColor || "#fdbfec";
    const targetEmail = toEmail || "alejandra.asteam@gmail.com";

    // Configurar el contenido del correo
    const emailSubject = subject || `Nuevo formulario ${targetBrand}!`;
    const emailBody = `
      <meta charset="utf-8">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
        <h2 style="color: ${targetColor}; border-bottom: 2px solid ${targetColor}; padding-bottom: 10px;">Nueva Solicitud de Asesoría ${targetBrand}</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eeeeee; width: 35%;">Nombre y Apellidos:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Edad:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">${age} años</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Teléfono:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">
              <a href="tel:${phone}" style="color: ${targetColor}; text-decoration: none;">${phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Correo Electrónico:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">
              <a href="mailto:${email}" style="color: ${targetColor}; text-decoration: none;">${email}</a>
            </td>
          </tr>
          ${howToContinue ? `
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eeeeee;">Cómo continuar:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eeeeee;">${howToContinue}</td>
          </tr>
          ` : ""}
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid ${targetColor};">
          <h4 style="margin-top: 0; color: #333333; font-size: 1.05em;">🎯 Objetivos seleccionados:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.6;">
            ${goalList.map(g => `<li>${g}</li>`).join("")}
          </ul>
        </div>

        <div style="margin-top: 15px; padding: 15px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #FF6B6B;">
          <h4 style="margin-top: 0; color: #333333; font-size: 1.05em;">⚡ Actitud ante la asesoría:</h4>
          <p style="margin: 0; color: #555555; font-style: italic; line-height: 1.5;">"${attitude}"</p>
        </div>

        <div style="margin-top: 15px; padding: 15px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #a0a0a0;">
          <h4 style="margin-top: 0; color: #333333; font-size: 1.05em;">💬 ¿Cómo cree que le puedes ayudar y qué espera?</h4>
          <p style="margin: 0; color: #555555; white-space: pre-line; line-height: 1.5;">${expectations || "No especificado"}</p>
        </div>

        <p style="font-size: 0.85em; color: #888888; text-align: center; margin-top: 25px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
          Este correo fue generado automáticamente por la Landing Page de ${targetBrand}.
        </p>
      </div>
    `;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      // Configurar transportador de Nodemailer
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || "587"),
        secure: parseInt(SMTP_PORT || "587") === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM || `"${targetBrand} Asesorías" <${SMTP_USER}>`,
        to: targetEmail,
        subject: emailSubject,
        html: emailBody,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });

      console.log(`[Contact API] Correo enviado exitosamente a ${targetEmail} para ${name}`);
      return NextResponse.json({ success: true, message: "Correo enviado correctamente" });
    } else {
      console.warn("⚠️ Advertencia: SMTP no configurado en .env.local. Datos recibidos:");
      console.log(JSON.stringify(body, null, 2));
      return NextResponse.json({
        success: true,
        mocked: true,
        message: "Datos recibidos correctamente. (Modo simulación: SMTP no configurado)",
      });
    }
  } catch (error: any) {
    console.error("[Contact API] Error al procesar solicitud:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
