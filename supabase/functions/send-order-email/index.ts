
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendCustomerEmail, sendCompanyEmail } from './email-sender.ts';
import { fetchOrderDetails, authenticateUser } from './order-utils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ORDER-EMAIL] ${step}${detailsStr}`);
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
    logStep("Email function started");

    const authHeader = req.headers.get("Authorization");
    await authenticateUser(supabaseClient, authHeader);

    const { orderId, type, customerEmail, customerName } = await req.json();
    logStep("Email request received", { orderId, type, customerEmail, customerName });

    const order = await fetchOrderDetails(supabaseClient, orderId);

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const results = [];

    // Send emails concurrently
    const [customerResult, companyResult] = await Promise.all([
      sendCustomerEmail(order, resendApiKey),
      sendCompanyEmail(order, resendApiKey)
    ]);

    results.push(customerResult, companyResult);

    // Check if at least one email was sent successfully
    const successfulEmails = results.filter(r => r.success);
    const failedEmails = results.filter(r => !r.success);

    if (successfulEmails.length > 0) {
      logStep("Email function completed", { 
        successful: successfulEmails.length, 
        failed: failedEmails.length,
        results 
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: `${successfulEmails.length} email(s) sent successfully`,
        results
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error('All email attempts failed');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in email function", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: "Check function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
