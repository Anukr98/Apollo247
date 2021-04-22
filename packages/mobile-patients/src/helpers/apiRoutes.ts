import { AppConfig, AppEnv } from '@aph/mobile-patients/src/strings/AppConfig';

export const apiBaseUrl =
  AppConfig.APP_ENV == AppEnv.PROD
    ? 'https://api.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.QA
    ? 'https://aph-staging-api.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.QA2
    ? 'https://qaapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.QA3
    ? 'https://qathreeapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.PERFORM
    ? 'https://perfapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.VAPT
    ? 'https://stagingapi.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.DEV
    ? 'https://aph-dev-api.apollo247.com/'
    : AppConfig.APP_ENV == AppEnv.DEVReplica
    ? 'https://devapi.apollo247.com/'
    : 'http://localhost:4000';

export const apiRoutes = {
  graphql: () => `${apiBaseUrl}/graphql`,
};
