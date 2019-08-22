const environment = process.env.NODE_ENV;

const buildUrl = ({ application, port }: { application: string; port: string }) => {
  const protocol = process.env.USE_SSL === 'false' ? 'http' : 'https';
  const portStr = port === '80' || port === '443' ? '' : `:${port}`;
  return environment === 'local'
    ? `${protocol}://localhost${portStr}`
    : `${protocol}://aph.${environment}.${application}.popcornapps.com${portStr}`;
};

export const apiBaseUrl = () => {
  const application = 'api';
  const port = environment === 'local' ? process.env.API_GATEWAY_PORT : '80';
  return buildUrl({ application, port });
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};

export const webPatientsBaseUrl = () => {
  const application = 'web-patients';
  const port = environment === 'local' ? process.env.WEB_PATIENTS_PORT : '80';
  return buildUrl({ application, port });
};

export const webDoctorsBaseUrl = () => {
  const application = 'web-doctors';
  const port = environment === 'local' ? process.env.WEB_DOCTORS_PORT : '80';
  return buildUrl({ application, port });
};
