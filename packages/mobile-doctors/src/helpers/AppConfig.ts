enum AppEnv {
  DEV = 'DEV',
  QA = 'QA',
  PROD = 'PROD',
}

const APP_ENV: AppEnv = AppEnv.QA as AppEnv; //Change to AppEnv.(DEV, QA, PROD) for respective API environments in the app. Also don't forget to change src/helpers/apiRoutes.ts

//Development;
const ConfigurationDev = {
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
};
//QA
const ConfigurationQA = {
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
};
//Prod
const ConfigurationProd = {
  PRO_PUBNUB_PUBLISH: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
  PRO_PUBNUB_SUBSCRIBER: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b',
};

const Configuration =
  APP_ENV == AppEnv.PROD
    ? ConfigurationProd
    : APP_ENV == AppEnv.QA
    ? ConfigurationQA
    : ConfigurationDev;

export const AppConfig = {
  Configuration,
};
