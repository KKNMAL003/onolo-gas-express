
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useOrderCreation } from '@/hooks/useOrderCreation';

export const useCheckout = () => {
  const { getTotalPrice, cartItems } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const {
    formData,
    locationData,
    deliverySlot,
    handleLocationSelect,
    handleSlotSelect,
    handleChange
  } = useCheckoutForm();

  const {
    createOrder: createOrderBase,
    sendOrderConfirmationEmail,
    clearCart,
    navigate,
    toast
  } = useOrderCreation();

  const total = getTotalPrice();
  const deliveryCost = locationData?.deliveryCost || 0;
  const finalTotal = total + deliveryCost;

  const createOrder = async () => {
    if (!locationData || !deliverySlot) return null;
    
    return await createOrderBase(
      formData,
      locationData,
      deliverySlot,
      finalTotal,
      deliveryCost
    );
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
