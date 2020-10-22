//PHR Consult & RX
declare global {
  interface Window {
    webengage: any;
  }
}
interface UserDetail {
  emailAddress: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
}

window.webengage = window.webengage || {};

export const webengageUserDetailTracking = (userDetailData: UserDetail) => {
  const { emailAddress, mobileNumber, firstName, lastName } = userDetailData;
  if (typeof window !== 'undefined') {
    try {
      mobileNumber && mobileNumber !== '' ? window.webengage.user.setAttribute('we_phone', mobileNumber) : null;
      firstName && firstName !== '' ? window.webengage.user.setAttribute('we_first_name', firstName) : null;
      lastName && lastName !== '' ? window.webengage.user.setAttribute('we_last_name', lastName) : null;
      emailAddress && emailAddress !== '' ? window.webengage.user.setAttribute('we_email', emailAddress) : null;
    } catch (err) {
      console.log('Webengage user tracking err: ', err);
    }
  }
};
export const webengageUserLoginTracking = (id: string) => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.user.login(id);
    } catch (err) {
      console.log('Webengage user login tracking err: ', err);
    }
  }
};

export const webengageUserLogoutTracking = () => {
  if (typeof window !== 'undefined') {
    try {
      window.webengage.user.logout();
    } catch (err) {
      console.log('Webengage user logout tracking err: ', err);
    }
  }
};
export const webEngageEventTracking = (informationTrackData: any, webengageEventName: string) => {
  if (typeof window !== 'undefined') {
    try {
      console.log(informationTrackData && informationTrackData !== null ? informationTrackData : 'nodata', webengageEventName);
      informationTrackData && informationTrackData !== null ? window.webengage.track(webengageEventName, informationTrackData) : window.webengage.track(webengageEventName);
    } catch (err) {
      console.log('WebEngage Err: ', err);
    }
  }
};
