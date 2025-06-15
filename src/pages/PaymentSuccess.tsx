
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Payment successful!",
      description: "Your order has been received and is being processed.",
    });
  }, [toast]);

  const orderId = searchParams.get('m_payment_id');

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        
        <p className="text-onolo-gray mb-6">
          Thank you for your payment. Your order has been received and will be processed shortly.
        </p>

        {orderId && (
          <div className="bg-onolo-dark-lighter rounded-xl p-4 mb-6">
            <p className="text-sm text-onolo-gray mb-1">Order ID:</p>
            <p className="font-mono text-onolo-orange">#{orderId.slice(0, 8)}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/orders')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark"
          >
            View My Orders
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>

        <div className="mt-8 text-sm text-onolo-gray">
          <p>You'll receive an email confirmation shortly.</p>
          <p>We'll keep you updated on your order status.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
