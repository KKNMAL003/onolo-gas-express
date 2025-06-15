
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  deliveryCost: number;
}

interface DeliverySlot {
  date: string;
  timeWindow: string;
  slotId: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
}

export const useCheckout = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'eft'
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot | null>(null);

  useEffect(() => {
    console.log('Checkout: user and profile data:', { user: user?.email, profile });
    
    if (user) {
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      setFormData(prev => ({
        ...prev,
        name: fullName || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
      }));
    }
  }, [user, profile]);

  const total = getTotalPrice();
  const deliveryCost = locationData?.deliveryCost || 0;
  const finalTotal = total + deliveryCost;

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setFormData(prev => ({ ...prev, address: location.address }));
  };

  const handleSlotSelect = (slot: DeliverySlot) => {
    setDeliverySlot(slot);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendOrderConfirmationEmail = async (orderId: string) => {
    try {
      console.log('Sending order confirmation email for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          type: 'confirmation',
          customerEmail: formData.email,
          customerName: formData.name
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

  const createOrder = async () => {
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
      
      // Set initial status based on payment method
      let initialStatus = 'order_received'; // Default status that should be valid
      if (formData.paymentMethod === 'payfast' || formData.paymentMethod === 'paypal') {
        initialStatus = 'order_received'; // Will be updated by webhook on payment completion
      }
      
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
          status: initialStatus,
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
    formData,
    locationData,
    deliverySlot,
    isLoading,
    setIsLoading,
    total,
    deliveryCost,
    finalTotal,
    cartItems,
    handleLocationSelect,
    handleSlotSelect,
    handleChange,
    createOrder,
    sendOrderConfirmationEmail,
    clearCart,
    navigate,
    toast
  };
};
