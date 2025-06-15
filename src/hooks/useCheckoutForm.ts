
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { FormData, LocationData, DeliverySlot } from '@/types/checkout';

export const useCheckoutForm = () => {
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'eft'
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot | null>(null);

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

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setFormData(prev => ({ ...prev, address: location.address }));
  };

  const handleSlotSelect = (slot: DeliverySlot) => {
    setDeliverySlot(slot);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return {
    formData,
    locationData,
    deliverySlot,
    handleLocationSelect,
    handleSlotSelect,
    handleChange
  };
};
