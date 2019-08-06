declare global {
  interface Window {
    __TEST__: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'development' | 'staging' | 'production';
      USE_SSL: 'true' | 'false';
      WEB_PATIENTS_PORT: string;
      WEB_DOCTORS_PORT: string;
      API_GATEWAY_HOST: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
    }
  }
}

const client = 'aph';
const protocol = process.env.USE_SSL === 'true' ? 'https' : 'http';
const environment = process.env.NODE_ENV;

export const getPortStr = (port: string) => (port === '80' || port === '443' ? '' : `:${port}`);

export const apiBaseUrl = () => {
  const application = 'api';
  const port = getPortStr(process.env.API_GATEWAY_PORT);
  return `${protocol}://${client}.${environment}.${application}.popcornapps.com${port}`;
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};

export const webPatientsBaseUrl = () => {
  const application = 'web-patients';
  const port = getPortStr(process.env.WEB_PATIENTS_PORT);
  if (environment === 'local') return `${protocol}://localhost${port}`;
  return `${protocol}://${client}.${environment}.${application}.popcornapps.com${port}`;
};

export const webDoctorsBaseUrl = () => {
  const application = 'web-doctors';
  const port = getPortStr(process.env.WEB_DOCTORS_PORT);
  if (environment === 'local') return `${protocol}://localhost${port}`;
  return `${protocol}://${client}.${environment}.${application}.popcornapps.com${port}`;
};
