import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, mapboxService, type Coordinates } from '@/services/mapboxService';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Route } from 'lucide-react';

interface MapboxMapProps {
  deliveries?: Array<{
    id: string;
    address: string;
    coordinates?: Coordinates;
    status: string;
    customer_name: string;
  }>;
  className?: string;
  showNavigation?: boolean;
  onAddressSelect?: (address: string, coordinates: Coordinates) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  deliveries = [],
  className = '',
  showNavigation = true,
  onAddressSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [18.4241, -33.9249], // Cape Town center
      zoom: 11,
      pitch: 45,
    });

    // Add navigation controls
    if (showNavigation) {
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.current.addControl(geolocateControl, 'top-right');

      // Listen for user location
      geolocateControl.on('geolocate', (e: any) => {
        setCurrentLocation({
          longitude: e.coords.longitude,
          latitude: e.coords.latitude
        });
      });
    }

    map.current.on('load', () => {
      setIsLoading(false);
      
      // Add delivery markers
      addDeliveryMarkers();
      
      // Auto-trigger geolocation
      if (showNavigation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude
            };
            setCurrentLocation(coords);
            map.current?.flyTo({
              center: [coords.longitude, coords.latitude],
              zoom: 13
            });
          },
          (error) => console.log('Geolocation error:', error)
        );
      }
    });

    // Handle map clicks for address selection
    if (onAddressSelect) {
      map.current.on('click', async (e) => {
        try {
          const result = await mapboxService.reverseGeocode(e.lngLat.lng, e.lngLat.lat);
          if (result) {
            onAddressSelect(result.place_name, {
              longitude: e.lngLat.lng,
              latitude: e.lngLat.lat
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
        }
      });
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  const addDeliveryMarkers = async () => {
    if (!map.current || deliveries.length === 0) return;

    for (const delivery of deliveries) {
      let coordinates = delivery.coordinates;
      
      // Geocode address if coordinates not provided
      if (!coordinates) {
        try {
          const results = await mapboxService.geocodeAddress(delivery.address);
          if (results.length > 0) {
            coordinates = {
              longitude: results[0].center[0],
              latitude: results[0].center[1]
            };
          }
        } catch (error) {
          console.error(`Error geocoding ${delivery.address}:`, error);
          continue;
        }
      }

      if (!coordinates) continue;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'delivery-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center shadow-lg cursor-pointer transform transition-transform hover:scale-110">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'delivery-popup'
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1">${delivery.customer_name}</h3>
          <p class="text-xs text-gray-600 mb-2">${delivery.address}</p>
          <div class="flex items-center justify-between">
            <span class="px-2 py-1 rounded text-xs font-medium ${getStatusColor(delivery.status)}">
              ${delivery.status.replace(/_/g, ' ')}
            </span>
            <button onclick="window.navigateToDelivery('${delivery.id}')" class="text-xs text-blue-600 hover:text-blue-800">
              Navigate
            </button>
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .setPopup(popup)
        .addTo(map.current);
    }

    // Fit map to show all markers
    if (deliveries.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      deliveries.forEach(delivery => {
        if (delivery.coordinates) {
          bounds.extend([delivery.coordinates.longitude, delivery.coordinates.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'driver_dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateToDelivery = async (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery || !currentLocation) return;

    let coordinates = delivery.coordinates;
    if (!coordinates) {
      try {
        const results = await mapboxService.geocodeAddress(delivery.address);
        if (results.length > 0) {
          coordinates = {
            longitude: results[0].center[0],
            latitude: results[0].center[1]
          };
        }
      } catch (error) {
        console.error('Error geocoding for navigation:', error);
        return;
      }
    }

    if (!coordinates) return;

    try {
      const route = await mapboxService.getRoute(currentLocation, coordinates);
      
      if (route.routes.length > 0) {
        const routeGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: route.routes[0].geometry.coordinates
          }
        };

        // Add route to map
        if (map.current?.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
        } else {
          map.current?.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ff6b35',
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
        }

        // Fit map to route
        const routeBounds = new mapboxgl.LngLatBounds();
        route.routes[0].geometry.coordinates.forEach((coord: [number, number]) => {
          routeBounds.extend(coord);
        });
        map.current?.fitBounds(routeBounds, { padding: 50 });

        setSelectedDelivery(deliveryId);
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
  };

  // Make navigate function available globally for popup buttons
  useEffect(() => {
    (window as any).navigateToDelivery = navigateToDelivery;
    return () => {
      delete (window as any).navigateToDelivery;
    };
  }, [currentLocation, deliveries]);

  const clearRoute = () => {
    if (map.current?.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    setSelectedDelivery(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-onolo-dark/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-onolo-orange mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {selectedDelivery && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Route className="w-4 h-4 text-onolo-orange" />
              <span className="text-sm font-medium">Route Active</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRoute}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;