
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Phone, Mail } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('m_payment_id') || searchParams.get('order_id');
  const paymentSource = searchParams.get('payment_source');

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Could not load order details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-onolo-gray">You need to be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onolo-orange"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-onolo-gray mb-4">We couldn't find the order you're looking for.</p>
          <Button onClick={() => navigate('/orders')} className="bg-onolo-orange hover:bg-onolo-orange-dark">
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  const isEFTPayment = order.payment_method === 'eft';

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {paymentSource === 'payfast' || paymentSource === 'paypal' ? 'Payment Successful!' : 'Order Placed Successfully!'}
          </h1>
          <p className="text-onolo-gray">
            Order #{order.id.slice(0, 8)} has been {paymentSource === 'payfast' || paymentSource === 'paypal' ? 'paid for and ' : ''}confirmed
          </p>
        </div>

        <div className="bg-onolo-dark-lighter rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-onolo-gray">Order ID:</span>
              <span className="font-mono">{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Total Amount:</span>
              <span className="font-semibold">R {order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Payment Method:</span>
              <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Delivery Address:</span>
              <span className="text-right text-xs">{order.delivery_address}</span>
            </div>
          </div>
        </div>

        {isEFTPayment && (
          <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4 text-yellow-400">Important: Proof of Payment Required</h3>
            <p className="text-sm text-yellow-200 mb-4">
              To complete your order, please send proof of payment to one of the following:
            </p>
            
            <div className="space-y-4">
              <div className="bg-onolo-dark rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-onolo-orange" />
                  <span className="font-semibold">Email</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">info@onologroup.com</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('info@onologroup.com')}
                    className="h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="bg-onolo-dark rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-onolo-orange" />
                  <span className="font-semibold">WhatsApp</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">071 770 3063</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('071 770 3063')}
                    className="h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-onolo-dark rounded-lg">
              <p className="text-xs text-onolo-gray">
                <strong>Include in your message:</strong><br />
                • Order Number: {order.id.slice(0, 8)}<br />
                • Your proof of payment screenshot<br />
                • Your delivery address
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/orders')}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark"
          >
            View My Orders
          </Button>
          
          <Button
            onClick={() => navigate('/order')}
            variant="outline"
            className="w-full"
          >
            Place Another Order
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-onolo-gray">
            You will receive email updates about your order status
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
