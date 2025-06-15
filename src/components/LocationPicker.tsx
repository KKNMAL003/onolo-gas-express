
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string; deliveryCost: number }) => void;
  initialAddress?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialAddress = '' }) => {
  const [address, setAddress] = useState(initialAddress);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const { isLoading, getCurrentLocation, validateServiceArea, calculateDeliveryCost } = useLocation();

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setAddress(location.address);
      await validateLocation(location.latitude, location.longitude);
    }
  };

  const validateLocation = async (lat: number, lng: number) => {
    setIsValidating(true);
    try {
      const [isValid, deliveryCost] = await Promise.all([
        validateServiceArea(lat, lng),
        calculateDeliveryCost(lat, lng)
      ]);

      if (isValid) {
        setValidationResult({ isValid: true, message: `Delivery available - R${deliveryCost.toFixed(2)}` });
        onLocationSelect({ latitude: lat, longitude: lng, address, deliveryCost });
      } else {
        setValidationResult({ isValid: false, message: 'Sorry, we don\'t deliver to this area yet.' });
      }
    } catch (error) {
      setValidationResult({ isValid: false, message: 'Error validating location. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddressSubmit = async () => {
    // In a real implementation, you'd use a geocoding service to convert address to coordinates
    // For now, we'll use mock coordinates for demonstration
    const mockCoordinates = { lat: -26.2041, lng: 28.0473 }; // Johannesburg
    await validateLocation(mockCoordinates.lat, mockCoordinates.lng);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Delivery Address</Label>
        <div className="flex space-x-2 mt-2">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your delivery address"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {address && (
        <Button
          type="button"
          onClick={handleAddressSubmit}
          disabled={isValidating}
          className="w-full"
          variant="outline"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Address'
          )}
        </Button>
      )}

      {validationResult && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          validationResult.isValid 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{validationResult.message}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
