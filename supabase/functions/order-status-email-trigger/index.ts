
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-STATUS-EMAIL-TRIGGER] ${step}${detailsStr}`);
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
    const { orderId, oldStatus, newStatus } = await req.json();
    
    logStep("Processing status change", { orderId, oldStatus, newStatus });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('customer_email, customer_name, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Send status update email for important status changes
    const importantStatuses = ['order_confirmed', 'scheduled_for_delivery', 'driver_dispatched', 'out_for_delivery', 'delivered'];
    
    if (importantStatuses.includes(newStatus)) {
      const emailResponse = await supabaseClient.functions.invoke('send-order-email', {
        body: {
          orderId,
          type: 'status_update',
          customerEmail: order.customer_email,
          customerName: order.customer_name
        }
      });

      logStep("Status update email sent", { emailResponse });
    }

    // Send invoice email when order is delivered
    if (newStatus === 'delivered') {
      const invoiceResponse = await supabaseClient.functions.invoke('send-order-email', {
        body: {
          orderId,
          type: 'invoice',
          customerEmail: order.customer_email,
          customerName: order.customer_name
        }
      });

      logStep("Invoice email sent", { invoiceResponse });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in status email trigger", { message: errorMessage });
    
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
