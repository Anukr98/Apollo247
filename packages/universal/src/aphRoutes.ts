const protocol = process.env.USE_SSL === 'true' ? 'https' : 'http';
const environment = process.env.NODE_ENV;

export const getPortStr = (port: string) => (port === '80' || port === '443' ? '' : `:${port}`);

export const apiBaseUrl = () => {
  const application = 'api';
  const port = getPortStr(process.env.API_GATEWAY_PORT);
  if (environment === 'local') return `${protocol}://localhost${port}`;
  return `${protocol}://aph.${environment}.${application}.popcornapps.com${port}`;
};

export const apiRoutes = {
  graphql: () => `${apiBaseUrl()}/graphql`,
};

export const webPatientsBaseUrl = () => {
  const application = 'web-patients';
  const port = getPortStr(process.env.WEB_PATIENTS_PORT);
  if (environment === 'local') return `${protocol}://localhost${port}`;
  return `${protocol}://aph.${environment}.${application}.popcornapps.com${port}`;
};

export const webDoctorsBaseUrl = () => {
  const application = 'web-doctors';
  const port = getPortStr(process.env.WEB_DOCTORS_PORT);
  if (environment === 'local') return `${protocol}://localhost${port}`;
  return `${protocol}://aph.${environment}.${application}.popcornapps.com${port}`;
};
