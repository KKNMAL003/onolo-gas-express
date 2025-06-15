
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertTriangle, Info, ExternalLink } from 'lucide-react';

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

  const updateOrderToFailed = async (reason: string) => {
    try {
      await supabase
        .from('orders')
        .update({ 
          status: 'payment_failed',
          updated_by: 'payfast_system',
          updated_at: new Date().toISOString(),
          tracking_notes: reason
        })
        .eq('id', orderId);
      
      console.log(`Order ${orderId} marked as payment failed: ${reason}`);
    } catch (error) {
      console.error('Failed to update order status to failed:', error);
    }
  };

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
      console.log('Initiating PayFast redirect payment for order:', orderId);
      
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
        const errorMessage = error.message || 'Failed to initialize payment. Please try again or choose a different payment method.';
        await updateOrderToFailed(`PayFast initialization failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      console.log('PayFast payment response:', data);

      if (data.success && data.redirectUrl) {
        // Show success message before redirect
        toast({
          title: "Redirecting to PayFast",
          description: "You'll be redirected to PayFast to complete your payment.",
        });

        // Call the payment initiated callback
        onPaymentInitiated();

        // Small delay to ensure toast shows, then redirect
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 1000);

      } else {
        const errorMessage = data?.error || 'Failed to initialize PayFast payment';
        await updateOrderToFailed(`PayFast initialization failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('PayFast payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again or choose a different payment method.';
      setError(errorMessage);
      toast({
        title: "Payment error",
        description: errorMessage,
        variant: "destructive",
      });
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
            <h4 className="text-blue-400 font-semibold text-sm mb-1">PayFast Redirect Payment</h4>
            <p className="text-sm text-onolo-gray mb-2">
              You'll be redirected to PayFast's secure payment page to complete your transaction.
            </p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-onolo-gray ml-7">
          <p>• Supports EFT, credit cards, and instant payments</p>
          <p>• Secure encryption and fraud protection</p>
          <p>• Redirects to PayFast's secure payment portal</p>
          <p>• Returns to our site after payment completion</p>
        </div>
        <div className="mt-3 p-3 bg-yellow-500 bg-opacity-10 rounded-lg ml-7">
          <p className="text-xs text-yellow-400">
            <strong>Test Mode:</strong> Using verified PayFast sandbox credentials.
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
            <ExternalLink className="w-4 h-4 mr-2" />
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
