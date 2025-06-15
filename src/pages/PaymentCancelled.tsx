
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        
        <p className="text-onolo-gray mb-8">
          Your payment was cancelled. Your order is still pending and you can complete the payment anytime.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/orders')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Payment Again
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="mt-8 text-sm text-onolo-gray">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
