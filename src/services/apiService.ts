import axios, { AxiosError } from 'axios';
import { getBackendAPI } from '../utils/getAPI';
import { getToken } from '../utils/getUserToken';
import { Trip } from '../types/TripInterface';
import { Load } from '../types/loadInterface';
import { logger } from '../utils/logger';

const BASE = getBackendAPI();
logger.log('🌐 API BASE:', BASE);

const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      logger.warn('Could not attach token to request:', err);
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as
        | { message?: string }
        | undefined;
      const payload: { message: string } = {
        message:
          responseData?.message ||
          error.message ||
          `Server error: ${error.response.status}`,
      };
      logger.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        message: payload.message,
      });
      return Promise.reject(payload);
    }

    // Network error or no response
    const networkError: {
      message: string;
      code?: string;
      isNetworkError: boolean;
    } = {
      message: error.message || 'Network error',
      code: error.code,
      isNetworkError: true,
    };
    logger.error('API Network Error:', networkError);
    return Promise.reject(networkError);
  },
);

export type TripsResponse = {
  trips: Trip[];
  loads: Load[];
};

export const getDriverById = async (id: string) => {
  try {
    const res = await api.get(`/drivers/${id}`);
    return res.data;
  } catch (err) {
    logger.error('❌ Error getting driver:', err);
    throw err;
  }
};

export const updatePickUPLoadTrip = async (obj: unknown, vehicleId: string) => {
  try {
    const res = await api.post(`/trips/vehicles/${vehicleId}/ewaybill`, obj);
    return res.data;
  } catch (err) {
    logger.error('❌ creating eway bill got error:', err);
    throw err;
  }
};

export const updateDropLoadTrip = async (obj: unknown, vehicleId: string) => {
  try {
    const res = await api.post(`/trips/vehicles/${vehicleId}/invoicebill`, obj);
    return res.data;
  } catch (err) {
    logger.error('❌ creating invoice bill got error:', err);
    throw err;
  }
};

export interface userDetails {
  email: string;
  password: string;
}

export const getTripsByVehicleId = async (vehicleId: string) => {
  try {
    const res = await api.get<TripsResponse>(`/trips/driver/${vehicleId}`);
    return res.data;
  } catch (err) {
    logger.error('❌ trips getting By Vehicle id, got error:', err);
    throw err;
  }
};

export const getSingleVehicleByVehicleId = async (truckId: string) => {
  try {
    const res = await api.get(`/trucks/${truckId}`);
    return res.data;
  } catch (err) {
    logger.error('❌ getSingleVehicleByVehicleId error:', err);
    throw err;
  }
};

export const getTripByVehicleId = async (vehicleId: string) => {
  try {
    const res = await api.get(`/trips/vehicles/${vehicleId}`);
    return res.data;
  } catch (err) {
    logger.error(
      '❌ trips getting By Vehicle id (vehicles endpoint) error:',
      err,
    );
    throw err;
  }
};

export const getLoadByLoadId = async (loadId: string | number) => {
  try {
    const res = await api.get(`/myLoads/${loadId}`);
    return res.data;
  } catch (err) {
    logger.error('❌ load getting By LoadId, got error:', err);
    throw err;
  }
};

export const updateLocationToVehicleAndDriver = async (obj: unknown) => {
  try {
    const res = await api.put(`/updateLocation`, obj);
    return res.data;
  } catch (err) {
    logger.error('❌ updateLocationToVehicleAndDriver error:', err);
    throw err;
  }
};

export const checkUser = async (obj: userDetails) => {
  try {
    const res = await api.post(`/login`, obj);
    return res.data;
  } catch (err) {
    logger.error('❌ Login error:', err);
    throw err;
  }
};

export const requestOtp = async (phone: string) => {
  try {
    const res = await api.post(`/login/otp/request`, { phone });
    return res.data;
  } catch (err) {
    logger.error('❌ requestOtp error:', err);
    throw err;
  }
};

export const verifyOtp = async (phone: string, otp: string) => {
  try {
    logger.log('Verifying OTP for phone:', phone);
    const res = await api.post(`/login/otp/verify`, { phone, otp });
    logger.log('OTP verification response:', res.data);
    return res.data;
  } catch (err) {
    logger.error('❌ verifyOtp error:', err);
    // Log the full error details for debugging
    if (err instanceof Error) {
      logger.error('Error details:', {
        message: err.message,
        name: err.name,
      });
    }
    throw err;
  }
};

export default api;
