import { getTime } from 'date-fns/esm';

export const getIstTimestamp = (today: Date, slotTime: string) => {
  const hhmm = slotTime.split(':');
  return getTime(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hhmm[0], 10),
      parseInt(hhmm[1], 10),
      0,
      0
    )
  );
};

export const getAppStoreLink = () => {
  return navigator.appVersion.indexOf('Mac') !== -1
    ? process.env.IOS_APP_LINK
    : process.env.ANDROID_APP_LINK;
};
