const apiBaseUrl = `//localhost:${process.env.API_PORT}`;

export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
