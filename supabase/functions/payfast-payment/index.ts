
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

// MD5 hash function for Deno
const md5 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    logStep("PayFast form generation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId, amount, customerName, customerEmail, deliveryAddress } = await req.json();
    logStep("Payment form request received", { orderId, amount, customerEmail });

    // PayFast sandbox credentials
    const merchantId = "10004002";
    const merchantKey = "q1cd2rdny4a53";
    const passphrase = "payfast";

    // Get the origin for return URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Split customer name into first and last
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create PayFast form data according to their documentation
    const formData = {
      // Merchant details
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/payment-success?m_payment_id=${orderId}&payment_source=payfast`,
      cancel_url: `${origin}/payment-cancelled?m_payment_id=${orderId}&payment_source=payfast`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-notify`,
      
      // Customer details
      name_first: firstName,
      name_last: lastName,
      email_address: customerEmail,
      
      // Transaction details
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: "Onolo Group Gas Delivery",
      item_description: `Gas delivery order #${orderId.slice(0, 8)} to ${deliveryAddress.slice(0, 50)}`,
      
      // Transaction options
      email_confirmation: "1",
      confirmation_address: customerEmail
    };

    // Generate signature according to PayFast documentation
    const generateSignature = async (data: any, passphrase?: string) => {
      // Create parameter string in the exact order fields appear in form
      const orderedKeys = [
        'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
        'name_first', 'name_last', 'email_address',
        'm_payment_id', 'amount', 'item_name', 'item_description',
        'email_confirmation', 'confirmation_address'
      ];
      
      let paramString = '';
      orderedKeys.forEach(key => {
        if (data[key] && data[key] !== '') {
          paramString += `${key}=${encodeURIComponent(data[key])}&`;
        }
      });
      
      // Remove last ampersand
      paramString = paramString.slice(0, -1);
      
      // Add passphrase if provided
      if (passphrase) {
        paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
      }
      
      logStep("Signature generation string", { 
        paramString: paramString.substring(0, 200) + '...',
        fullLength: paramString.length
      });
      
      return await md5(paramString);
    };

    // Generate and add signature
    formData.signature = await generateSignature(formData, passphrase);
    logStep("Signature generated", { signature: formData.signature });

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
    logStep("PayFast form data generated successfully", { 
      paymentId: orderId,
      amount: formData.amount,
      itemName: formData.item_name
    });

    return new Response(JSON.stringify({ 
      success: true,
      formData: formData,
      message: "PayFast payment form generated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in PayFast payment form generation", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
