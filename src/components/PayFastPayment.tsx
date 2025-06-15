
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertTriangle, Info } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

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
        form.target = '_self'; // Stay in same window

        // Add all payment data as hidden inputs
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        
        // Show success message before redirect
        toast({
          title: "Redirecting to PayFast",
          description: "You will be redirected to complete your payment securely.",
        });

        // Small delay to show the toast
        setTimeout(() => {
          form.submit();
          onPaymentInitiated();
        }, 1000);

        document.body.removeChild(form);

      } else {
        throw new Error(data.error || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('PayFast payment error:', error);
      const errorMessage = error.message || 'Failed to initiate payment. Please try again or choose a different payment method.';
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

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-onolo-dark rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2 mb-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold text-sm mb-1">Payment Process</h4>
            <p className="text-sm text-onolo-gray mb-2">
              You'll be redirected to PayFast to complete your payment securely using South African payment methods.
            </p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-onolo-gray ml-7">
          <p>• Supports EFT, credit cards, and instant payments</p>
          <p>• Secure encryption and fraud protection</p>
          <p>• Return to app after payment completion</p>
        </div>
        <div className="mt-3 p-3 bg-yellow-500 bg-opacity-10 rounded-lg ml-7">
          <p className="text-xs text-yellow-400">
            <strong>Test Mode:</strong> Use PayFast's test payment methods for transactions.
          </p>
        </div>
      </div>

      <Button
        onClick={initiatePayFastPayment}
        disabled={isProcessing}
        className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to PayFast...
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
