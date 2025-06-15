
export const formatCurrency = (amount: number) => `R ${amount.toFixed(2)}`;

export const generateOrderItemsHtml = (orderItems: any[]) => {
  return orderItems?.map(item => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 8px; text-align: left;">${item.product_name}</td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(item.unit_price)}</td>
      <td style="padding: 8px; text-align: right; font-weight: bold;">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('') || '';
};

export const generateCustomerEmailHtml = (order: any, shortOrderId: string, orderDate: string, orderItemsHtml: string) => {
  return `
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
};

export const generateCompanyEmailHtml = (order: any, shortOrderId: string, orderDate: string, orderItemsHtml: string) => {
  return `
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
};
