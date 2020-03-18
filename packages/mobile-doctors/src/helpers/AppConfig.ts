export enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  PROD = 'PROD',
  PERFORM = 'PERFORM',
  VAPT = 'VAPT',
}

const APP_ENV: AppEnv = AppEnv.DEV as AppEnv; //Change to AppEnv.(DEV, QA, PROD) for respective API environments in the app. Also don't forget to change src/helpers/apiRoutes.ts

//Development;
const ConfigurationDev = {
  LOG_ENVIRONMENT: 'debug',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  BUGSNAG_KEY: 'd41528059b46a59724b9ec07a7225360', //'7839e425f4acbd8e6ff3f907281addca',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  PRO_TOKBOX_KEY: '46429002',
  iOS_Version: '1.007',
  Android_Version: '1.007',
};
//QA
const ConfigurationQA = {
  LOG_ENVIRONMENT: 'release',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  BUGSNAG_KEY: 'd41528059b46a59724b9ec07a7225360', //'7839e425f4acbd8e6ff3f907281addca',
  DOCUMENT_BASE_URL: 'https://apolloaphstorage.blob.core.windows.net/popaphstorage/popaphstorage/',
  PRO_TOKBOX_KEY: '46429002',
  iOS_Version: '1.004',
  Android_Version: '1.004',
};
//Prod
const ConfigurationProd = {
  LOG_ENVIRONMENT: 'release',
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
  BUGSNAG_KEY: 'd41528059b46a59724b9ec07a7225360', //'7839e425f4acbd8e6ff3f907281addca',
  DOCUMENT_BASE_URL: 'https://prodaphstorage.blob.core.windows.net/prodaphstorage/prodaphstorage/',
  PRO_TOKBOX_KEY: '46422952', // PRODUCTION
  iOS_Version: '1.0',
  Android_Version: '1.0',
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
