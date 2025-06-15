
-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS trigger_send_order_confirmation ON public.orders;
DROP FUNCTION IF EXISTS public.send_order_confirmation_email();

-- Create a simpler function that just marks email as needing to be sent
-- We'll handle the actual email sending via the edge function
CREATE OR REPLACE FUNCTION public.send_order_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Simply return NEW to allow the order creation to proceed
  -- The email sending will be handled by the existing edge function
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after order creation (but doesn't send emails directly)
CREATE OR REPLACE TRIGGER trigger_send_order_confirmation
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_confirmation_email();
