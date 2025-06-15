
-- First, let's see what status values are currently in the database
SELECT DISTINCT status FROM public.orders;

-- Also check if there are any orders with problematic status values
SELECT id, status, created_at FROM public.orders WHERE status NOT IN (
  'pending',
  'order_received', 
  'order_confirmed',
  'preparing',
  'scheduled_for_delivery',
  'driver_dispatched', 
  'out_for_delivery',
  'delivered',
  'cancelled',
  'confirmed',
  'payment_failed'
);
