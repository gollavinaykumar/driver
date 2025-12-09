import { create } from 'zustand';
import { Driver } from '../types/VehicleAndDriverInterface';

interface DriverStore {
  driver: Driver | null;
  setDriver: (driver: Driver) => void;
  getDriver: () => Driver | null;
  clearDriver: () => void;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  driver: null,

  setDriver: (driver: Driver) => set({ driver }),

  getDriver: () => get().driver,

  clearDriver: () => set({ driver: null }),
}));
