
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import AddressForm from './AddressForm';
import DeliveryRestrictionAlert from './DeliveryRestrictionAlert';
import AddressPreview from './AddressPreview';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string; deliveryCost: number }) => void;
  initialAddress?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialAddress = '' }) => {
  const [addressForm, setAddressForm] = useState({
    houseNumber: '',
    streetName: '',
    suburb: '',
    city: '',
    postalCode: '',
    province: 'Gauteng'
  });
  
  const { isLoading, getCurrentLocation } = useLocation();

  // Parse initial address if provided
  React.useEffect(() => {
    if (initialAddress && !addressForm.streetName) {
      // Try to parse the initial address (basic parsing)
      setAddressForm(prev => ({
        ...prev,
        streetName: initialAddress
      }));
    }
  }, [initialAddress, addressForm.streetName]);

  const handleInputChange = (field: string, value: string) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Construct full address and notify parent
    const updatedForm = { ...addressForm, [field]: value };
    const fullAddress = constructFullAddress(updatedForm);
    
    if (fullAddress.trim()) {
      onLocationSelect({
        latitude: 0, // Default coordinates for manual entry
        longitude: 0,
        address: fullAddress,
        deliveryCost: 0
      });
    }
  };

  const constructFullAddress = (form: typeof addressForm) => {
    const parts = [
      form.houseNumber,
      form.streetName,
      form.suburb,
      form.city,
      form.postalCode,
      form.province
    ].filter(part => part.trim());
    
    return parts.join(', ');
  };

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      // Try to parse the address into components (basic parsing)
      const addressParts = location.address.split(',').map(part => part.trim());
      
      setAddressForm({
        houseNumber: '',
        streetName: addressParts[0] || '',
        suburb: addressParts[1] || '',
        city: addressParts[2] || '',
        postalCode: '',
        province: 'Gauteng'
      });

      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        deliveryCost: 0
      });
    }
  };

  const fullAddress = constructFullAddress(addressForm);
  const isNonGautengProvince = addressForm.province !== 'Gauteng';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold text-white">Delivery Address</Label>
        <Button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="bg-onolo-dark border-onolo-gray hover:bg-onolo-gray text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
      </div>

      <AddressForm
        addressForm={addressForm}
        onInputChange={handleInputChange}
      />

      <DeliveryRestrictionAlert isNonGautengProvince={isNonGautengProvince} />

      <AddressPreview 
        fullAddress={fullAddress} 
        isNonGautengProvince={isNonGautengProvince} 
      />
    </div>
  );
};

export default LocationPicker;
