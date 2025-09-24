import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2tubWFsMDAzIiwiYSI6ImNtOWI2NGF1MjBjdWwya3M1Mmxua3hqaXgifQ._PMbFD1tTIq4zmjGCwnAHg';

// Initialize Mapbox
mapboxgl.accessToken = MAPBOX_TOKEN;

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface GeocodingResult {
  place_name: string;
  center: [number, number];
  text: string;
  properties?: {
    address?: string;
  };
}

export interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    duration: number;
    distance: number;
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
          location: [number, number];
        };
      }>;
    }>;
  }>;
}

export class MapboxService {
  private static instance: MapboxService;
  private baseUrl = 'https://api.mapbox.com';

  static getInstance(): MapboxService {
    if (!MapboxService.instance) {
      MapboxService.instance = new MapboxService();
    }
    return MapboxService.instance;
  }

  // Geocoding API - Forward geocoding (address to coordinates)
  async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=za&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  // Geocoding API - Reverse geocoding (coordinates to address)
  async reverseGeocode(longitude: number, latitude: number): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&country=za`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.features?.[0] || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Directions API - Get driving route between points
  async getRoute(
    start: Coordinates,
    end: Coordinates,
    profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving-traffic'
  ): Promise<RouteResponse> {
    try {
      const coordinates = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
      const response = await fetch(
        `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordinates}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Directions failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  // Matrix API - Get travel times between multiple points
  async getMatrix(
    coordinates: Coordinates[],
    profile: 'driving' | 'driving-traffic' = 'driving-traffic'
  ): Promise<{
    durations: number[][];
    distances: number[][];
  }> {
    try {
      const coordString = coordinates
        .map(coord => `${coord.longitude},${coord.latitude}`)
        .join(';');
      
      const response = await fetch(
        `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordString}?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Matrix failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Matrix error:', error);
      throw error;
    }
  }

  // Isochrone API - Get reachable area within time/distance
  async getIsochrone(
    center: Coordinates,
    contours: number[],
    profile: 'driving' | 'walking' | 'cycling' = 'driving',
    contourType: 'time' | 'distance' = 'time'
  ): Promise<any> {
    try {
      const contoursParam = contours.join(',');
      const response = await fetch(
        `${this.baseUrl}/isochrone/v1/mapbox/${profile}/${center.longitude},${center.latitude}?contours_minutes=${contoursParam}&polygons=true&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Isochrone failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Isochrone error:', error);
      throw error;
    }
  }

  // Map Matching API - Snap GPS traces to roads
  async mapMatch(coordinates: Coordinates[]): Promise<any> {
    try {
      const coordString = coordinates
        .map(coord => `${coord.longitude},${coord.latitude}`)
        .join(';');
      
      const response = await fetch(
        `${this.baseUrl}/matching/v5/mapbox/driving/${coordString}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Map matching failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Map matching error:', error);
      throw error;
    }
  }
}

export const mapboxService = MapboxService.getInstance();
export { MAPBOX_TOKEN };