
import React, { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PaymentFlowHandler from '@/components/checkout/PaymentFlowHandler';

interface OrderData {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
}

const CheckoutSubmissionHandler: React.FC = () => {
  const {
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
  } = useCheckout();

  const [showPayPal, setShowPayPal] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const order = await createOrder();
      if (!order) {
        setIsLoading(false);
        return;
      }

      // Handle payment method
      if (formData.paymentMethod === 'paypal') {
        setOrderData({
          orderId: order.id,
          amount: finalTotal,
          customerName: formData.name,
          customerEmail: formData.email,
          deliveryAddress: locationData!.address
        });
        setShowPayPal(true);
        setIsLoading(false);
        return;
      }

      // For cash on delivery and EFT, clear cart and redirect
      clearCart();
      
      if (formData.paymentMethod === 'eft') {
        // Redirect to payment success page with EFT instructions
        navigate(`/payment-success?order_id=${order.id}&payment_source=eft`);
      } else {
        // Cash on delivery
        toast({
          title: "Order placed successfully!",
          description: `Order #${order.id.slice(0, 8)} has been submitted. You'll receive an email confirmation shortly.`,
        });
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error in checkout submission:', error);
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

  // Show payment flow if needed
  if (showPayPal) {
    return (
      <PaymentFlowHandler
        showPayFast={false}
        showPayPal={showPayPal}
        orderData={orderData}
        onPaymentInitiated={handlePaymentInitiated}
      />
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

export default CheckoutSubmissionHandler;
