
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  deliveryCost: number;
}

export interface DeliverySlot {
  date: string;
  timeWindow: string;
  slotId: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
}
