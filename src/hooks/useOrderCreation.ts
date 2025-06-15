
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useOrderEmail } from '@/hooks/useOrderEmail';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import { useOrderCreationCore } from '@/hooks/useOrderCreationCore';

export const useOrderCreation = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const { sendOrderConfirmationEmail } = useOrderEmail();
  const { updateOrderStatus } = useOrderStatus();
  const { createOrder } = useOrderCreationCore();

  return {
    createOrder,
    sendOrderConfirmationEmail,
    updateOrderStatus,
    clearCart,
    navigate,
    toast
  };
};
