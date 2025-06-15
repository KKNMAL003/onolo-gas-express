
-- Drop the existing insert policy which is too restrictive for system messages
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.communication_logs;

-- Create a new policy that only applies to messages sent by users
CREATE POLICY "Users can insert their own messages" 
  ON public.communication_logs 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND log_type = 'user_message');

-- Update the function for order status logging to run with higher privileges.
-- This allows it to create log entries without being blocked by user-level security.
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.communication_logs (
      user_id,
      log_type,
      subject,
      message
    ) VALUES (
      NEW.user_id,
      'order_status_update',
      'Order Status Update',
      'Your order #' || LEFT(NEW.id::text, 8) || ' status has been updated to: ' || 
      REPLACE(INITCAP(REPLACE(NEW.status, '_', ' ')), 'Of', 'of')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
