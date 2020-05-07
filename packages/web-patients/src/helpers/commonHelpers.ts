const locationRoutesBlackList: string[] = [
  '/covid19',
  '/track-symptoms',
  '/terms',
  '/privacy',
  '/contact',
  '/my-account',
  '/health-records',
  '/address-book',
  '/aboutUs',
  '/appointments',
  '/faq'
];

const sortByProperty = (arr: any[], property: string) =>
  arr.sort((a, b) => parseFloat(a[property]) - parseFloat(b[property]));

export { sortByProperty, locationRoutesBlackList };
