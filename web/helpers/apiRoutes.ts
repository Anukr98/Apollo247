const apiBaseUrl = () =>
  process.env.NODE_ENV === 'test' ? '' : `//localhost:${process.env.API_GATEWAY_PORT}`;

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};
