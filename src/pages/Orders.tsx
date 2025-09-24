import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderCard from '@/components/OrderCard';
import MapboxMap from '@/components/MapboxMap';
import { Map, List } from 'lucide-react';

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

  // Transform orders for map component
  const deliveriesForMap = orders.map(order => ({
    id: order.id,
    address: order.delivery_address,
    status: order.status,
    customer_name: order.customer_name,
    coordinates: undefined // Will be geocoded by map component
  }));

  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8">My Deliveries</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">No deliveries assigned</h3>
            <p className="text-onolo-gray mb-6">You don't have any deliveries assigned yet</p>
          </div>
        ) : (
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <Map className="w-4 h-4" />
                <span>Map View</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>List View</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-0">
              <div className="h-[600px] w-full mb-6">
                <MapboxMap
                  deliveries={deliveriesForMap}
                  className="w-full h-full"
                  showNavigation={true}
                />
              </div>
              
              {/* Quick status updates below map */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-onolo-dark-lighter rounded-lg p-4 border border-onolo-dark-lighter">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{order.customer_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'scheduled_for_delivery' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'driver_dispatched' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'out_for_delivery' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-onolo-gray mb-2">{order.delivery_address}</p>
                    <div className="flex space-x-2">
                      {order.status === 'scheduled_for_delivery' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'driver_dispatched')}
                          className="text-xs"
                        >
                          Accept
                        </Button>
                      )}
                      {order.status === 'driver_dispatched' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                          className="text-xs"
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-6 max-w-2xl mx-auto">
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Orders;
