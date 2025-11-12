// filepath: /Users/gifamz/Desktop/G-TechSolar/gifamz-admin-dash/src/services/contact.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://web-production-d1120.up.railway.app/api";

export interface ContactFormPayload {
  full_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  business_hours: {
    monday_friday: string;
    saturday: string;
    sunday: string;
  };
  response_time: string;
}

export const submitContactForm = async (
  payload: ContactFormPayload
): Promise<ContactFormResponse> => {
  const { data } = await axios.post<ContactFormResponse>(
    `${API_BASE_URL}/contact/submit`,
    payload,
    { headers: { Accept: "application/json" } }
  );
  return data;
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  const { data } = await axios.get<{ contact_info: ContactInfo }>(
    `${API_BASE_URL}/contact/info`,
    { headers: { Accept: "application/json" } }
  );
  return data.contact_info;
};
