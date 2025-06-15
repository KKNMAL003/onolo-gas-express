
-- Create a function to send order confirmation emails using Supabase's email system
CREATE OR REPLACE FUNCTION public.send_order_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  order_items_text TEXT := '';
  item_record RECORD;
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Build order items list
  FOR item_record IN 
    SELECT product_name, quantity, unit_price, total_price 
    FROM order_items 
    WHERE order_id = NEW.id
  LOOP
    order_items_text := order_items_text || 
      '• ' || item_record.product_name || 
      ' (Qty: ' || item_record.quantity || ') - R' || 
      item_record.total_price::text || E'\n';
  END LOOP;

  -- Prepare email subject
  email_subject := 'Order Confirmation #' || substring(NEW.id::text from 1 for 8) || ' - Onolo Group';

  -- Prepare email body
  email_body := 'Dear ' || NEW.customer_name || E',\n\n' ||
    'Thank you for your order! Here are the details:\n\n' ||
    'Order ID: #' || substring(NEW.id::text from 1 for 8) || E'\n' ||
    'Order Date: ' || NEW.created_at::date || E'\n' ||
    'Total Amount: R' || NEW.total_amount::text || E'\n' ||
    'Payment Method: ' || NEW.payment_method || E'\n' ||
    'Delivery Address: ' || NEW.delivery_address || E'\n' ||
    'Phone: ' || NEW.delivery_phone || E'\n\n' ||
    'Items Ordered:\n' || order_items_text || E'\n' ||
    'We will process your order and send you updates.\n\n' ||
    'Thank you for choosing Onolo Group!\n\n' ||
    'Best regards,\nOnolo Group Team\n' ||
    'Contact: info@onologroup.com | WhatsApp: 071 770 3063';

  -- Send email using Supabase's net.http_post for email sending
  PERFORM net.http_post(
    url := 'https://api.supabase.co/platform/database/' || current_setting('app.settings.project_ref') || '/auth/v1/admin/generate_link',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'email_change_current',
      'email', NEW.customer_email,
      'options', jsonb_build_object(
        'data', jsonb_build_object(
          'subject', email_subject,
          'body', email_body
        )
      )
    )
  );

  -- Also send notification to company
  PERFORM net.http_post(
    url := 'https://api.supabase.co/platform/database/' || current_setting('app.settings.project_ref') || '/auth/v1/admin/generate_link',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'email_change_current',
      'email', 'info19music@gmail.com',
      'options', jsonb_build_object(
        'data', jsonb_build_object(
          'subject', 'New Order #' || substring(NEW.id::text from 1 for 8) || ' from ' || NEW.customer_name,
          'body', 'New order received:\n\n' ||
            'Customer: ' || NEW.customer_name || E'\n' ||
            'Email: ' || NEW.customer_email || E'\n' ||
            'Phone: ' || NEW.delivery_phone || E'\n' ||
            'Address: ' || NEW.delivery_address || E'\n' ||
            'Total: R' || NEW.total_amount::text || E'\n' ||
            'Payment: ' || NEW.payment_method || E'\n\n' ||
            'Items:\n' || order_items_text
        )
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically send emails when orders are created
CREATE OR REPLACE TRIGGER trigger_send_order_confirmation
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_confirmation_email();

-- Enable the pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;
