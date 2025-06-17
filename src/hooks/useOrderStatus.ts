
import { supabase } from '@/integrations/supabase/client';

export const useOrderStatus = () => {
  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      // Ensure status values match the database constraint
      const validStatuses = [
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
      ];

      if (!validStatuses.includes(status)) {
        console.error('Invalid status value:', status);
        throw new Error(`Invalid status: ${status}`);
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_by: 'system',
          updated_at: new Date().toISOString(),
          ...(reason && { tracking_notes: reason })
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      console.log(`Order ${orderId} status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  return {
    updateOrderStatus
  };
};
