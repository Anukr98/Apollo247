const apiBaseUrl = () => {
  const env = process.env.NODE_ENV;
  const port = process.env.API_GATEWAY_PORT === '80' ? '' : `:${process.env.API_GATEWAY_PORT}`;
  if (env === 'local') return `http://localhost${port}`;
  if (env === 'dev') return 'http://dev.api.aph.popcornapps.com'; // dev always runs on port 80 externally
  console.error('Invalid NODE_ENV environment variable configuration');
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};
