
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-6 text-onolo-gray hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Checkout
        </Button>

        <h1 className="text-2xl font-bold mb-8">Complete Payment</h1>

        {showPayPal && (
          <PayPalPayment
            orderId={orderData.orderId}
            amount={orderData.amount}
            customerName={orderData.customerName}
            customerEmail={orderData.customerEmail}
            deliveryAddress={orderData.deliveryAddress}
            onPaymentInitiated={onPaymentInitiated}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentFlowHandler;
