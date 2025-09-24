import { useState, useCallback } from 'react';
import { mapboxService, type Coordinates, type GeocodingResult } from '@/services/mapboxService';
import { useToast } from '@/hooks/use-toast';

export const useMapboxGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const { toast } = useToast();

  const searchAddresses = useCallback(async (query: string): Promise<void> => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await mapboxService.geocodeAddress(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
      toast({
        title: "Search Error",
        description: "Unable to search addresses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getCurrentLocation = useCallback(async (): Promise<{
    coordinates: Coordinates;
    address: string;
  } | null> => {
    setIsLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const coordinates: Coordinates = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      };

      // Reverse geocode to get address
      const result = await mapboxService.reverseGeocode(
        coordinates.longitude,
        coordinates.latitude
      );

      const address = result?.place_name || `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;

      return { coordinates, address };
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please enter your address manually.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    isLoading,
    suggestions,
    searchAddresses,
    getCurrentLocation,
    clearSuggestions
  };
};