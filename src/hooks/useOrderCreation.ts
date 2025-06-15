
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FormData, LocationData, DeliverySlot } from '@/types/checkout';

export const useOrderCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
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
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  const createOrder = async (
    formData: FormData,
    locationData: LocationData,
    deliverySlot: DeliverySlot,
    finalTotal: number,
    deliveryCost: number
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place an order.",
        variant: "destructive",
      });
      navigate('/auth');
      return null;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      navigate('/order');
      return null;
    }

    if (!locationData) {
      toast({
        title: "Location required",
        description: "Please select your delivery address.",
        variant: "destructive",
      });
      return null;
    }

    if (!deliverySlot) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery time slot.",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Creating order with payment method:', formData.paymentMethod);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          delivery_address: locationData.address,
          delivery_phone: formData.phone,
          payment_method: formData.paymentMethod,
          customer_name: formData.name,
          customer_email: formData.email,
          status: 'pending',
          preferred_delivery_window: deliverySlot.timeWindow,
          delivery_date: deliverySlot.date,
          delivery_latitude: locationData.latitude,
          delivery_longitude: locationData.longitude,
          delivery_cost: deliveryCost,
          service_area_validated: true,
          auto_status_enabled: true
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order.id);

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // Send confirmation email
      await sendOrderConfirmationEmail(order.id);

      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error placing order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    createOrder,
    sendOrderConfirmationEmail,
    clearCart,
    navigate,
    toast
  };
};
