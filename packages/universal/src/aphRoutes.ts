export const protocol = process.env.USE_SSL === 'true' ? 'https' : 'http';

const environment = process.env.NODE_ENV;

const buildUrl = ({ application, port }: { application: string; port: string }) =>
  environment === 'local'
    ? 'http://aph.development.api.popcornapps.com'
    : `${protocol}://aph.${environment}.${application}.popcornapps.com${getPortStr(port)}`;

export const getPortStr = (port: string) => (port === '80' || port === '443' ? '' : `:${port}`);

export const apiBaseUrl = () => {
  const application = 'api';
  const port = process.env.API_GATEWAY_PORT;
  return buildUrl({ application, port });
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};

export const webPatientsBaseUrl = () => {
  const application = 'web-patients';
  const port = process.env.WEB_PATIENTS_PORT;
  return buildUrl({ application, port });
};

export const webDoctorsBaseUrl = () => {
  const application = 'web-doctors';
  const port = process.env.WEB_DOCTORS_PORT;
  return buildUrl({ application, port });
};
