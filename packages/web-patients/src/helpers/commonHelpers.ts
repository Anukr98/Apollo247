import { DEVICETYPE } from 'graphql/types/globalTypes';

declare global {
  interface Window {
    opera: any;
    vendor:any;
  }
}
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
  '/faq',
];

const sortByProperty = (arr: any[], property: string) =>
  arr.sort((a, b) => parseFloat(a[property]) - parseFloat(b[property]));

const getDeviceType = ()=>{
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if(!navigator || !navigator.userAgent) return 
  if(screen.width < 768 ){
    //mobile
    return /Android/i.test(userAgent) ? DEVICETYPE.ANDROID : (/iPhone/i.test(userAgent) ? DEVICETYPE.IOS : null);
  } else {
    return DEVICETYPE.DESKTOP
  }
}

export { sortByProperty, locationRoutesBlackList, getDeviceType };
