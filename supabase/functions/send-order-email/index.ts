
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  orderId: string;
  type: 'confirmation' | 'status_update' | 'invoice';
  customerEmail: string;
  customerName: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ORDER-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { orderId, type, customerEmail, customerName }: EmailRequest = await req.json();
    
    logStep("Processing email request", { orderId, type, customerEmail });

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'confirmation':
        subject = `Order Confirmation #${orderId.slice(0, 8)} - Onolo Group`;
        htmlContent = generateConfirmationEmail(order, customerName);
        break;
      case 'status_update':
        subject = `Order Update #${orderId.slice(0, 8)} - ${order.status.replace('_', ' ').toUpperCase()}`;
        htmlContent = generateStatusUpdateEmail(order, customerName);
        break;
      case 'invoice':
        subject = `Invoice #${orderId.slice(0, 8)} - Onolo Group`;
        htmlContent = generateInvoiceEmail(order, customerName);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Onolo Group <orders@onologroup.com>",
      to: [customerEmail],
      subject,
      html: htmlContent,
    });

    logStep("Email sent successfully", { emailId: emailResponse.data?.id });

    // Update order with email sent status
    const updateData: any = {};
    if (type === 'confirmation') {
      updateData.payment_confirmation_sent = true;
    } else if (type === 'invoice') {
      updateData.receipt_sent = true;
    }

    if (Object.keys(updateData).length > 0) {
      await supabaseClient
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-order-email", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function generateConfirmationEmail(order: any, customerName: string): string {
  const orderItems = order.order_items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R ${item.unit_price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R ${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b35;">Onolo Group</h1>
          <h2 style="color: #333;">Order Confirmation</h2>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>Thank you for your order! We're excited to confirm that your order has been received and is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method.replace('_', ' ').toUpperCase()}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Unit Price</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <p style="font-size: 18px;"><strong>Total Amount: R ${order.total_amount.toFixed(2)}</strong></p>
          </div>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d5a2d;">Delivery Information</h3>
          <p><strong>Address:</strong> ${order.delivery_address}</p>
          <p><strong>Phone:</strong> ${order.delivery_phone}</p>
          ${order.delivery_date ? `<p><strong>Delivery Date:</strong> ${new Date(order.delivery_date).toLocaleDateString()}</p>` : ''}
          ${order.preferred_delivery_window ? `<p><strong>Time Window:</strong> ${order.preferred_delivery_window}</p>` : ''}
        </div>

        <div style="margin: 30px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>We'll send you updates as your order progresses</li>
            <li>Your order will be prepared and scheduled for delivery</li>
            <li>You'll receive tracking information once your order is dispatched</li>
          </ul>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p>Questions? Contact us at <a href="mailto:info@onologroup.com">info@onologroup.com</a></p>
          <p style="color: #666; font-size: 14px;">Onolo Group (Pty) Ltd</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStatusUpdateEmail(order: any, customerName: string): string {
  const statusMessages = {
    'order_received': 'Your order has been received and is being processed.',
    'order_confirmed': 'Your order has been confirmed and is being prepared.',
    'scheduled_for_delivery': 'Your order has been scheduled for delivery.',
    'driver_dispatched': 'A driver has been dispatched with your order.',
    'out_for_delivery': 'Your order is out for delivery.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.'
  };

  const statusMessage = statusMessages[order.status as keyof typeof statusMessages] || 'Your order status has been updated.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b35;">Onolo Group</h1>
          <h2 style="color: #333;">Order Status Update</h2>
        </div>
        
        <p>Dear ${customerName},</p>
        
        <p>${statusMessage}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Information</h3>
          <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
          <p><strong>Current Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p>Questions? Contact us at <a href="mailto:info@onologroup.com">info@onologroup.com</a></p>
          <p style="color: #666; font-size: 14px;">Onolo Group (Pty) Ltd</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceEmail(order: any, customerName: string): string {
  const orderItems = order.order_items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R ${item.unit_price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R ${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b35;">Onolo Group</h1>
          <h2 style="color: #333;">Invoice</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3>From:</h3>
            <p>Onolo Group (Pty) Ltd<br>
            Johannesburg, South Africa<br>
            info@onologroup.com</p>
          </div>
          <div>
            <h3>To:</h3>
            <p>${customerName}<br>
            ${order.delivery_address}</p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invoice Details</h3>
          <p><strong>Invoice Number:</strong> INV-${order.id.slice(0, 8)}</p>
          <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
          <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Delivery Date:</strong> ${new Date(order.updated_at).toLocaleDateString()}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Items</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: left;">Item</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Unit Price</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            ${order.delivery_cost > 0 ? `<p>Delivery: R ${order.delivery_cost.toFixed(2)}</p>` : ''}
            <p style="font-size: 18px;"><strong>Total Amount: R ${order.total_amount.toFixed(2)}</strong></p>
            <p><strong>Payment Method:</strong> ${order.payment_method.replace('_', ' ').toUpperCase()}</p>
            <p style="color: #28a745;"><strong>Status: PAID</strong></p>
          </div>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p>Thank you for your business!</p>
          <p>Questions? Contact us at <a href="mailto:info@onologroup.com">info@onologroup.com</a></p>
          <p style="color: #666; font-size: 14px;">Onolo Group (Pty) Ltd</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
