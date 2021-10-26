import AsyncStorage from '@react-native-community/async-storage';
import { reject } from 'lodash';

export const setItem = (key: string, value: any, expiry?: number) => {
  const expireInMinutes = !!expiry ? expiry : 60;
  //set expire at
  value.expireAt = getExpireDate(expireInMinutes);
  //stringify object
  const objectToStore = JSON.stringify(value);
  //store object
  AsyncStorage.setItem(key, objectToStore);
};

export const getItem = async (key: string) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key).then((value: any) => {
      let data = JSON.parse(value);
      // there is data in cache && cache is expired
      if (data !== null && data['expireAt'] && new Date(data.expireAt) < new Date()) {
        //clear cache
        AsyncStorage.removeItem(key);
        //update res to be null
        data = null;

        resolve(null);
      } else {
        resolve(data);
      }
    });
  }).catch((error) => {
    reject(error);
  });
};

/**
 *
 * @param expireInMinutes
 * @returns {Date}
 */
const getExpireDate = (expireInMinutes: number) => {
  const now = new Date();
  let expireTime = new Date(now);
  expireTime.setMinutes(now.getMinutes() + expireInMinutes);
  return expireTime;
};
