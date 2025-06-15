import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PayFastPayment from '@/components/PayFastPayment';
import PayPalPayment from '@/components/PayPalPayment';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayFast, setShowPayFast] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'eft'
  });

  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    deliveryCost: number;
  } | null>(null);

  const [deliverySlot, setDeliverySlot] = useState<{
    date: string;
    timeWindow: string;
    slotId: string;
  } | null>(null);

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

  const handleLocationSelect = (location: typeof locationData) => {
    setLocationData(location);
    setFormData(prev => ({ ...prev, address: location.address }));
  };

  const handleSlotSelect = (slot: typeof deliverySlot) => {
    setDeliverySlot(slot);
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
        // Don't throw here - we don't want to fail the order if email fails
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
      // Don't throw here - we don't want to fail the order if email fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place an order.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      navigate('/order');
      return;
    }

    if (!locationData) {
      toast({
        title: "Location required",
        description: "Please select your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!deliverySlot) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

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

      // Handle payment method
      if (formData.paymentMethod === 'payfast') {
        setOrderData({
          orderId: order.id,
          amount: finalTotal,
          customerName: formData.name,
          customerEmail: formData.email,
          deliveryAddress: locationData.address
        });
        setShowPayFast(true);
        return;
      }

      if (formData.paymentMethod === 'paypal') {
        setOrderData({
          orderId: order.id,
          amount: finalTotal,
          customerName: formData.name,
          customerEmail: formData.email,
          deliveryAddress: locationData.address
        });
        setShowPayPal(true);
        return;
      }

      clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id.slice(0, 8)} has been submitted. You'll receive an email confirmation shortly.`,
      });

      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error placing order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentInitiated = async () => {
    // Send email for payment-based orders too
    if (orderData?.orderId) {
      await sendOrderConfirmationEmail(orderData.orderId);
    }
    
    clearCart();
    toast({
      title: "Payment initiated",
      description: "Complete your payment to confirm the order. You'll receive email confirmation once payment is successful.",
    });
    navigate('/orders');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (showPayFast && orderData) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Complete Payment</h1>
          <PayFastPayment
            orderId={orderData.orderId}
            amount={orderData.amount}
            customerName={orderData.customerName}
            customerEmail={orderData.customerEmail}
            deliveryAddress={orderData.deliveryAddress}
            onPaymentInitiated={handlePaymentInitiated}
          />
        </div>
      </div>
    );
  }

  if (showPayPal && orderData) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Complete Payment</h1>
          <PayPalPayment
            orderId={orderData.orderId}
            amount={orderData.amount}
            customerName={orderData.customerName}
            customerEmail={orderData.customerEmail}
            deliveryAddress={orderData.deliveryAddress}
            onPaymentInitiated={handlePaymentInitiated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <CheckoutForm
          formData={formData}
          locationData={locationData}
          deliverySlot={deliverySlot}
          cartItems={cartItems}
          total={total}
          deliveryCost={deliveryCost}
          finalTotal={finalTotal}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onLocationSelect={handleLocationSelect}
          onSlotSelect={handleSlotSelect}
        />
      </div>
    </div>
  );
};

export default Checkout;
