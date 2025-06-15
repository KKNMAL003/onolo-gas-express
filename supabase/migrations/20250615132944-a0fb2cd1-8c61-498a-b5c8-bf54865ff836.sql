
-- First, let's check what payment methods are currently allowed and add 'paypal'
-- We need to update the check constraint on the orders table to include 'paypal'

-- Drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add a new constraint that includes 'paypal'
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('eft', 'card', 'payfast', 'paypal', 'cash_on_delivery'));
