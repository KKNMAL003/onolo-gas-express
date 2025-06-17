
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrderEmail } from '@/hooks/useOrderEmail';
import type { FormData, LocationData, DeliverySlot } from '@/types/checkout';

export const useOrderCreationCore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { toast } = useToast();
  const { sendOrderConfirmationEmail } = useOrderEmail();

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
      console.log('Form data:', formData);
      console.log('Location data:', locationData);
      console.log('Delivery slot:', deliverySlot);
      
      // Use lowercase 'pending' status - now matches database constraint
      const initialStatus = 'pending';
      
      // Validate required fields
      if (!formData.name?.trim()) {
        throw new Error('Customer name is required');
      }
      if (!formData.email?.trim()) {
        throw new Error('Customer email is required');
      }
      if (!formData.phone?.trim()) {
        throw new Error('Phone number is required');
      }
      
      const orderData = {
        user_id: user.id,
        total_amount: finalTotal,
        delivery_address: locationData.address,
        delivery_phone: formData.phone.trim(),
        payment_method: formData.paymentMethod,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        status: initialStatus, // This now matches the database constraint
        preferred_delivery_window: deliverySlot.timeWindow,
        delivery_date: deliverySlot.date,
        delivery_latitude: locationData.latitude,
        delivery_longitude: locationData.longitude,
        delivery_cost: deliveryCost,
        service_area_validated: true,
        auto_status_enabled: true
      };

      console.log('Order data to insert:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
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

      console.log('Order items to insert:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // Try to clean up the order if items failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Order items created successfully');

      // Send confirmation email for cash orders only after successful creation
      if (formData.paymentMethod === 'cash_on_delivery') {
        await sendOrderConfirmationEmail(order.id);
      }

      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error placing order",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    createOrder
  };
};
