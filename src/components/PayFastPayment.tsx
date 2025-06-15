
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

interface PayFastPaymentProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  onPaymentInitiated: () => void;
}

const PayFastPayment: React.FC<PayFastPaymentProps> = ({
  orderId,
  amount,
  customerName,
  customerEmail,
  deliveryAddress,
  onPaymentInitiated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayFastPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating PayFast payment for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('payfast-payment', {
        body: {
          orderId,
          amount,
          customerName,
          customerEmail,
          deliveryAddress
        }
      });

      if (error) {
        console.error('PayFast payment function error:', error);
        throw error;
      }

      console.log('PayFast payment response:', data);

      if (data.success) {
        // Create PayFast form and submit it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        form.target = '_blank'; // Open in new tab

        // Add all payment data as hidden inputs
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        onPaymentInitiated();

        toast({
          title: "Payment initiated",
          description: "You've been redirected to PayFast to complete your payment.",
        });
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('PayFast payment error:', error);
      toast({
        title: "Payment error",
        description: "Failed to initiate payment. Please try again or choose a different payment method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-onolo-dark-lighter rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <CreditCard className="w-6 h-6 text-onolo-orange" />
        <h3 className="text-lg font-semibold text-white">PayFast Payment</h3>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-onolo-gray">Amount:</span>
          <span className="text-white font-semibold">R {amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-onolo-gray">Customer:</span>
          <span className="text-white">{customerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-onolo-gray">Email:</span>
          <span className="text-white">{customerEmail}</span>
        </div>
      </div>

      <div className="bg-onolo-dark rounded-lg p-4 mb-6">
        <p className="text-sm text-onolo-gray mb-2">
          You'll be redirected to PayFast to complete your payment securely.
        </p>
        <p className="text-xs text-onolo-gray mb-2">
          PayFast supports all major South African banks and payment methods including EFT, credit cards, and instant payments.
        </p>
        <p className="text-xs text-yellow-400">
          <strong>Note:</strong> Currently in test mode. Use PayFast's test payment methods.
        </p>
      </div>

      <Button
        onClick={initiatePayFastPayment}
        disabled={isProcessing}
        className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay with PayFast
          </>
        )}
      </Button>

      <p className="text-xs text-onolo-gray mt-3 text-center">
        Powered by PayFast - South Africa's leading payment gateway
      </p>
    </div>
  );
};

export default PayFastPayment;
