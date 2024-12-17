import axios from 'axios';

export var axiosInstanceTransport = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_TRANSPORT_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});
// import axios from 'axios';

// export const axiosInstanceTransport = (config: any) => {
//   return axios({
//     ...config,
//     baseURL: process.env.REACT_APP_API_LIS_TRANSPORT_ENDPOINT || 'https://default-api-url.com',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };
