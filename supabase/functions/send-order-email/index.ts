
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { orderId, type, customerEmail, customerName } = await req.json();
    logStep("Email request received", { orderId, type, customerEmail, customerName });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      logStep("Order not found", { orderId, error: orderError });
      throw new Error("Order not found");
    }

    logStep("Order retrieved", { orderId: order.id, status: order.status, items: order.order_items?.length });

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const formatCurrency = (amount: number) => `R ${amount.toFixed(2)}`;
    const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA');
    const shortOrderId = order.id.slice(0, 8).toUpperCase();

    // Generate order items HTML
    const orderItemsHtml = order.order_items?.map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 8px; text-align: left;">${item.product_name}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(item.total_price)}</td>
      </tr>
    `).join('') || '';

    // Email template for customer
    const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Onolo Group</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Order Confirmation</h1>
          <p style="margin: 5px 0 0 0;">Thank you for your order!</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #FF6B35; margin-top: 0;">Order #${shortOrderId}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.delivery_phone}</p>
            <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #f0f0f0; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">Total Amount:</td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">${formatCurrency(order.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #2E7D32;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll process your order and confirm availability</li>
              <li>You'll receive delivery updates via email and SMS</li>
              <li>Our delivery team will contact you before arrival</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 20px 0; color: #666;">
            <p>Need help? Contact us:</p>
            <p><strong>Email:</strong> info@onologroup.com | <strong>WhatsApp:</strong> 071 770 3063</p>
          </div>
        </div>
      </body>
    </html>`;

    // Email template for company
    const companyEmailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received - Order #${shortOrderId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Order Received</h1>
          <p style="margin: 5px 0 0 0;">Order #${shortOrderId}</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.delivery_phone}</p>
            <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #f0f0f0; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">Total Amount:</td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">${formatCurrency(order.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${order.notes ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">Order Notes</h3>
            <p style="margin: 0;">${order.notes}</p>
          </div>
          ` : ''}
        </div>
      </body>
    </html>`;

    const results = [];

    // Send email to customer
    try {
      logStep("Sending customer email", { to: order.customer_email });
      
      const customerEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Onolo Group <info19music@gmail.com>',
          to: [order.customer_email],
          subject: `Order Confirmation #${shortOrderId} - Onolo Group`,
          html: customerEmailHtml,
        }),
      });

      if (customerEmailResponse.ok) {
        const customerResult = await customerEmailResponse.json();
        logStep("Customer email sent successfully", { emailId: customerResult.id });
        results.push({ type: 'customer', success: true, emailId: customerResult.id });
      } else {
        const errorText = await customerEmailResponse.text();
        logStep("Customer email failed", { error: errorText });
        results.push({ type: 'customer', success: false, error: errorText });
      }
    } catch (error) {
      logStep("Customer email error", { error: error.message });
      results.push({ type: 'customer', success: false, error: error.message });
    }

    // Send email to company
    try {
      logStep("Sending company email", { to: 'info@onologroup.com' });
      
      const companyEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Onolo Group Orders <info19music@gmail.com>',
          to: ['info@onologroup.com'],
          subject: `New Order #${shortOrderId} from ${order.customer_name}`,
          html: companyEmailHtml,
        }),
      });

      if (companyEmailResponse.ok) {
        const companyResult = await companyEmailResponse.json();
        logStep("Company email sent successfully", { emailId: companyResult.id });
        results.push({ type: 'company', success: true, emailId: companyResult.id });
      } else {
        const errorText = await companyEmailResponse.text();
        logStep("Company email failed", { error: errorText });
        results.push({ type: 'company', success: false, error: errorText });
      }
    } catch (error) {
      logStep("Company email error", { error: error.message });
      results.push({ type: 'company', success: false, error: error.message });
    }

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
