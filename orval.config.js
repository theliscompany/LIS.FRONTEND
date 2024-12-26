module.exports = {
  shipmentService: {
    output: {
      target: './src/api/client/shipmentService.ts', // Fichier pour l'API Service 1
      schemas: './src/api/client/schemas/shipment', // Schémas pour Service 1
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/axiosInstanceShipment.ts', // Fichier pour configurer l'instance Axios
          name: 'axiosInstanceShipment',
        },
      },
    },
    input: {
      target: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 1
    },
  },
  transportService: {
    output: {
      target: './src/api/client/transportService.ts', // Fichier pour l'API Service 1
      schemas: './src/api/client/schemas/transport', // Schémas pour Service 1
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/axiosInstanceTransport.ts', // Fichier pour configurer l'instance Axios
          name: 'axiosInstanceTransport',
        },
      },
    },
    input: {
      target: 'https://lis-transport-svc-dev.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 1
    }
  },
  crmService: {
    output: {
      target: './src/api/client/crmService.ts', // Fichier pour l'API Service 3
      schemas: './src/api/client/schemas/crm', // Schémas pour Service 3
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/axiosInstanceCrm.ts', // Fichier pour configurer l'instance Axios
          name: 'axiosInstanceCrm',
        },
      },
    },
    input: {
      target: 'https://lis-crm-svc-dev.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 3
    },
  },
  quoteService: {
    output: {
      target: './src/api/client/quoteService.ts', // Fichier pour l'API Service 3
      schemas: './src/api/client/schemas/quote', // Schémas pour Service 3
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/axiosInstanceQuote.ts', // Fichier pour configurer l'instance Axios
          name: 'axiosInstanceQuote',
        },
      },
    },
    input: {
      target: 'https://lis-quotes-svc-dev.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 3
    },
  },
  pricingService: {
    output: {
      target: './src/api/client/pricingService.ts', // Fichier pour l'API Service 3
      schemas: './src/api/client/schemas/pricing', // Schémas pour Service 3
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/axiosInstancePricing.ts', // Fichier pour configurer l'instance Axios
          name: 'axiosInstancePricing',
        },
      },
    },
    input: {
      target: 'https://lis-pricing-svc-dev.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 3
    },
  },
};
// module.exports = {
//   shipmentService: {
//     output: {
//       target: './src/api/client/shipmentService.ts',
//       client: 'axios',
//     },
//     input: {
//       target: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json',
//     },
//   },
// };

// const path = require('path');

// module.exports = {
//   shipmentService: {
//     output: {
//       target: './src/api/client/shipmentService.ts',
//       client: 'axios',
//       override: {
//         mutator: {
//           path: path.resolve(__dirname, './src/api/client/axiosInstanceShipment.ts'),
//           name: 'axiosInstanceShipment',
//         },
//       },
//     },
//     input: {
//       target: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json',
//     },
//   },
// };
