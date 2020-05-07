export const gtmTracking = (gtmObj: any) => {
  const { category, action, label, value } = gtmObj;
  try {
    window && window.gep && window.gep(category, action, label, value);
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};

export const _urTracking = (params: any) => {
  const { mobileNumber, isApolloCustomer, profileFetchedCount } = params;
  try {
    window && window._ur && window._ur(mobileNumber, isApolloCustomer, profileFetchedCount);
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};

// export const _cbTracking = (params: any) => {
//     const { mobileNumber,
//         specialty,
//         userLocation,
//         doctorLocation,
//         bookingType,
//         scheduledDate,
//         couponCode,
//         couponValue,
//         finalBookingValue } = params;
//     try {
//         window && window._cb && window._cb(mobileNumber,
//             specialty,
//             userLocation,
//             doctorLocation,
//             bookingType,
//             scheduledDate,
//             couponCode,
//             couponValue,
//             finalBookingValue)
//     } catch (err) {
//         console.log('GTM ERROR: ', err)
//     }
// }
export const _obTracking = (params: any) => {
  const {
    mobileNumber,
    userLocation,
    paymentType,
    itemCount,
    couponCode,
    couponValue,
    finalBookingValue,
  } = params;
  try {
    window &&
      window._ob &&
      window._ob(
        mobileNumber,
        userLocation,
        paymentType,
        itemCount,
        couponCode,
        couponValue,
        finalBookingValue
      );
  } catch (err) {
    console.log('GTM ERROR: ', err);
  }
};
