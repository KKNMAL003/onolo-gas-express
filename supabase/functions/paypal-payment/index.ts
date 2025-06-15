
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_CLIENT_ID = "AQXiJ3htdCqiXbnleDxdkHIEqXlNYrGYW-gTWj-OObM4cjZzzaxRXynW2rXHJuNsiH6Z0oftxGs1ziZK";
const PAYPAL_CLIENT_SECRET = "EPWP2X0svwpLbMQgIxh-9o60ssNaJabTLzMGLE13Lmn4wAnz2bmBxU1oDWbzg8rdsC3ewFvtMO-p48bS";
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"; // Sandbox URL

async function getPayPalAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createPayPalOrder(accessToken: string, amount: number, orderId: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        amount: {
          currency_code: 'USD', // PayPal sandbox typically uses USD
          value: (amount / 18).toFixed(2), // Convert ZAR to USD roughly for sandbox
        },
        description: `Onolo Group Order #${orderId.slice(0, 8)}`,
      }],
      application_context: {
        return_url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/payment-success?order_id=${orderId}`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/payment-cancelled?order_id=${orderId}`,
        brand_name: 'Onolo Group',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal order creation failed:', errorText);
    throw new Error('Failed to create PayPal order');
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, amount, customerName, customerEmail, deliveryAddress } = await req.json();

    console.log('Creating PayPal payment for:', { orderId, amount, customerName, customerEmail });

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    console.log('PayPal access token obtained');

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(accessToken, amount, orderId);
    console.log('PayPal order created:', paypalOrder.id);

    // Find the approval URL
    const approvalUrl = paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    return new Response(JSON.stringify({
      success: true,
      paypalOrderId: paypalOrder.id,
      approvalUrl,
      message: 'PayPal payment initiated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('PayPal payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Failed to initiate PayPal payment'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
