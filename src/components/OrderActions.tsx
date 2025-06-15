
import React from 'react';
import { Button } from '@/components/ui/button';
import DeliveryReschedule from '@/components/DeliveryReschedule';

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
  delivery_date: string | null;
  preferred_delivery_window: string | null;
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface OrderActionsProps {
  order: Order;
  onCancelOrder: (orderId: string) => void;
  onRescheduleSuccess: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, onCancelOrder, onRescheduleSuccess }) => {
  const canCancelOrder = order.status === 'pending' || order.status === 'order_received';
  const canReschedule = order.status === 'order_confirmed' || order.status === 'scheduled_for_delivery';

  return (
    <div className="space-y-2 mt-4">
      {canReschedule && (
        <DeliveryReschedule
          orderId={order.id}
          currentDate={order.delivery_date}
          currentTimeWindow={order.preferred_delivery_window}
          onRescheduleSuccess={onRescheduleSuccess}
        />
      )}
      
      {canCancelOrder && (
        <Button
          onClick={() => onCancelOrder(order.id)}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          Cancel Order
        </Button>
      )}
    </div>
  );
};

export default OrderActions;
