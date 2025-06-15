
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderEmail = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendOrderConfirmationEmail = async (orderId: string) => {
    try {
      console.log('Sending order confirmation email for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          type: 'confirmation',
          customerEmail: user?.email,
          customerName: user?.email?.split('@')[0] || 'Customer'
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast({
          title: "Order placed successfully!",
          description: "Your order was created but there was an issue sending the confirmation email. You can view your order in the Orders section.",
          variant: "default",
        });
      } else {
        console.log('Confirmation email sent successfully:', data);
        toast({
          title: "Order placed successfully!",
          description: "Your order was created and confirmation email has been sent.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      toast({
        title: "Order placed successfully!",
        description: "Your order was created but there was an issue sending the confirmation email. You can view your order in the Orders section.",
        variant: "default",
      });
    }
  };

  return {
    sendOrderConfirmationEmail
  };
};
