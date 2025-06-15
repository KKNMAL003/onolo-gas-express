
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("PayPal payment function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId, amount, customerName, customerEmail, deliveryAddress } = await req.json();
    logStep("Payment request received", { orderId, amount, customerEmail });

    // PayPal configuration
    const clientId = "AQXiJ3htdCqiXbnleDxdkHIEqXlNYrGYW-gTWj-OObM4cjZzzaxRXynW2rXHJuNsiH6Z0oftxGs1ziZK";
    const clientSecret = "EPWP2X0svwpLbMQgIxh-9o60ssNaJabTLzMGLE13Lmn4wAnz2bmBxU1oDWbzg8rdsC3ewFvtMO-p48bS";
    const baseUrl = "https://api-m.sandbox.paypal.com"; // Sandbox URL

    // Get PayPal access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    logStep("PayPal access token obtained");

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: (amount / 18).toFixed(2) // Convert ZAR to USD (approximate rate)
          },
          description: `Gas delivery to ${deliveryAddress}`,
          custom_id: orderId
        }],
        application_context: {
          return_url: `${req.headers.get("origin")}/payment-success`,
          cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
          brand_name: "Onolo Group",
          user_action: "PAY_NOW"
        }
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      logStep("PayPal order creation failed", { error: errorData });
      throw new Error("Failed to create PayPal order");
    }

    const orderData = await orderResponse.json();
    const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    logStep("PayPal order created", { orderId: orderData.id, approvalUrl });

    // Update order status to pending payment
    await supabaseClient
      .from('orders')
      .update({ 
        status: 'pending',
        updated_by: 'paypal_system',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    logStep("Order updated to pending payment", { orderId });

    return new Response(JSON.stringify({ 
      success: true,
      approvalUrl,
      paypalOrderId: orderData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayPal payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
