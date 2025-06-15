
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface ServiceArea {
  id: string;
  name: string;
  delivery_cost: number;
}

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
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

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding using a simple approach (you can integrate with Google Maps API)
      const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      const locationData = { latitude, longitude, address };
      setLocation(locationData);
      return locationData;
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

  const validateServiceArea = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_service_area', {
        delivery_lat: latitude,
        delivery_lng: longitude
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating service area:', error);
      return false;
    }
  }, []);

  const calculateDeliveryCost = useCallback(async (latitude: number, longitude: number): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_delivery_cost', {
        delivery_lat: latitude,
        delivery_lng: longitude
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      return 0;
    }
  }, []);

  const getServiceAreas = useCallback(async (): Promise<ServiceArea[]> => {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('id, name, delivery_cost')
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service areas:', error);
      return [];
    }
  }, []);

  return {
    isLoading,
    location,
    getCurrentLocation,
    validateServiceArea,
    calculateDeliveryCost,
    getServiceAreas
  };
};
