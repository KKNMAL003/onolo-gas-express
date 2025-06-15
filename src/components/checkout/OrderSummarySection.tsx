
import React from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummarySectionProps {
  cartItems: CartItem[];
  total: number;
  deliveryCost: number;
  finalTotal: number;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  cartItems,
  total,
  deliveryCost,
  finalTotal
}) => {
  return (
    <div className="bg-onolo-dark-lighter rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      <div className="space-y-2">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name} x{item.quantity}</span>
            <span>R {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{deliveryCost > 0 ? `R ${deliveryCost.toFixed(2)}` : 'Free'}</span>
        </div>
        <div className="border-t border-onolo-gray pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-onolo-orange">R {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySection;
