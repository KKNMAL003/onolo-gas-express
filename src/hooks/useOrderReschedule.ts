
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderReschedule = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const rescheduleOrder = useCallback(async (
    orderId: string, 
    newDate: string, 
    newTimeWindow: string,
    slotId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Update the order with new delivery preferences
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          delivery_date: newDate,
          preferred_delivery_window: newTimeWindow,
          status: 'order_confirmed', // Reset status to confirmed when rescheduled
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Reserve the new slot if slotId is provided
      if (slotId) {
        const { data: currentSlot, error: fetchError } = await supabase
          .from('delivery_time_slots')
          .select('current_orders, max_orders')
          .eq('id', slotId)
          .single();

        if (fetchError) throw fetchError;

        if (currentSlot.current_orders >= currentSlot.max_orders) {
          toast({
            title: "Slot unavailable",
            description: "This delivery slot is now full. Please choose another.",
            variant: "destructive",
          });
          return false;
        }

        const { error: slotError } = await supabase
          .from('delivery_time_slots')
          .update({ current_orders: currentSlot.current_orders + 1 })
          .eq('id', slotId);

        if (slotError) throw slotError;
      }

      toast({
        title: "Delivery rescheduled",
        description: "Your delivery has been successfully rescheduled.",
      });

      return true;
    } catch (error) {
      console.error('Error rescheduling order:', error);
      toast({
        title: "Error rescheduling delivery",
        description: "Failed to reschedule your delivery. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    rescheduleOrder,
    isLoading
  };
};
