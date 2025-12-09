export type LoadStatus =
  | 'AVAILABLE'
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Requirements {
  size: string;
  type: string;
  acOption: string;
  trollyOption: string;
}

export interface Load {
  id: string;
  origin: {
    city: string;
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    city: string;
    address: string;
    lat: number;
    lng: number;
  };
  shipperId: string;
  status: LoadStatus | string;
  cargoType: string;
  weight: number;
  bidPrice: number;
  price: number;
  createdAt: string;
  pickupWindowStart: string;
  specialRequirements: Requirements;
  deliveryWindowEnd: string;
}
