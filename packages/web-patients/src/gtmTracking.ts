export const gtmTracking = (gtmObj: any) => {
    const { category, action, label, value } = gtmObj
    try {
        window && window.gep && window.gep(category, action, label, value);
    } catch (err) {
        console.log('GTM ERROR: ', err)
    }
}

export const _urTracking = (params: any) => {
    const { userId,
        isApolloCustomer,
        profileFetchedCount } = params;
    try {
        window && window._ur && window._ur(
            userId,
            isApolloCustomer,
            profileFetchedCount)
    } catch (err) {
        console.log('GTM ERROR: ', err)
    }
}

export const _cbTracking = (params: any) => {
    const { specialty,
        bookingType,
        scheduledDate,
        couponCode,
        couponValue,
        finalBookingValue,
    } = params;
    try {
        window && window._cb && window._cb(specialty,
            bookingType,
            scheduledDate,
            couponCode,
            couponValue,
            finalBookingValue)
    } catch (err) {
        console.log('GTM ERROR: ', err)
    }
}

export const _obTracking = (params: any) => {
    const {
        userLocation,
        paymentType,
        itemCount,
        couponCode,
        couponValue,
        finalBookingValue
    } = params;
    try {
        window && window._ob && window._ob(
            userLocation,
            paymentType,
            itemCount,
            couponCode,
            couponValue,
            finalBookingValue)
    } catch (err) {
        console.log('GTM ERROR: ', err)
    }
}