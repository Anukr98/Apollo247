import { AppConfig, AppEnv } from '@aph/mobile-patients/src/strings/AppConfig';

export const apiBaseUrl =
  AppConfig.APP_ENV == AppEnv.PROD
    ? 'https://api.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.QA
    ? 'https://aph.staging.api.popcornapps.com/'
    : AppConfig.APP_ENV == AppEnv.STAGING
    ? 'https://stagingapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.PERFORM
    ? 'https://asapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.VAPT
    ? 'https://aph.vapt.api.popcornapps.com/'
    : AppConfig.APP_ENV == AppEnv.DEV
    ? 'https://aph.dev.api.popcornapps.com/'
    : AppConfig.APP_ENV == AppEnv.DEVReplica
    ? 'https://devapi.apollo247.com/'
    : 'http://localhost:4000';

// export const apiBaseUrl = 'http://localhost:4000';
// export const apiBaseUrl = 'https://aph.dev.api.popcornapps.com/'; //Development
// export const apiBaseUrl = 'https://aph.staging.api.popcornapps.com/'; // QA
// export const apiBaseUrl = 'https://aph.uat.api.popcornapps.com/'; // UAT
// export const apiBaseUrl = 'https://aph.vapt.api.popcornapps.com/'; // VAPT
// export const apiBaseUrl = 'https://api.apollo247.com/'; // Production
// export const apiBaseUrl = 'https://asapi.apollo247.com/'; // Performance Url
// export const apiBaseUrl = 'https://devapi.apollo247.com/'; //Development replica

// export const apiBaseUrl = 'http://52.172.8.84:5000/'; // Performace Testing Url
export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
