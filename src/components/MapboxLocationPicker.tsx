import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Coordinates } from '@/services/mapboxService';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  deliveryCost: number;
}

interface MapboxLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialAddress?: string;
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  onLocationSelect,
  initialAddress = ''
}) => {
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: Coordinates;
    address: string;
  } | null>(null);
  
  const { 
    isLoading, 
    suggestions, 
    searchAddresses, 
    getCurrentLocation, 
    clearSuggestions 
  } = useMapboxGeocoding();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    searchAddresses(value);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const coordinates: Coordinates = {
      longitude: suggestion.center[0],
      latitude: suggestion.center[1]
    };
    
    const location = {
      coordinates,
      address: suggestion.place_name
    };
    
    setSelectedLocation(location);
    setAddressInput(suggestion.place_name);
    clearSuggestions();
    
    // Calculate delivery cost based on distance from Cape Town center
    const deliveryCost = calculateDeliveryCost(coordinates);
    
    onLocationSelect({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: suggestion.place_name,
      deliveryCost
    });
  };

  const handleCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setSelectedLocation(location);
      setAddressInput(location.address);
      
      const deliveryCost = calculateDeliveryCost(location.coordinates);
      
      onLocationSelect({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        address: location.address,
        deliveryCost
      });
    }
  };

  const calculateDeliveryCost = (coordinates: Coordinates): number => {
    // Cape Town center coordinates
    const capeTownCenter = { latitude: -33.9249, longitude: 18.4241 };
    
    // Simple distance calculation (in real app, use proper distance calculation)
    const distance = Math.sqrt(
      Math.pow(coordinates.latitude - capeTownCenter.latitude, 2) +
      Math.pow(coordinates.longitude - capeTownCenter.longitude, 2)
    );
    
    // Base cost + distance-based cost
    const baseCost = 50;
    const perKmCost = 15;
    const estimatedDistance = distance * 111; // Rough conversion to km
    
    return Math.max(baseCost, baseCost + (estimatedDistance * perKmCost));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address" className="text-sm font-medium text-white mb-2 block">
          Delivery Address
        </Label>
        
        <div className="flex space-x-2 mb-2">
          <div className="flex-1 relative">
            <Input
              id="address"
              type="text"
              value={addressInput}
              onChange={handleAddressChange}
              placeholder="Enter delivery address..."
              className="bg-onolo-dark-lighter border-onolo-dark-lighter text-white placeholder:text-onolo-gray"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-onolo-gray" />
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleCurrentLocation}
            disabled={isLoading}
            className="shrink-0"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Address suggestions */}
        {suggestions.length > 0 && (
          <Card className="mt-2 border-onolo-dark-lighter bg-onolo-dark-lighter">
            <CardContent className="p-0">
              <div className="max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-onolo-dark transition-colors border-b border-onolo-dark last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-onolo-orange mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {suggestion.text}
                        </p>
                        <p className="text-xs text-onolo-gray truncate">
                          {suggestion.place_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected location preview */}
        {selectedLocation && (
          <Card className="mt-4 border-onolo-orange/20 bg-onolo-orange/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-onolo-orange mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1">Selected Address</h4>
                  <p className="text-sm text-onolo-gray break-words">
                    {selectedLocation.address}
                  </p>
                  <p className="text-xs text-onolo-gray mt-2">
                    Coordinates: {selectedLocation.coordinates.latitude.toFixed(6)}, {selectedLocation.coordinates.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MapboxLocationPicker;