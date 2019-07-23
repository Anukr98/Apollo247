export const clientBaseUrl = () => {
  const env = process.env.NODE_ENV;
  const port = process.env.WEB_PATIENTS_PORT === '80' ? '' : `:${process.env.WEB_PATIENTS_PORT}`;
  if (env === 'local') return `http://localhost${port}`;
  if (env === 'dev') return `http://web-patients.aph.popcornapps.com${port}`;
  console.error('Invalid NODE_ENV environment variable configuration');
};

export const clientRoutes = {
  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
  consultRoom: () => '#',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  patients: () => '/patients',
};
