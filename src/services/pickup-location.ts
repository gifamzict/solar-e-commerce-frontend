import axios from "axios";

export interface PickupLocation {
  id: number;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  contact_person?: string;
  phone?: string;
  notes?: string;
  is_default: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreatePickupLocationInput = Omit<PickupLocation, "id" | "created_at" | "updated_at">;
export type UpdatePickupLocationInput = Partial<CreatePickupLocationInput>;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export async function fetchPickupLocations(): Promise<PickupLocation[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/pickup-locations`);
    const data = response.data;
    // Allow both array and wrapped responses
    if (Array.isArray(data)) return data as PickupLocation[];
    if (Array.isArray(data?.pickup_locations)) return data.pickup_locations as PickupLocation[];
    if (Array.isArray(data?.data)) return data.data as PickupLocation[];
    return [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function createPickupLocation(payload: CreatePickupLocationInput): Promise<PickupLocation> {
  try {
    const response = await axios.post(`${API_BASE_URL}/pickup-locations`, payload);
    return response.data?.pickup_location || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function updatePickupLocation(id: number, payload: UpdatePickupLocationInput): Promise<PickupLocation> {
  try {
    const response = await axios.put(`${API_BASE_URL}/pickup-locations/${id}`, payload);
    return response.data?.pickup_location || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function deletePickupLocation(id: number): Promise<{ message?: string }> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/pickup-locations/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function fetchActivePickupLocations(): Promise<PickupLocation[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/pickup-locations-active`);
    const data = response.data;
    if (Array.isArray(data)) return data as PickupLocation[];
    if (Array.isArray(data?.data)) return data.data as PickupLocation[];
    return [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function fetchDefaultPickupLocation(): Promise<PickupLocation | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/pickup-locations-default`);
    return response.data?.pickup_location || response.data || null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status !== 404) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    return null;
  }
}

export async function setDefaultPickupLocation(id: number): Promise<PickupLocation> {
  try {
    const response = await axios.patch(`${API_BASE_URL}/pickup-locations/${id}/set-default`);
    return response.data?.pickup_location || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function toggleActivePickupLocation(id: number): Promise<PickupLocation> {
  try {
    const response = await axios.patch(`${API_BASE_URL}/pickup-locations/${id}/toggle-active`);
    return response.data?.pickup_location || response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}

export async function fetchPickupLocationsWithQuery(params: { search?: string; active?: boolean }): Promise<PickupLocation[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/pickup-locations`, { params });
    const data = response.data;
    if (Array.isArray(data)) return data as PickupLocation[];
    if (Array.isArray(data?.pickup_locations)) return data.pickup_locations as PickupLocation[];
    if (Array.isArray(data?.data)) return data.data as PickupLocation[];
    return [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
}
