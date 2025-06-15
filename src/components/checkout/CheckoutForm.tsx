
import React from 'react';
import { Button } from '@/components/ui/button';
import LocationPicker from '@/components/LocationPicker';
import DeliverySlotPicker from '@/components/DeliverySlotPicker';
import CustomerInformationForm from './CustomerInformationForm';
import PaymentMethodSection from './PaymentMethodSection';
import OrderSummarySection from './OrderSummarySection';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  deliveryCost: number;
}

interface DeliverySlot {
  date: string;
  timeWindow: string;
  slotId: string;
}

interface CheckoutFormProps {
  formData: FormData;
  locationData: LocationData | null;
  deliverySlot: DeliverySlot | null;
  cartItems: CartItem[];
  total: number;
  deliveryCost: number;
  finalTotal: number;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onLocationSelect: (location: LocationData) => void;
  onSlotSelect: (slot: DeliverySlot) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  formData,
  locationData,
  deliverySlot,
  cartItems,
  total,
  deliveryCost,
  finalTotal,
  isLoading,
  onSubmit,
  onChange,
  onLocationSelect,
  onSlotSelect
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Customer Information */}
      <CustomerInformationForm
        formData={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }}
        onChange={onChange}
      />

      {/* Location & Delivery */}
      <div className="bg-onolo-dark-lighter rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery Location</h2>
        <LocationPicker
          onLocationSelect={onLocationSelect}
          initialAddress={formData.address}
        />
      </div>

      {/* Delivery Schedule */}
      {locationData && (
        <div className="bg-onolo-dark-lighter rounded-2xl p-6">
          <DeliverySlotPicker onSlotSelect={onSlotSelect} />
        </div>
      )}

      {/* Payment Method */}
      <PaymentMethodSection
        paymentMethod={formData.paymentMethod}
        onChange={onChange}
      />

      {/* Order Summary */}
      <OrderSummarySection
        cartItems={cartItems}
        total={total}
        deliveryCost={deliveryCost}
        finalTotal={finalTotal}
      />

      <Button
        type="submit"
        disabled={isLoading || !locationData || !deliverySlot}
        className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-4 px-6 rounded-2xl transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Place Order'}
      </Button>
    </form>
  );
};

export default CheckoutForm;
