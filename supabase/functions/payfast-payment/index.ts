
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYFAST-PAYMENT] ${step}${detailsStr}`);
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
    logStep("PayFast payment function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId, amount, customerName, customerEmail, deliveryAddress } = await req.json();
    logStep("Payment request received", { orderId, amount, customerEmail });

    // PayFast test credentials
    const merchantId = "10004002";
    const merchantKey = "q1cd2rdny4a53";
    const passphrase = "payfast";

    // Create PayFast payment data
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-notify`,
      name_first: customerName.split(' ')[0] || customerName,
      name_last: customerName.split(' ').slice(1).join(' ') || '',
      email_address: customerEmail,
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: "Gas Delivery Order",
      item_description: `Gas delivery to ${deliveryAddress}`,
      email_confirmation: "1",
      confirmation_address: customerEmail
    };

    // Generate signature for PayFast
    const generateSignature = (data: any, passphrase?: string) => {
      const sortedData = Object.keys(data)
        .sort()
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      
      const stringToSign = passphrase ? `${sortedData}&passphrase=${passphrase}` : sortedData;
      
      // Simple hash simulation for testing
      return btoa(stringToSign).substring(0, 32);
    };

    paymentData.signature = generateSignature(paymentData, passphrase);

    // Update order status to pending payment
    await supabaseClient
      .from('orders')
      .update({ 
        status: 'pending',
        updated_by: 'payfast_system',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    logStep("Order updated to pending payment", { orderId });

    // Return PayFast form data for client-side submission (using sandbox)
    return new Response(JSON.stringify({ 
      success: true,
      paymentData,
      paymentUrl: "https://sandbox.payfast.co.za/eng/process"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayFast payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
