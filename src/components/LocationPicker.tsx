
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="houseNumber" className="text-white">House/Unit Number</Label>
          <Input
            id="houseNumber"
            value={addressForm.houseNumber}
            onChange={(e) => handleInputChange('houseNumber', e.target.value)}
            placeholder="123"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="streetName" className="text-white">Street Name</Label>
          <Input
            id="streetName"
            value={addressForm.streetName}
            onChange={(e) => handleInputChange('streetName', e.target.value)}
            placeholder="Main Road"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="suburb" className="text-white">Suburb/Area</Label>
        <Input
          id="suburb"
          value={addressForm.suburb}
          onChange={(e) => handleInputChange('suburb', e.target.value)}
          placeholder="Sandton"
          className="bg-onolo-dark border-onolo-gray text-white mt-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white">City</Label>
          <Input
            id="city"
            value={addressForm.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Johannesburg"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="postalCode" className="text-white">Postal Code</Label>
          <Input
            id="postalCode"
            value={addressForm.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="2196"
            className="bg-onolo-dark border-onolo-gray text-white mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="province" className="text-white">Province</Label>
        <select
          id="province"
          value={addressForm.province}
          onChange={(e) => handleInputChange('province', e.target.value)}
          className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
        >
          <option value="Gauteng">Gauteng</option>
          <option value="Western Cape">Western Cape</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          <option value="Eastern Cape">Eastern Cape</option>
          <option value="Free State">Free State</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Mpumalanga">Mpumalanga</option>
          <option value="North West">North West</option>
          <option value="Northern Cape">Northern Cape</option>
        </select>
      </div>

      {/* Non-Gauteng delivery restriction message */}
      {isNonGautengProvince && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            We currently only deliver within Gauteng province. Please select Gauteng if you wish to place an order, or contact us for special delivery arrangements.
          </AlertDescription>
        </Alert>
      )}

      {fullAddress && !isNonGautengProvince && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Delivery Address:</div>
              <div className="text-sm">{fullAddress}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
