
import React from 'react';

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

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'eft': return 'EFT';
      case 'card': return 'Card';
      case 'payfast': return 'PayFast';
      default: return method;
    }
  };

  return (
    <>
      <div className="space-y-2 mb-4">
        {order.order_items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-onolo-gray">
              {item.product_name} x{item.quantity}
            </span>
            <span className="text-white">
              R {(item.unit_price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-onolo-gray text-sm">Total</span>
        <span className="text-onolo-orange font-bold text-lg">
          R {order.total_amount.toFixed(2)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-onolo-gray">Payment:</span>
          <span className="text-white">{getPaymentMethodDisplay(order.payment_method)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-onolo-gray">Delivery:</span>
          <span className="text-white">{order.delivery_address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-onolo-gray">Date:</span>
          <span className="text-white">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
        {order.delivery_date && order.preferred_delivery_window && (
          <div className="flex justify-between">
            <span className="text-onolo-gray">Scheduled Delivery:</span>
            <span className="text-white text-xs">
              {new Date(order.delivery_date).toLocaleDateString()} - {order.preferred_delivery_window}
            </span>
          </div>
        )}
        {order.estimated_delivery_start && order.estimated_delivery_end && (
          <div className="flex justify-between">
            <span className="text-onolo-gray">Estimated Delivery:</span>
            <span className="text-white text-xs">
              {new Date(order.estimated_delivery_start).toLocaleDateString()} - 
              {new Date(order.estimated_delivery_end).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderDetails;
