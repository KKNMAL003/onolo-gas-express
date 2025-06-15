import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import OrderDetails from '@/components/OrderDetails';
import OrderActions from '@/components/OrderActions';

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

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpansion: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onRescheduleSuccess: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isExpanded,
  onToggleExpansion,
  onCancelOrder,
  onRescheduleSuccess
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'order_received': return 'bg-blue-500';
      case 'order_confirmed': return 'bg-blue-600';
      case 'scheduled_for_delivery': return 'bg-purple-500';
      case 'driver_dispatched': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-orange-600';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusEstimate = (status: string) => {
    switch (status) {
      case 'order_received': return 'Processing within 2-4 hours';
      case 'order_confirmed': return 'Scheduling within 4-8 hours';
      case 'scheduled_for_delivery': return 'Usually within 24-48 hours';
      case 'driver_dispatched': return 'Driver en route, 2-6 hours';
      case 'out_for_delivery': return 'Delivery within 1-3 hours';
      case 'delivered': return 'Completed';
      default: return null;
    }
  };

  return (
    <div className="bg-onolo-dark-lighter rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">
          Order #{order.id.slice(0, 8)}
        </h3>
        <div className="flex items-center space-x-2">
          {order.priority_level === 'urgent' && (
            <Badge className="bg-red-500 text-white">Urgent</Badge>
          )}
          <Badge className={getStatusColor(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </div>

      <Button
        onClick={() => onToggleExpansion(order.id)}
        variant="outline"
        size="sm"
        className="mb-4 w-full"
      >
        {isExpanded ? 'Hide Details' : 'View Tracking Details'}
      </Button>

      {isExpanded && (
        <OrderStatusTracker
          status={order.status}
          estimatedTimeRange={getStatusEstimate(order.status)}
          createdAt={order.created_at}
        />
      )}

      <OrderDetails order={order} />
      <OrderActions 
        order={order} 
        onCancelOrder={onCancelOrder} 
        onRescheduleSuccess={onRescheduleSuccess}
      />
    </div>
  );
};

export default OrderCard;
