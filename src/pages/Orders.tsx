import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/OrderCard';

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
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for driver orders - in real implementation this would filter by driver_id
      const mockOrders = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          status: 'scheduled_for_delivery',
          total_amount: 89.99,
          delivery_address: '123 Main St, Cape Town, 8001',
          payment_method: 'card',
          created_at: new Date().toISOString(),
          priority_level: 'high',
          estimated_delivery_start: '2024-01-15T10:00:00Z',
          estimated_delivery_end: '2024-01-15T12:00:00Z',
          delivery_date: '2024-01-15',
          preferred_delivery_window: 'morning',
          customer_name: 'John Smith',
          customer_email: 'john.smith@email.com',
          payment_confirmation_sent: true,
          receipt_sent: false,
          order_items: [
            { product_name: '9kg Gas Cylinder', quantity: 1, unit_price: 89.99 }
          ]
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          status: 'driver_dispatched',
          total_amount: 179.98,
          delivery_address: '456 Oak Ave, Stellenbosch, 7600',
          payment_method: 'eft',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          priority_level: 'normal',
          estimated_delivery_start: '2024-01-15T14:00:00Z',
          estimated_delivery_end: '2024-01-15T16:00:00Z',
          delivery_date: '2024-01-15',
          preferred_delivery_window: 'afternoon',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah.johnson@email.com',
          payment_confirmation_sent: true,
          receipt_sent: false,
          order_items: [
            { product_name: '9kg Gas Cylinder', quantity: 2, unit_price: 89.99 }
          ]
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading deliveries",
        description: "Failed to load delivery orders. Please try again.",
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // In real implementation, this would update via API
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      toast({
        title: "Status Updated",
        description: `Delivery status updated to ${newStatus.replace(/_/g, ' ')}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating status",
        description: "Failed to update delivery status. Please try again.",
        variant: "destructive",
      });
    }
  };


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
        <h1 className="text-2xl font-bold mb-8">My Deliveries</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">No deliveries assigned</h3>
            <p className="text-onolo-gray mb-6">You don't have any deliveries assigned yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id}>
                <OrderCard
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggleExpansion={toggleOrderExpansion}
                  onCancelOrder={() => {}} // Drivers can't cancel orders
                  onRescheduleSuccess={() => {}}
                  isDriverView={true}
                  onStatusUpdate={updateOrderStatus}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
