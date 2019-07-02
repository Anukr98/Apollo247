export const clientBaseUrl = `http://localhost:${process.env.WEB_CLIENT_PORT}`;

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  consultRoom: () => '#',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
};
