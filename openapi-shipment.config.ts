import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts"


export default defineConfig({
  input: 'https://lis-shipment-svc-staging.azurewebsites.net/swagger/v1/swagger.json',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: '@features/shipment/api' 
  },
  client: '@hey-api/client-axios',
  plugins: [
    ...defaultPlugins,
    '@tanstack/react-query',
    "@hey-api/transformers",
    {
      name: "@hey-api/schemas",
      type: 'json'
    },
    {
      name: "@hey-api/typescript",
      enums: "typescript"
    },
    {
      name: "@hey-api/sdk",
      asClass: true
    }
  ],
})