const apiBaseUrl = `//localhost:${process.env.API_GATEWAY_PORT}`;

export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
