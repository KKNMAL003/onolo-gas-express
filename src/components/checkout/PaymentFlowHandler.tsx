
import React from 'react';
import PayFastPayment from '@/components/PayFastPayment';
import PayPalPayment from '@/components/PayPalPayment';

interface OrderData {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
}

interface PaymentFlowHandlerProps {
  showPayFast: boolean;
  showPayPal: boolean;
  orderData: OrderData | null;
  onPaymentInitiated: () => void;
}

const PaymentFlowHandler: React.FC<PaymentFlowHandlerProps> = ({
  showPayFast,
  showPayPal,
  orderData,
  onPaymentInitiated
}) => {
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
            onPaymentInitiated={onPaymentInitiated}
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
            onPaymentInitiated={onPaymentInitiated}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentFlowHandler;
