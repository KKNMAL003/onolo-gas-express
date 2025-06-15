
import { generateCustomerEmailHtml, generateCompanyEmailHtml, generateOrderItemsHtml, formatCurrency } from './email-templates.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-SENDER] ${step}${detailsStr}`);
};

export const sendCustomerEmail = async (order: any, resendApiKey: string) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA');
  const shortOrderId = order.id.slice(0, 8).toUpperCase();
  const orderItemsHtml = generateOrderItemsHtml(order.order_items);
  const customerEmailHtml = generateCustomerEmailHtml(order, shortOrderId, orderDate, orderItemsHtml);

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
      return { type: 'customer', success: true, emailId: customerResult.id };
    } else {
      const errorText = await customerEmailResponse.text();
      logStep("Customer email failed", { error: errorText });
      return { type: 'customer', success: false, error: errorText };
    }
  } catch (error) {
    logStep("Customer email error", { error: error.message });
    return { type: 'customer', success: false, error: error.message };
  }
};

export const sendCompanyEmail = async (order: any, resendApiKey: string) => {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA');
  const shortOrderId = order.id.slice(0, 8).toUpperCase();
  const orderItemsHtml = generateOrderItemsHtml(order.order_items);
  const companyEmailHtml = generateCompanyEmailHtml(order, shortOrderId, orderDate, orderItemsHtml);

  try {
    logStep("Sending company email", { to: 'info19music@gmail.com' });
    
    const companyEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Onolo Group Orders <info19music@gmail.com>',
        to: ['info19music@gmail.com'],
        subject: `New Order #${shortOrderId} from ${order.customer_name}`,
        html: companyEmailHtml,
      }),
    });

    if (companyEmailResponse.ok) {
      const companyResult = await companyEmailResponse.json();
      logStep("Company email sent successfully", { emailId: companyResult.id });
      return { type: 'company', success: true, emailId: companyResult.id };
    } else {
      const errorText = await companyEmailResponse.text();
      logStep("Company email failed", { error: errorText });
      return { type: 'company', success: false, error: errorText };
    }
  } catch (error) {
    logStep("Company email error", { error: error.message });
    return { type: 'company', success: false, error: error.message };
  }
};
