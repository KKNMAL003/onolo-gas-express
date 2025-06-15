
-- Create order status history table for tracking status changes
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  estimated_time_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for order status history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order status history
CREATE POLICY "Users can view their own order status history" 
  ON public.order_status_history 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  ));

-- Function to automatically track status changes
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by,
      estimated_time_range
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.updated_by, 'system'),
      CASE NEW.status
        WHEN 'order_received' THEN 'Processing within 2-4 hours'
        WHEN 'order_confirmed' THEN 'Scheduling within 4-8 hours'
        WHEN 'scheduled_for_delivery' THEN 'Usually within 24-48 hours'
        WHEN 'driver_dispatched' THEN 'Driver en route, 2-6 hours'
        WHEN 'out_for_delivery' THEN 'Delivery within 1-3 hours'
        WHEN 'delivered' THEN 'Completed'
        ELSE 'Time estimate varies'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status tracking
DROP TRIGGER IF EXISTS trigger_track_order_status_change ON public.orders;
CREATE TRIGGER trigger_track_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.track_order_status_change();
