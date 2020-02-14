// export const apiBaseUrl = 'http://localhost:4000';
// export const apiBaseUrl = 'https://aph.dev.api.popcornapps.com/'; //Development
//export const apiBaseUrl = 'https://aph.staging.api.popcornapps.com/'; // QA
//export const apiBaseUrl = 'https://aph.uat.api.popcornapps.com/'; // UAT
// export const apiBaseUrl = 'https://aph.vapt.api.popcornapps.com/'; // VAPT
export const apiBaseUrl = 'https://api.apollo247.com/'; // Production
// export const apiBaseUrl = 'https://asapi.apollo247.com/'; // Performance Url

// export const apiBaseUrl = 'http://52.172.8.84:5000/'; // Performace Testing Url
export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
