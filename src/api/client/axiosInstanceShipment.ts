import axios from 'axios';

export const axiosInstanceShipment = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_SHIPMENT_ENDPOINT, // URL de base pour Service 1
  //timeout: 5000, // Timeout personnalisé
  headers: {
    'Content-Type': 'application/json',
  },
});