
-- Enable RLS on communication_logs table
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own communications
CREATE POLICY "Users can view their own communications" 
  ON public.communication_logs 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy for users to insert their own messages
CREATE POLICY "Users can insert their own messages" 
  ON public.communication_logs 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Add real-time capabilities to communication_logs
ALTER TABLE public.communication_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.communication_logs;

-- Create function to automatically log order status changes to communication_logs
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log order status changes
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON public.orders;
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();
