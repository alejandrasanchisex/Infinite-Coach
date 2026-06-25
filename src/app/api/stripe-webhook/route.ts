import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Stripe Webhook] Event received:", body.type);

    const eventType = body.type;
    const dataObject = body.data?.object;

    if (eventType === "invoice.paid" && dataObject) {
      const customerEmail = dataObject.customer_email;
      if (customerEmail) {
        console.log(`[Stripe Webhook] Processing invoice.paid for: ${customerEmail}`);

        // 1. Fetch current saas_config
        const { data: configRow, error: fetchError } = await supabase
          .from("saas_config")
          .select("*")
          .eq("id", "config")
          .single();

        if (fetchError || !configRow) {
          console.error("[Stripe Webhook] Error fetching saas_config:", fetchError);
          return NextResponse.json({ success: false, error: "Database fetch failed" }, { status: 500 });
        }

        const platformData = configRow.data || {};
        const trainers = platformData.trainers || [];

        // 2. Find trainer by stripeEmail or email
        const trainerIdx = trainers.findIndex((t: any) => 
          (t.stripeEmail && t.stripeEmail.toLowerCase() === customerEmail.toLowerCase()) ||
          (t.email && t.email.toLowerCase() === customerEmail.toLowerCase())
        );

        if (trainerIdx !== -1) {
          const trainer = trainers[trainerIdx];
          
          // Calculate new expiry date based on Stripe period end
          const periodEndSeconds = dataObject.lines?.data?.[0]?.period?.end;
          let newExpiry = "";
          if (periodEndSeconds) {
            const expiryDate = new Date(periodEndSeconds * 1000);
            // Format as D/M/YYYY
            const day = expiryDate.getDate();
            const month = expiryDate.getMonth() + 1;
            const year = expiryDate.getFullYear();
            newExpiry = `${day}/${month}/${year}`;
          } else {
            // Fallback: +1 month from today
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            const day = expiryDate.getDate();
            const month = expiryDate.getMonth() + 1;
            const year = expiryDate.getFullYear();
            newExpiry = `${day}/${month}/${year}`;
          }

          console.log(`[Stripe Webhook] Updating trainer ${trainer.name} (${trainer.id}) license expiry to ${newExpiry}`);

          trainers[trainerIdx].expiryDate = newExpiry;
          trainers[trainerIdx].status = "active";

          // Save back to Supabase
          const { error: saveError } = await supabase
            .from("saas_config")
            .update({ data: platformData })
            .eq("id", "config");

          if (saveError) {
            console.error("[Stripe Webhook] Error saving updated config:", saveError);
            return NextResponse.json({ success: false, error: "Database save failed" }, { status: 500 });
          }

          console.log(`[Stripe Webhook] License updated successfully for ${trainer.name}`);
          return NextResponse.json({ success: true, message: `License updated to ${newExpiry}` });
        } else {
          console.warn(`[Stripe Webhook] No trainer found matching Stripe email: ${customerEmail}`);
          return NextResponse.json({ success: false, message: "No trainer matched" });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] General error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
