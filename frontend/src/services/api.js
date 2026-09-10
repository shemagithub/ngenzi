// frontend/src/services/api.js
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';

const api = axios.create({
  baseURL: Backendurl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProperties = async (searchParams) => {
  try {
    const response = await api.post('/api/properties/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getLocationTrends = async (city) => {
  try {
    const response = await api.get(`/api/locations/${encodeURIComponent(city)}/trends`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location trends:', error);
    throw error;
  }
};

export default api;
