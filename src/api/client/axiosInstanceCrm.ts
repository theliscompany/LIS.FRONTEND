import axios from 'axios';

export var axiosInstanceCrm = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_CLIENT_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});
// import axios from 'axios';

// export const axiosInstanceCrm = (config: any) => {
//   return axios({
//     ...config,
//     baseURL: process.env.REACT_APP_API_LIS_CLIENT_ENDPOINT || 'https://default-api-url.com',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };
