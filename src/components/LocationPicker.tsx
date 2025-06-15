
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string; deliveryCost: number }) => void;
  initialAddress?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialAddress = '' }) => {
  const [address, setAddress] = useState(initialAddress);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isLoading, suggestions, getCurrentLocation, searchLocation, selectLocation } = useLocation();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (address) {
        searchLocation(address);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [address, searchLocation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setAddress(location.address);
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        deliveryCost: 0 // No delivery cost calculation for now
      });
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const location = selectLocation(suggestion);
    setAddress(location.address);
    setShowSuggestions(false);
    
    onLocationSelect({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      deliveryCost: 0 // No delivery cost calculation for now
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Delivery Address</Label>
        <div className="relative mt-2">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="address"
                value={address}
                onChange={handleAddressChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter your delivery address"
                className="w-full"
              />
              
              {suggestions.length > 0 && showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-black"
                    >
                      <div className="text-sm">
                        {suggestion.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
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
      </div>

      {address && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Location selected: {address}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
