
import { supabase } from '@/integrations/supabase/client';

export const useOrderStatus = () => {
  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    try {
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
