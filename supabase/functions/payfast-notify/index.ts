
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYFAST-NOTIFY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("PayFast notification received");

    const formData = await req.formData();
    const paymentData = Object.fromEntries(formData.entries());
    
    logStep("Payment notification data", paymentData);

    const { m_payment_id, payment_status, pf_payment_id, amount_gross } = paymentData;

    if (payment_status === "COMPLETE") {
      // Update order status to order_received
      await supabaseClient
        .from('orders')
        .update({ 
          status: 'order_received',
          payment_confirmation_sent: true,
          updated_by: 'payfast_webhook',
          updated_at: new Date().toISOString()
        })
        .eq('id', m_payment_id);

      logStep("Order status updated to order_received", { orderId: m_payment_id });

      // Here you would typically send confirmation email/SMS
      // For now, we'll just log it
      logStep("Payment confirmation should be sent", { 
        orderId: m_payment_id, 
        paymentId: pf_payment_id,
        amount: amount_gross 
      });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayFast notification", { message: errorMessage });
    return new Response("Error", { status: 500 });
  }
});
