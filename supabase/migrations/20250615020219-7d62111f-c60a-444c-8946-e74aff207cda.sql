
-- First, let's add the new columns one by one to avoid deadlocks
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_end TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS driver_id TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_notes TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_zone TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'standard';

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_confirmation_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS receipt_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- Update the status constraint to include new statuses
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'pending', 
  'order_received', 
  'order_confirmed', 
  'scheduled_for_delivery', 
  'driver_dispatched', 
  'out_for_delivery', 
  'delivered', 
  'cancelled'
));

-- Add priority level constraint
ALTER TABLE public.orders 
ADD CONSTRAINT orders_priority_level_check 
CHECK (priority_level IN ('urgent', 'standard', 'low'));
