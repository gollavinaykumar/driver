// interfaces/Driver.interface.ts
export interface Driver {
  id: string;
  name: string;
  email?: string;
  password: string;
  image?: string;
  phone: string;
  contact2?: string;
  currentLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  licenseUrl: string;
  PANUrl: string;
  ownerId: string;
  noOfTrips: number;
  vehicleId?: string;
  isDriverVerified: boolean;
  isDriverActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  vehicleType: {
    size: string;
    type: string;
    acOption: boolean;
    trollyOption: boolean;
  };
  isActive: boolean;
  ownerId: string;
  currentLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  vehicleRCUrl: string;
  insuranceNumber: string;
  isDeleted: boolean;
  insuranceExpiry: string;
  fitnessCertExpiry: string;
  permitType?: string;
  isVehicleVerified: boolean;
  isDriverAssigned: boolean;
  isDriverVerified: boolean;
  createdAt: string;
  updatedAt: string;

  Driver?: Driver;
}
