export enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  PROD = 'PROD',
  PERFORM = 'PERFORM',
  VAPT = 'VAPT',
}

export const updateAppConfig = (key: keyof typeof Configuration, value: object) => {
  Configuration[key] = value as never;
};

const APP_ENV: AppEnv = AppEnv.DEV as AppEnv; //Change to AppEnv.(DEV, QA, PROD) for respective API environments in the app. Also don't forget to change src/helpers/apiRoutes.ts
//Common keys
const commonConfigs = {
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  BUGSNAG_KEY: 'd41528059b46a59724b9ec07a7225360', //'7839e425f4acbd8e6ff3f907281addca',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  PRO_TOKBOX_KEY: '46429002',
  CHAT_ENCRYPTION_KEY: 'z2iQxQAuyLC0j2GNryyZ2JuGLTQyT0mK',
  APOLLO_BASE_URL: 'https://www.apollopharmacy.in',
  APOLLO_AUTH_TOKEN: 'Bearer 2o1kd4bjapqifpb27fy7tnbivu8bqo1d',
};

//Development;
const ConfigurationDev = {
  ...commonConfigs,
  LOG_ENVIRONMENT: 'debug',
  iOS_Version: '1.002',
  Android_Version: '1.002',
};

//QA
const ConfigurationQA = {
  ...commonConfigs,
  LOG_ENVIRONMENT: 'release',
  iOS_Version: '1.0015',
  Android_Version: '1.0015',
};

//Prod
const ConfigurationProd = {
  ...commonConfigs,
  LOG_ENVIRONMENT: 'release',
  DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/',
  PRO_TOKBOX_KEY: '46422952', // PRODUCTION
  PRO_PUBNUB_PUBLISH: 'pub-c-e275fde3-09e1-44dd-bc32-5c3d04c3b2ef', // PRODUCTION
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-517dafbc-d955-11e9-aa3a-6edd521294c5', // PRODUCTION
  iOS_Version: '1.000',
  Android_Version: '1.000',
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
    : ConfigurationDev;

export const AppConfig = {
  Configuration,
  APP_ENV,
};
