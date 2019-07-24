declare global {
  interface Window {
    __TEST__: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'dev';
      WEB_PATIENTS_PORT: string;
      WEB_DOCTORS_PORT: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
      TEST: string;
    }
  }
}

export const getPortStr = (port: string) => (port === '80' ? '' : `:${port}`);

export const apiBaseUrl = () => {
  const envToUrl: Record<NodeJS.ProcessEnv['NODE_ENV'], string> = {
    local: `http://localhost${getPortStr(process.env.API_GATEWAY_PORT)}`,
    dev: 'http://dev.api.aph.popcornapps.com',
  };
  return envToUrl[process.env.NODE_ENV];
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};

export const webPatientsBaseUrl = () => {
  const envToUrl: Record<NodeJS.ProcessEnv['NODE_ENV'], string> = {
    local: `http://localhost${getPortStr(process.env.WEB_PATIENTS_PORT)}`,
    dev: 'http://dev.web-patients.aph.popcornapps.com',
  };
  return envToUrl[process.env.NODE_ENV];
};

export const webDoctorsBaseUrl = () => {
  const envToUrl: Record<NodeJS.ProcessEnv['NODE_ENV'], string> = {
    local: `http://localhost${getPortStr(process.env.WEB_DOCTORS_PORT)}`,
    dev: 'http://dev.web-doctors.aph.popcornapps.com',
  };
  return envToUrl[process.env.NODE_ENV];
};
