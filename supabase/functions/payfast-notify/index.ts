
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

    const { m_payment_id, payment_status, pf_payment_id, amount_gross, amount_fee, amount_net } = paymentData;

    if (!m_payment_id) {
      logStep("No payment ID found in notification");
      return new Response("No payment ID", { status: 400 });
    }

    // Get order details first
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('customer_email, customer_name, status')
      .eq('id', m_payment_id)
      .single();

    if (orderError) {
      logStep("Error fetching order details", orderError);
      return new Response("Order not found", { status: 404 });
    }

    logStep("Order found", { orderId: m_payment_id, currentStatus: order.status });

    if (payment_status === "COMPLETE") {
      // Update order status to order_received (payment confirmed)
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ 
          status: 'order_received',
          payment_confirmation_sent: true,
          updated_by: 'payfast_webhook',
          updated_at: new Date().toISOString()
        })
        .eq('id', m_payment_id);

      if (updateError) {
        logStep("Error updating order status", updateError);
        return new Response("Update failed", { status: 500 });
      }

      logStep("Order status updated to order_received", { orderId: m_payment_id });

      // Send confirmation email
      try {
        const emailResponse = await supabaseClient.functions.invoke('send-order-email', {
          body: {
            orderId: m_payment_id,
            type: 'confirmation',
            customerEmail: order.customer_email,
            customerName: order.customer_name
          }
        });

        logStep("Confirmation email sent", { emailResponse });
      } catch (emailError) {
        logStep("Error sending confirmation email", emailError);
        // Don't fail the webhook if email fails
      }

      logStep("Payment confirmation completed", { 
        orderId: m_payment_id, 
        paymentId: pf_payment_id,
        amount: amount_gross,
        fee: amount_fee,
        net: amount_net
      });

    } else {
      logStep("Payment not complete", { status: payment_status, orderId: m_payment_id });
      
      // Update order status based on payment status
      let newStatus = 'pending';
      if (payment_status === 'CANCELLED') {
        newStatus = 'cancelled';
      } else if (payment_status === 'FAILED') {
        newStatus = 'payment_failed';
      }

      await supabaseClient
        .from('orders')
        .update({ 
          status: newStatus,
          updated_by: 'payfast_webhook',
          updated_at: new Date().toISOString()
        })
        .eq('id', m_payment_id);

      logStep("Order status updated", { orderId: m_payment_id, newStatus });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayFast notification", { message: errorMessage });
    return new Response("Error", { status: 500 });
  }
});
