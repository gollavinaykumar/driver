import { getBackendAPI } from '../utils/getAPI';
import { getToken } from '../utils/getUserToken';

const API_KEY = getBackendAPI();
export const getDriverById = async (id: string) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_KEY}/drivers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get driver: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error on  getting driver:', error);
    throw error;
  }
};

export const updatePickUPLoadTrip = async (obj: unknown, vehicleId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(
      `${API_KEY}/trips/vehicles/${vehicleId}/ewaybill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('creating eway bill got error:', error);
  }
};

export const updateDropLoadTrip = async (obj: unknown, vehicleId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(
      `${API_KEY}/trips/vehicles/${vehicleId}/invoicebill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('creating invoice bill got error:', error);
  }
};

export interface userDetails {
  email: string;
  password: string;
}

export const getTripsByVehicleId = async (vehicleId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_KEY}/trips/driver/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('trips getting By  Vehicle id, got error:', error);
  }
};

export const getSingleVehicleByVehicleId = async (truckId: string) => {
  try {
    const response = await fetch(`${API_KEY}/trucks/${truckId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const getTripByVehicleId = async (vehicleId: string) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_KEY}/trips/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('trips getting By  Vehicle id, got error:', error);
  }
};

export const getLoadByLoadId = async (loadId: unknown) => {
  const token = await getToken();
  try {
    const response = await fetch(`${API_KEY}/myLoads/${loadId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('load getting By LoadId, got error:', error);
  }
};

export const updateLocationToVehicleAndDriver = async (obj: unknown) => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_KEY}/updateLocation`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(obj),
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const checkUser = async (obj: userDetails) => {
  try {
    const response = await fetch(`${API_KEY}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj),
    });

    console.log('API_KEY =', API_KEY);
    console.log('Final URL =', `${API_KEY}/login`);

    console.log('Status:', response.status);

    const text = await response.text();
    console.log('Raw response:', text);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Login error:', error);
  }
};

export async function requestOtp(phone: string) {
  try {
    const res = await fetch(`${API_KEY}/login/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    throw err || { message: 'Failed to request OTP' };
  }
}

export async function verifyOtp(phone: string, otp: string) {
  try {
    const res = await fetch(`${API_KEY}/login/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    throw err || { message: 'Failed to verify OTP' };
  }
}
