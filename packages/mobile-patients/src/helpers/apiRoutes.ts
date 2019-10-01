// export const apiBaseUrl = 'http://localhost:4000';
// export const apiBaseUrl = 'https://aph.dev.api.popcornapps.com/'; //Development
export const apiBaseUrl = 'https://aph.staging.api.popcornapps.com/'; // QA
//export const apiBaseUrl = 'https://aph.uat.api.popcornapps.com/'; // UAT
// export const apiBaseUrl = 'https://aph.vapt.api.popcornapps.com/'; // VAPT
// export const apiBaseUrl = 'https://api.apollo247.com/'; // Production

export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
