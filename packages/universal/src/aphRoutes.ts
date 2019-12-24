const environment = process.env.NODE_ENV;

export const getPortStr = (port: string) => (port === '80' || port === '443' ? '' : `:${port}`);

const buildUrl = ({ application, port }: { application: string; port: string }) => {
  const protocol = process.env.USE_SSL === 'false' ? 'http' : 'https';
  if (environment === 'production') return `${protocol}://${application}.apollo247.com`;
  if (environment === 'local') return `https://aph.dev.api.popcornapps.com/`;
  return `${protocol}://aph.${environment}.${application}.popcornapps.com${getPortStr(port)}`;
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
  const application = environment === 'production' ? 'www' : 'web-patients';
  const port = environment === 'local' ? process.env.WEB_PATIENTS_PORT : '80';
  return buildUrl({ application, port });
};

export const webDoctorsBaseUrl = () => {
  const application = environment === 'production' ? 'doctors' : 'web-doctors';
  const port = environment === 'local' ? process.env.WEB_DOCTORS_PORT : '80';
  return buildUrl({ application, port });
};
