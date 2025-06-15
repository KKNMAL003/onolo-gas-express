
import React from 'react';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  payment_method: string;
  created_at: string;
  priority_level: string | null;
  estimated_delivery_start: string | null;
  estimated_delivery_end: string | null;
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface OrderActionsProps {
  order: Order;
  onCancelOrder: (orderId: string) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, onCancelOrder }) => {
  const canCancelOrder = order.status === 'pending' || order.status === 'order_received';

  if (!canCancelOrder) {
    return null;
  }

  return (
    <Button
      onClick={() => onCancelOrder(order.id)}
      variant="destructive"
      size="sm"
      className="w-full mt-4"
    >
      Cancel Order
    </Button>
  );
};

export default OrderActions;
