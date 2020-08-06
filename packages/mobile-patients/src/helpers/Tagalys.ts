import { getUuidV4 } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import moment from 'moment';
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const getTagalysConfig = (userId: string) => buildTagalysConfig(userId);
export const setTagalysConfig = (_tagalysConfig: Tagalys.Config | null) => {
  tagalysConfig = _tagalysConfig;
};

let tagalysConfig: Tagalys.Config | null = null;
let visit_info: { id: string; timestamp: number } | null = null;
const { width, height } = Dimensions.get('screen');
const { TAGALYS_API_KEY, TAGALYS_CLIENT_CODE } = AppConfig.Configuration;

const generateVisitId = (): Tagalys.User['visit_id'] => {
  if (visit_info) {
    const isGeneratedWithin30Minutes =
      visit_info && moment().diff(moment(visit_info.timestamp), 'minutes') > 30;
    if (isGeneratedWithin30Minutes) {
      return visit_info.id;
    } else {
      visit_info = { id: getUuidV4().replace(/-/g, ''), timestamp: new Date().getTime() };
      return visit_info.id;
    }
  } else {
    visit_info = { id: getUuidV4().replace(/-/g, ''), timestamp: new Date().getTime() };
    return visit_info.id;
  }
};

const buildTagalysConfig = (userId: string): Tagalys.Config => {
  if (tagalysConfig) {
    return tagalysConfig;
  } else {
    return {
      identification: {
        client_code: TAGALYS_CLIENT_CODE,
        api_key: TAGALYS_API_KEY,
        store_id: '1',
        user: {
          device_id: DeviceInfo.getUniqueId(),
          visit_id: generateVisitId(),
          user_id: userId,
        },
      },
      device_info: {
        device_type: DeviceInfo.isTablet() ? 'tablet' : 'mobile',
        os: {
          name: Platform.OS == 'android' ? 'android' : 'ios',
        },
        browser: {
          name: DeviceInfo.getApplicationName(), // await DeviceInfo.getDeviceName(),
          version: DeviceInfo.getVersion(),
        },
        screen_resolution: { width, height },
      },
    };
  }
};

export declare module Tagalys {
  export interface Config {
    device_info: DeviceInfo;
    identification: Identification;
  }

  interface DeviceInfo {
    device_type: string;
    os: Os;
    browser: Browser;
    screen_resolution: ScreenResolution;
  }

  interface Os {
    name: string;
  }

  interface Browser {
    name: string;
    version: string;
  }

  interface ScreenResolution {
    width: number;
    height: number;
  }

  interface Identification {
    client_code: string;
    api_key: string;
    store_id: string;
    user: User;
  }

  interface User {
    device_id: string;
    visit_id: string;
    user_id: string;
  }

  export interface Event {
    event_type: 'product_action' | 'product_list';
    details: ProductAction | ProductList;
  }

  interface ProductAction {
    sku: string;
    action: 'view' | 'add_to_cart' | 'buy';
    quantity?: number; // For add_to_cart and buy
    order_id?: string; // For buy
  }

  interface ProductList {
    pl_type: 'search' | 'mpage';
    pl_details: {
      q: string;
    };
    pl_products: string[]; // SKU List
    pl_page: number;
    pl_total: number;
    pl_sort?: string;
  }
}
