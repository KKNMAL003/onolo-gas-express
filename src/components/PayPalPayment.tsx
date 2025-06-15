
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';

interface PayPalPaymentProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  onPaymentInitiated: () => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
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
  const [error, setError] = useState<string | null>(null);

  const initiatePayPalPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to complete payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Initiating PayPal payment for order:', orderId);
      
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          orderId,
          amount,
          customerName,
          customerEmail,
          deliveryAddress
        }
      });

      if (error) {
        console.error('PayPal payment function error:', error);
        throw error;
      }

      console.log('PayPal payment response:', data);

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal approval URL
        window.location.href = data.approvalUrl;
        onPaymentInitiated();
      } else {
        throw new Error(data.message || 'Failed to initialize PayPal payment');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      const errorMessage = error.message || 'Failed to initiate PayPal payment. Please try again or choose a different payment method.';
      setError(errorMessage);
      toast({
        title: "Payment error",
        description: errorMessage,
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
        <h3 className="text-lg font-semibold text-white">PayPal Payment</h3>
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

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-onolo-dark rounded-lg p-4 mb-6">
        <p className="text-sm text-onolo-gray mb-2">
          You'll be redirected to PayPal to complete your payment securely.
        </p>
        <p className="text-xs text-onolo-gray mb-2">
          PayPal supports all major credit cards and bank transfers.
        </p>
        <p className="text-xs text-yellow-400">
          <strong>Note:</strong> Currently in sandbox mode for testing.
        </p>
      </div>

      <Button
        onClick={initiatePayPalPayment}
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
            Pay with PayPal
          </>
        )}
      </Button>

      <p className="text-xs text-onolo-gray mt-3 text-center">
        Powered by PayPal - Secure and trusted worldwide
      </p>
    </div>
  );
};

export default PayPalPayment;
