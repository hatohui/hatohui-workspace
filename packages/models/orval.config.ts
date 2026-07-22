import { defineConfig } from 'orval';

export default defineConfig({
  hatohui: {
    input: {
      target: './openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated/client.ts',
      schemas: './src/generated/schemas',
      client: 'react-query',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './src/mutator/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
