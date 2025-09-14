import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts"


export default defineConfig({
    input: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json',
    output: '@features/shipment/api',
    client: '@hey-api/client-axios',
    plugins: [
      ...defaultPlugins,
      '@tanstack/react-query',
      {
        name: "@hey-api/transformers",
        dates: true
      },
      {
        name: "@hey-api/typescript",
        enums: "typescript"
      }
    ],
  })