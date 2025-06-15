
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliverySlot {
  id: string;
  date: string;
  time_window: 'morning' | 'afternoon' | 'evening';
  max_orders: number;
  current_orders: number;
  available: boolean;
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
      const { error } = await supabase
        .from('delivery_time_slots')
        .update({ current_orders: supabase.raw('current_orders + 1') })
        .eq('id', slotId)
        .lt('current_orders', supabase.raw('max_orders'));

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
