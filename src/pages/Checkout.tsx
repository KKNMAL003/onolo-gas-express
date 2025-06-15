
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationPicker from '@/components/LocationPicker';
import DeliverySlotPicker from '@/components/DeliverySlotPicker';
import PayFastPayment from '@/components/PayFastPayment';
import { CreditCard } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayFast, setShowPayFast] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'eft'
  });

  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    deliveryCost: number;
  } | null>(null);

  const [deliverySlot, setDeliverySlot] = useState<{
    date: string;
    timeWindow: string;
    slotId: string;
  } | null>(null);

  useEffect(() => {
    console.log('Checkout: user and profile data:', { user: user?.email, profile });
    
    if (user) {
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      setFormData(prev => ({
        ...prev,
        name: fullName || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
      }));
    }
  }, [user, profile]);

  const total = getTotalPrice();
  const deliveryCost = locationData?.deliveryCost || 0;
  const finalTotal = total + deliveryCost;

  const handleLocationSelect = (location: typeof locationData) => {
    setLocationData(location);
    setFormData(prev => ({ ...prev, address: location.address }));
  };

  const handleSlotSelect = (slot: typeof deliverySlot) => {
    setDeliverySlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place an order.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      navigate('/order');
      return;
    }

    if (!locationData) {
      toast({
        title: "Location required",
        description: "Please select your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!deliverySlot) {
      toast({
        title: "Delivery slot required",
        description: "Please select a delivery time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          delivery_address: locationData.address,
          delivery_phone: formData.phone,
          payment_method: formData.paymentMethod,
          customer_name: formData.name,
          customer_email: formData.email,
          status: 'pending',
          preferred_delivery_window: deliverySlot.timeWindow,
          delivery_date: deliverySlot.date,
          delivery_latitude: locationData.latitude,
          delivery_longitude: locationData.longitude,
          delivery_cost: deliveryCost,
          service_area_validated: true, // Always true since we removed validation
          auto_status_enabled: true
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Handle payment method
      if (formData.paymentMethod === 'payfast') {
        setOrderData({
          orderId: order.id,
          amount: finalTotal,
          customerName: formData.name,
          customerEmail: formData.email,
          deliveryAddress: locationData.address
        });
        setShowPayFast(true);
        return;
      }

      clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id.slice(0, 8)} has been submitted.`,
      });

      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error placing order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFastInitiated = () => {
    clearCart();
    toast({
      title: "Payment initiated",
      description: "Complete your payment to confirm the order.",
    });
    navigate('/orders');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (showPayFast && orderData) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Complete Payment</h1>
          <PayFastPayment
            orderId={orderData.orderId}
            amount={orderData.amount}
            customerName={orderData.customerName}
            customerEmail={orderData.customerEmail}
            deliveryAddress={orderData.deliveryAddress}
            onPaymentInitiated={handlePayFastInitiated}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Location</h2>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialAddress={formData.address}
            />
          </div>

          {/* Delivery Schedule */}
          {locationData && (
            <div className="bg-onolo-dark-lighter rounded-2xl p-6">
              <DeliverySlotPicker onSlotSelect={handleSlotSelect} />
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="eft"
                  checked={formData.paymentMethod === 'eft'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <span>EFT (Electronic Funds Transfer)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <span>Credit/Debit Card</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payfast"
                  checked={formData.paymentMethod === 'payfast'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>PayFast (Instant Payment)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={handleChange}
                  className="text-onolo-orange"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            {formData.paymentMethod === 'eft' && (
              <div className="mt-4 p-4 bg-onolo-dark rounded-xl border border-onolo-orange">
                <h3 className="text-onolo-orange font-semibold mb-3">Banking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Bank:</span>
                    <span>Standard Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Account Name:</span>
                    <span>Onolo Group (Pty) Ltd</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Account Number:</span>
                    <span>012345678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Branch Code:</span>
                    <span>051001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-onolo-gray">Reference:</span>
                    <span>Your Order Number</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-onolo-orange bg-opacity-10 rounded-lg">
                  <p className="text-xs text-onolo-orange">
                    <strong>Important:</strong> Please send proof of payment (POP) to <br />
                    <strong>info@onologroup.com</strong> with your order number as reference.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryCost > 0 ? `R ${deliveryCost.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="border-t border-onolo-gray pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-onolo-orange">R {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !locationData || !deliverySlot}
            className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
