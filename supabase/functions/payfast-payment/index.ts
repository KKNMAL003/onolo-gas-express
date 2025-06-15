
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

// MD5 implementation using Web Crypto API for Deno
const md5 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Import crypto-js for MD5 since Web Crypto API doesn't support MD5
  const crypto = await import("https://deno.land/x/crypto@v0.17.0/crypto.ts");
  return crypto.md5(text).toString();
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

    // PayFast sandbox credentials - verified sandbox values
    const merchantId = "10004002";
    const merchantKey = "q1cd2rdny4a53";
    const passphrase = "payfast";

    // Get the origin for return URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create PayFast payment data
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
      item_description: `Gas delivery order #${orderId.slice(0, 8)}`,
      email_confirmation: "1",
      confirmation_address: customerEmail
    };

    // Generate signature without passphrase first for debugging
    const generateSignature = async (data: any, passphrase?: string) => {
      const sortedKeys = Object.keys(data).sort();
      const queryString = sortedKeys
        .filter(key => key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined)
        .map(key => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      
      const stringToSign = passphrase ? `${queryString}&passphrase=${passphrase}` : queryString;
      logStep("PayFast signature string", { stringToSign: stringToSign.substring(0, 200) + '...' });
      
      return await md5(stringToSign);
    };

    paymentData.signature = await generateSignature(paymentData, passphrase);
    logStep("Signature generated", { signature: paymentData.signature });

    // Convert data to form string for PayFast API
    const formData = new URLSearchParams();
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== '') {
        formData.append(key, String(value));
      }
    });

    logStep("Calling PayFast Onsite API");

    // Call PayFast Onsite API
    const payfastUrl = "https://sandbox.payfast.co.za/onsite/process";
    
    const payfastResponse = await fetch(payfastUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const responseText = await payfastResponse.text();
    logStep("PayFast API response", { 
      status: payfastResponse.status, 
      statusText: payfastResponse.statusText,
      response: responseText.substring(0, 500)
    });

    if (!payfastResponse.ok) {
      throw new Error(`PayFast API error: ${payfastResponse.status} ${payfastResponse.statusText} - ${responseText}`);
    }

    let payfastResult;
    try {
      payfastResult = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from PayFast: ${responseText}`);
    }

    logStep("PayFast Onsite response parsed", payfastResult);

    if (!payfastResult.uuid) {
      throw new Error(`Failed to get PayFast payment UUID: ${JSON.stringify(payfastResult)}`);
    }

    // Update order status to pending payment
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'Pending',
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
