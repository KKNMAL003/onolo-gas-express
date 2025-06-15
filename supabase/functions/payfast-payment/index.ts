
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
    logStep("PayFast Onsite payment function started");

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

    // Get the origin for return URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create PayFast payment data for Onsite
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success?m_payment_id=${orderId}&payment_source=payfast`,
      cancel_url: `${origin}/payment-cancelled?m_payment_id=${orderId}&payment_source=payfast`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-notify`,
      name_first: customerName.split(' ')[0] || customerName,
      name_last: customerName.split(' ').slice(1).join(' ') || '',
      email_address: customerEmail,
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: "Onolo Group Gas Delivery",
      item_description: `Gas delivery order #${orderId.slice(0, 8)} to ${deliveryAddress}`,
      email_confirmation: "1",
      confirmation_address: customerEmail
    };

    // Generate signature for PayFast
    const generateSignature = (data: any, passphrase?: string) => {
      const sortedKeys = Object.keys(data).sort();
      const sortedData = sortedKeys
        .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined)
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      
      const stringToSign = passphrase ? `${sortedData}&passphrase=${passphrase}` : sortedData;
      logStep("PayFast signature string", { stringToSign });
      
      // For sandbox testing - in production, implement proper MD5 hash
      return btoa(stringToSign).substring(0, 32);
    };

    paymentData.signature = generateSignature(paymentData, passphrase);

    // Convert data to form string for PayFast API
    const dataToString = (dataArray: any) => {
      let pfOutput = '';
      for (const [key, val] of Object.entries(dataArray)) {
        if (val !== '') {
          pfOutput += `${key}=${encodeURIComponent(String(val))}&`;
        }
      }
      return pfOutput.slice(0, -1); // Remove last ampersand
    };

    const pfParamString = dataToString(paymentData);
    logStep("PayFast parameter string", { pfParamString });

    // Call PayFast Onsite API to get UUID
    const payfastUrl = "https://sandbox.payfast.co.za/onsite/process";
    
    const payfastResponse = await fetch(payfastUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: pfParamString
    });

    if (!payfastResponse.ok) {
      throw new Error(`PayFast API error: ${payfastResponse.status} ${payfastResponse.statusText}`);
    }

    const payfastResult = await payfastResponse.json();
    logStep("PayFast Onsite response", payfastResult);

    if (!payfastResult.uuid) {
      throw new Error("Failed to get PayFast payment UUID");
    }

    // Update order status to pending payment
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'pending',
        updated_by: 'payfast_system',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      logStep("Error updating order", updateError);
      throw new Error("Failed to update order status");
    }

    logStep("Order updated to pending payment", { orderId });

    // Return UUID for frontend to use with PayFast Onsite modal
    return new Response(JSON.stringify({ 
      success: true,
      uuid: payfastResult.uuid,
      returnUrl: `${origin}/payment-success?m_payment_id=${orderId}&payment_source=payfast`,
      cancelUrl: `${origin}/payment-cancelled?m_payment_id=${orderId}&payment_source=payfast`,
      message: "PayFast payment UUID generated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayFast payment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
