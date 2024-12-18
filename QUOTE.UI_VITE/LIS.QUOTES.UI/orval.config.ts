module.exports = {
  shipmentService:{
    output: {
      target: './src/api/client/shipmentService.ts', // Fichier pour l'API Service 1
      schemas: './src/api/client/schemas/shipment', // Schémas pour Service 1
      client: 'axios', // Utilisation de client Axios
      override: {
        mutator: {
          path: './src/api/client/shipmentInstance.ts', // Fichier pour configurer l'instance Axios
          name: 'shipmentInstance',
        },
      },
    },
    input: {
      target: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json', // Fichier OpenAPI de Service 1
    },
  }
}