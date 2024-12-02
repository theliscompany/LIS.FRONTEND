import axios from 'axios';

export const axiosInstanceTransport = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_TRANSPORT_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});