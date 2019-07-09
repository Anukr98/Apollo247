export const clientBaseUrl = () => {
  const env = process.env.NODE_ENV;
  const port = process.env.WEB_CLIENT_PORT === '80' ? '' : `:${process.env.WEB_CLIENT_PORT}`;
  if (env === 'test') return `localhost${port}`;
  if (env === 'local') return `//localhost${port}`;
  if (env === 'development') return `//patients-web.aph.popcornapps.com${port}`;
  console.error('Invalid NODE_ENV environment variable configuration');
};

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  consultRoom: () => '#',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
};
