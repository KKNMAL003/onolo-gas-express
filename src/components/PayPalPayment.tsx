
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertTriangle, Info } from 'lucide-react';

interface PayPalPaymentProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  onPaymentInitiated: () => void;
}

// Declare PayPal global
declare global {
  interface Window {
    paypal?: any;
  }
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  // PayPal SDK Client ID (sandbox)
  const PAYPAL_CLIENT_ID = "AQXiJ3htdCqiXbnleDxdkHIEqXlNYrGYW-gTWj-OObM4cjZzzaxRXynW2rXHJuNsiH6Z0oftxGs1ziZK";

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = () => {
      if (document.querySelector('script[src*="paypal.com/sdk"]')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      script.onload = () => {
        console.log('PayPal SDK loaded');
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        setError('Failed to load PayPal payment system');
      };
      document.head.appendChild(script);
    };

    loadPayPalScript();
  }, []);

  // Initialize PayPal buttons when script is loaded
  useEffect(() => {
    if (scriptLoaded && window.paypal && paypalRef.current) {
      window.paypal.Buttons({
        createOrder: async () => {
          try {
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
              throw error;
            }

            if (data.success && data.paypalOrderId) {
              return data.paypalOrderId;
            } else {
              throw new Error(data.message || 'Failed to create PayPal order');
            }
          } catch (error) {
            console.error('PayPal order creation error:', error);
            setError(error.message || 'Failed to create PayPal order');
            throw error;
          }
        },
        onApprove: async (data: any) => {
          try {
            setIsProcessing(true);
            console.log('PayPal payment approved:', data);
            
            toast({
              title: "Payment Successful!",
              description: "Your PayPal payment has been processed successfully.",
            });

            onPaymentInitiated();
            
            // Redirect to success page
            window.location.href = `/payment-success?order_id=${orderId}&payment_source=paypal&paypal_order_id=${data.orderID}`;
          } catch (error) {
            console.error('Payment approval error:', error);
            setError('Failed to process payment approval');
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setError('PayPal payment failed. Please try again.');
          toast({
            title: "Payment Error",
            description: "There was an error with PayPal. Please try again.",
            variant: "destructive",
          });
        },
        onCancel: () => {
          console.log('PayPal payment cancelled');
          toast({
            title: "Payment Cancelled",
            description: "PayPal payment was cancelled.",
            variant: "destructive",
          });
        },
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        }
      }).render(paypalRef.current);
    }
  }, [scriptLoaded, orderId, amount, customerName, customerEmail, deliveryAddress, onPaymentInitiated, toast]);

  return (
    <div className="bg-onolo-dark-lighter rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <CreditCard className="w-6 h-6 text-onolo-orange" />
        <h3 className="text-lg font-semibold text-white">PayPal Payment</h3>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-onolo-gray">Amount:</span>
          <span className="text-white font-semibold">R {amount.toFixed(2)} (~${(amount / 18).toFixed(2)} USD)</span>
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
            <h4 className="text-blue-400 font-semibold text-sm mb-1">PayPal Smart Payment Buttons</h4>
            <p className="text-sm text-onolo-gray mb-2">
              Pay securely with PayPal directly on this page without redirects.
            </p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-onolo-gray ml-7">
          <p>• Supports PayPal accounts and credit cards</p>
          <p>• Secure transactions and buyer protection</p>
          <p>• No redirect required - pay on this page</p>
        </div>
        <div className="mt-3 p-3 bg-yellow-500 bg-opacity-10 rounded-lg ml-7">
          <p className="text-xs text-yellow-400">
            <strong>Sandbox Mode:</strong> Using PayPal's test environment. Converted to USD for sandbox testing.
          </p>
        </div>
      </div>

      {!scriptLoaded ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-onolo-orange mr-2" />
          <span className="text-onolo-gray">Loading PayPal...</span>
        </div>
      ) : (
        <div ref={paypalRef} className="paypal-buttons-container"></div>
      )}

      {isProcessing && (
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-onolo-orange mr-2" />
          <span className="text-sm text-onolo-gray">Processing payment...</span>
        </div>
      )}

      <p className="text-xs text-onolo-gray mt-3 text-center">
        Powered by PayPal - Secure and trusted worldwide
      </p>
    </div>
  );
};

export default PayPalPayment;
