
import { supabase } from '@/integrations/supabase/client';

export const sendStatusUpdateEmail = async (orderId: string, customerEmail: string, customerName: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderId,
        type: 'status_update',
        customerEmail,
        customerName
      }
    });

    if (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error };
    }

    console.log('Status update email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error };
  }
};

export const sendInvoiceEmail = async (orderId: string, customerEmail: string, customerName: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        orderId,
        type: 'invoice',
        customerEmail,
        customerName
      }
    });

    if (error) {
      console.error('Error sending invoice email:', error);
      return { success: false, error };
    }

    console.log('Invoice email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return { success: false, error };
  }
};
