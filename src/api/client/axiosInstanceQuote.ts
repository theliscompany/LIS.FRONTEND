import axios from 'axios';

export var axiosInstanceQuote = axios.create({
  baseURL: process.env.REACT_APP_API_LIS_QUOTES_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});
// import axios from 'axios';

// export const axiosInstanceQuote = (config: any) => {
//   return axios({
//     ...config,
//     baseURL: process.env.REACT_APP_API_LIS_QUOTES_ENDPOINT || 'https://default-api-url.com',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// };
