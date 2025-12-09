import { create } from 'zustand';
import { Vehicle } from '../types/VehicleAndDriverInterface';

interface VehicleStore {
  vehicle: Vehicle | null;
  setVehicle: (vehicle: Vehicle) => void;
  getVehicle: () => Vehicle | null;
  resetVehicle: () => void;
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicle: null,
  setVehicle: (vehicle: Vehicle) => set({ vehicle }),
  getVehicle: () => get().vehicle,
  resetVehicle: () => set({ vehicle: null }),
}));
