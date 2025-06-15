import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrderStatusTracker from '@/components/OrderStatusTracker';

interface OrderStatusHistory {
  id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  estimated_time_range: string | null;
  created_at: string;
}

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
  order_items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  order_status_history?: OrderStatusHistory[];
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

  const fetchOrderHistory = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order history:', error);
      return [];
    }
  };

  const toggleOrderExpansion = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      // Fetch order history when expanding
      const history = await fetchOrderHistory(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, order_status_history: history }
            : order
        )
      );
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'order_received': return 'bg-blue-500';
      case 'order_confirmed': return 'bg-blue-600';
      case 'scheduled_for_delivery': return 'bg-purple-500';
      case 'driver_dispatched': return 'bg-orange-500';
      case 'out_for_delivery': return 'bg-orange-600';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'eft': return 'EFT';
      case 'card': return 'Card';
      case 'payfast': return 'PayFast';
      default: return method;
    }
  };

  const getCurrentStatusEstimate = (order: Order) => {
    if (order.order_status_history && order.order_status_history.length > 0) {
      const latestHistory = order.order_status_history[order.order_status_history.length - 1];
      return latestHistory.estimated_time_range;
    }
    return null;
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
              <div key={order.id} className="bg-onolo-dark-lighter rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {order.priority_level === 'urgent' && (
                      <Badge className="bg-red-500 text-white">Urgent</Badge>
                    )}
                    <Badge className={getStatusColor(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => toggleOrderExpansion(order.id)}
                  variant="outline"
                  size="sm"
                  className="mb-4 w-full"
                >
                  {expandedOrder === order.id ? 'Hide Details' : 'View Tracking Details'}
                </Button>

                {expandedOrder === order.id && (
                  <OrderStatusTracker
                    status={order.status}
                    estimatedTimeRange={getCurrentStatusEstimate(order)}
                    createdAt={order.created_at}
                  />
                )}

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-onolo-gray">
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="text-white">
                        R {(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-onolo-gray text-sm">Total</span>
                  <span className="text-onolo-orange font-bold text-lg">
                    R {order.total_amount.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Payment:</span>
                    <span className="text-white">{getPaymentMethodDisplay(order.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Delivery:</span>
                    <span className="text-white">{order.delivery_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Date:</span>
                    <span className="text-white">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {order.estimated_delivery_start && order.estimated_delivery_end && (
                    <div className="flex justify-between">
                      <span className="text-onolo-gray">Estimated Delivery:</span>
                      <span className="text-white text-xs">
                        {new Date(order.estimated_delivery_start).toLocaleDateString()} - 
                        {new Date(order.estimated_delivery_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {(order.status === 'pending' || order.status === 'order_received') && (
                  <Button
                    onClick={() => cancelOrder(order.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                  >
                    Cancel Order
                  </Button>
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
