
-- Check what status values currently exist in the database
SELECT DISTINCT status, COUNT(*) 
FROM public.orders 
GROUP BY status;

-- Drop ALL status-related constraints to start fresh
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Clean up any problematic status values by normalizing them to lowercase and trimming whitespace
UPDATE public.orders 
SET status = TRIM(LOWER(status))
WHERE status IS NOT NULL;

-- Update any remaining problematic status values to 'pending'
UPDATE public.orders 
SET status = 'pending' 
WHERE status NOT IN (
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
) OR status IS NULL;

-- Now add the correct constraints
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
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
));

-- Re-add the payment method constraint to be safe
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('eft', 'card', 'payfast', 'paypal', 'cash_on_delivery'));

-- Set the default status to 'pending'
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';
