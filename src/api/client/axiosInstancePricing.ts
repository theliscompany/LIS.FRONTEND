import axios from 'axios';

export var axiosInstancePricing = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_PRICING_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});
// import axios from 'axios';

// export const axiosInstancePricing = (config: any) => {
//   return axios({
//     ...config,
//     baseURL: process.env.REACT_APP_API_LIS_PRICING_ENDPOINT || 'https://default-api-url.com',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };
