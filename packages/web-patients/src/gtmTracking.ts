interface GtmObj {
  category: string;
  action: string;
  label: string;
  value?: any;
  ecommObj?: any;
}
export const gtmTracking = (gtmObj: GtmObj) => {
  const { category, action, label, value, ecommObj } = gtmObj;
  try {
    window && window.gep && window.gep(category, action, label, value, ecommObj);
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};
export const _urTracking = (params: any) => {
  const { userId, isApolloCustomer, profileFetchedCount } = params;
  try {
    window && window._ur && window._ur(userId, isApolloCustomer, profileFetchedCount);
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};

export const _cbTracking = (params: any) => {
  const {
    specialty,
    bookingType,
    scheduledDate,
    couponCode,
    couponValue,
    finalBookingValue,
    ecommObj,
  } = params;
  try {
    window &&
      window._cb &&
      window._cb(
        specialty,
        bookingType,
        scheduledDate,
        couponCode,
        couponValue,
        finalBookingValue,
        ecommObj
      );
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};

export const _obTracking = (params: any) => {
  const {
    userLocation,
    paymentType,
    itemCount,
    couponCode,
    couponValue,
    finalBookingValue,
    ecommObj,
  } = params;
  try {
    window &&
      window._ob &&
      window._ob(
        userLocation,
        paymentType,
        itemCount,
        couponCode,
        couponValue,
        finalBookingValue,
        ecommObj
      );
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};

export const dataLayerTracking = (obj: any) => {
  try {
    window && window.dataLayer && window.dataLayer.push(obj);
  } catch (err) {
    console.log('GTM DATALAYER ERROR: ', err);
  }
};
