
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/OrderCard';
import { sendStatusUpdateEmail, sendInvoiceEmail } from '@/utils/emailUtils';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  payment_method: string;
  created_at: string;
  priority_level: string | null;
  estimated_delivery_start: string | null;
  estimated_delivery_end: string | null;
  delivery_date: string | null;
  preferred_delivery_window: string | null;
  customer_name: string;
  customer_email: string;
  payment_confirmation_sent: boolean | null;
  receipt_sent: boolean | null;
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_by: 'customer' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ));

      toast({
        title: "Order cancelled",
        description: "Your order has been successfully cancelled.",
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error cancelling order",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleSuccess = () => {
    fetchOrders(); // Refresh orders to show updated delivery schedule
  };

  const handleResendEmail = async (order: Order, type: 'status' | 'invoice') => {
    try {
      let result;
      if (type === 'status') {
        result = await sendStatusUpdateEmail(order.id, order.customer_email, order.customer_name);
      } else {
        result = await sendInvoiceEmail(order.id, order.customer_email, order.customer_name);
      }

      if (result.success) {
        toast({
          title: "Email sent",
          description: `${type === 'status' ? 'Status update' : 'Invoice'} email has been sent successfully.`,
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Error sending email",
        description: `Failed to send ${type} email. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-onolo-gray">You need to be signed in to view your orders.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onolo-orange mx-auto mb-4"></div>
          <p className="text-onolo-gray">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-onolo-gray mb-6">You haven't placed any orders yet</p>
            <Button
              onClick={() => window.location.href = '/order'}
              className="bg-onolo-orange hover:bg-onolo-orange-dark"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id}>
                <OrderCard
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggleExpansion={toggleOrderExpansion}
                  onCancelOrder={cancelOrder}
                  onRescheduleSuccess={handleRescheduleSuccess}
                />
                
                {/* Email Actions */}
                {expandedOrder === order.id && (
                  <div className="mt-4 p-4 bg-onolo-dark-lighter rounded-lg border-t border-onolo-gray">
                    <h4 className="text-sm font-semibold mb-3 text-onolo-gray">Email Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendEmail(order, 'status')}
                        className="text-xs"
                      >
                        Resend Status Email
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendEmail(order, 'invoice')}
                          className="text-xs"
                        >
                          Resend Invoice
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-onolo-gray">
                      <p>Confirmation sent: {order.payment_confirmation_sent ? '✓' : '✗'}</p>
                      <p>Invoice sent: {order.receipt_sent ? '✓' : '✗'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
