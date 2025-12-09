export interface Trip {
  id: string;
  loadId: string;
  driverId: string;
  vehicleId: string;
  plannedRoute?: TripRoute;
  actualRoute?: TripRoute;
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: string;
  pickUpPIN?: string;
  deliveryPIN?: string;
  endTime?: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  message?: string;
}
interface TripRoute {
  distance: number;
  waypoints: Waypoint[];
}
interface Waypoint {
  lat: number;
  lng: number;
}
export type TripStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED';
