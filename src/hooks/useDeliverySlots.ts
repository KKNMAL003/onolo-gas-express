
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliverySlot {
  id: string;
  date: string;
  time_window: string; // Changed from union type to string to match database
  max_orders: number;
  current_orders: number;
  available: boolean;
  active: boolean | null;
  created_at: string;
}

export const useDeliverySlots = () => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAvailableSlots = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_time_slots')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .eq('active', true)
        .order('date')
        .order('time_window');

      if (error) throw error;

      const slotsWithAvailability = (data || []).map(slot => ({
        ...slot,
        available: slot.current_orders < slot.max_orders
      }));

      setSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      toast({
        title: "Error loading delivery slots",
        description: "Failed to load available delivery times.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reserveSlot = useCallback(async (slotId: string): Promise<boolean> => {
    try {
      // First get the current slot data
      const { data: currentSlot, error: fetchError } = await supabase
        .from('delivery_time_slots')
        .select('current_orders, max_orders')
        .eq('id', slotId)
        .single();

      if (fetchError) throw fetchError;

      // Check if slot is still available
      if (currentSlot.current_orders >= currentSlot.max_orders) {
        return false;
      }

      // Update the slot by incrementing current_orders
      const { error } = await supabase
        .from('delivery_time_slots')
        .update({ current_orders: currentSlot.current_orders + 1 })
        .eq('id', slotId)
        .lt('current_orders', currentSlot.max_orders);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reserving slot:', error);
      return false;
    }
  }, []);

  const getTimeWindowLabel = (window: string) => {
    switch (window) {
      case 'morning': return 'Morning (8AM - 12PM)';
      case 'afternoon': return 'Afternoon (12PM - 5PM)';
      case 'evening': return 'Evening (5PM - 8PM)';
      default: return window;
    }
  };

  return {
    slots,
    isLoading,
    fetchAvailableSlots,
    reserveSlot,
    getTimeWindowLabel
  };
};
