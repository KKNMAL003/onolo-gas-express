
-- Add password reset functionality tables
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for password reset tokens
CREATE POLICY "Users can access their own reset tokens" 
  ON public.password_reset_tokens 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add delivery preferences and location fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS preferred_delivery_window TEXT CHECK (preferred_delivery_window IN ('morning', 'afternoon', 'evening')),
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_area_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_status_enabled BOOLEAN DEFAULT TRUE;

-- Add delivery preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_delivery_window TEXT CHECK (default_delivery_window IN ('morning', 'afternoon', 'evening')),
ADD COLUMN IF NOT EXISTS default_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS default_longitude DECIMAL(11, 8);

-- Create service areas table
CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  polygon_coordinates JSONB NOT NULL, -- Array of lat/lng coordinates defining the service area
  delivery_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for service areas (public read access)
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

-- Create policy for service areas (readable by all authenticated users)
CREATE POLICY "Service areas are publicly readable" 
  ON public.service_areas 
  FOR SELECT 
  USING (active = TRUE);

-- Create delivery time slots table
CREATE TABLE IF NOT EXISTS public.delivery_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time_window TEXT NOT NULL CHECK (time_window IN ('morning', 'afternoon', 'evening')),
  max_orders INTEGER NOT NULL DEFAULT 10,
  current_orders INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, time_window)
);

-- Enable RLS for delivery time slots
ALTER TABLE public.delivery_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policy for delivery time slots (readable by authenticated users)
CREATE POLICY "Delivery time slots are readable by authenticated users" 
  ON public.delivery_time_slots 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND active = TRUE);

-- Function to automatically progress order status
CREATE OR REPLACE FUNCTION public.auto_progress_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-progress if auto_status_enabled is true
  IF NEW.auto_status_enabled = TRUE THEN
    -- Auto-progress from pending to order_received after 5 minutes
    IF OLD.status = 'pending' AND NEW.status = 'pending' AND 
       NEW.created_at <= NOW() - INTERVAL '5 minutes' THEN
      NEW.status = 'order_received';
      NEW.updated_at = NOW();
    -- Auto-progress from order_received to order_confirmed after 2 hours
    ELSIF OLD.status = 'order_received' AND NEW.status = 'order_received' AND 
          NEW.updated_at <= NOW() - INTERVAL '2 hours' THEN
      NEW.status = 'order_confirmed';
      NEW.updated_at = NOW();
    -- Auto-progress from order_confirmed to scheduled_for_delivery after 4 hours
    ELSIF OLD.status = 'order_confirmed' AND NEW.status = 'order_confirmed' AND 
          NEW.updated_at <= NOW() - INTERVAL '4 hours' THEN
      NEW.status = 'scheduled_for_delivery';
      NEW.updated_at = NOW();
    -- Auto-progress from scheduled_for_delivery to driver_dispatched on delivery date
    ELSIF OLD.status = 'scheduled_for_delivery' AND NEW.status = 'scheduled_for_delivery' AND 
          NEW.delivery_date = CURRENT_DATE THEN
      NEW.status = 'driver_dispatched';
      NEW.updated_at = NOW();
    -- Auto-progress from driver_dispatched to out_for_delivery after 1 hour
    ELSIF OLD.status = 'driver_dispatched' AND NEW.status = 'driver_dispatched' AND 
          NEW.updated_at <= NOW() - INTERVAL '1 hour' THEN
      NEW.status = 'out_for_delivery';
      NEW.updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status progression
DROP TRIGGER IF EXISTS trigger_auto_progress_order_status ON public.orders;
CREATE TRIGGER trigger_auto_progress_order_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_progress_order_status();

-- Function to calculate delivery cost based on distance
CREATE OR REPLACE FUNCTION public.calculate_delivery_cost(
  delivery_lat DECIMAL,
  delivery_lng DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  base_cost DECIMAL := 0;
  distance_cost DECIMAL := 0;
  service_area_cost DECIMAL := 0;
BEGIN
  -- Check if location is in a service area
  SELECT delivery_cost INTO service_area_cost
  FROM public.service_areas
  WHERE active = TRUE
  AND ST_Contains(
    ST_GeomFromGeoJSON(polygon_coordinates::text),
    ST_Point(delivery_lng, delivery_lat)
  )
  LIMIT 1;
  
  -- If in service area, use that cost, otherwise calculate distance-based cost
  IF service_area_cost IS NOT NULL THEN
    RETURN service_area_cost;
  ELSE
    -- Simple distance-based calculation (can be enhanced)
    -- Base cost of R50 + R2 per km from city center (example coordinates)
    base_cost := 50;
    distance_cost := ST_Distance(
      ST_Point(-26.2041, 28.0473), -- Johannesburg coordinates
      ST_Point(delivery_lat, delivery_lng)
    ) * 111.32 * 2; -- Convert to km and multiply by rate
    
    RETURN base_cost + distance_cost;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to validate service area
CREATE OR REPLACE FUNCTION public.validate_service_area(
  delivery_lat DECIMAL,
  delivery_lng DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  area_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO area_count
  FROM public.service_areas
  WHERE active = TRUE
  AND ST_Contains(
    ST_GeomFromGeoJSON(polygon_coordinates::text),
    ST_Point(delivery_lng, delivery_lat)
  );
  
  RETURN area_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Insert default service areas (example for Johannesburg area)
INSERT INTO public.service_areas (name, polygon_coordinates, delivery_cost) VALUES
('Central Johannesburg', '[
  [-26.1500, 28.0000],
  [-26.1500, 28.1000],
  [-26.2500, 28.1000],
  [-26.2500, 28.0000],
  [-26.1500, 28.0000]
]'::jsonb, 25.00),
('Sandton Area', '[
  [-26.0500, 28.0500],
  [-26.0500, 28.1500],
  [-26.1500, 28.1500],
  [-26.1500, 28.0500],
  [-26.0500, 28.0500]
]'::jsonb, 35.00);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status_auto ON public.orders(status, auto_status_enabled);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_delivery_time_slots_date_window ON public.delivery_time_slots(date, time_window);
