import { getUuidV4 } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import moment from 'moment';
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { TagalysProduct, MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';

export const getTagalysConfig = (userId: string) => buildTagalysConfig(userId);
export const setTagalysConfig = (_tagalysConfig: Tagalys.RootObject | null) => {
  tagalysConfig = _tagalysConfig;
};
export const tagalysResponseFormatter = ({
  __id,
  image_url,
  in_stock,
  is_prescription_required,
  name,
  price,
  sale_price,
  sell_online,
  sku,
}: TagalysProduct): MedicineProduct => ({
  category_id: '', // TODO: Field not present in Tagalys
  description: '',
  id: Number(__id),
  image: image_url,
  is_in_stock: in_stock ? 1 : 0,
  is_prescription_required: is_prescription_required ? 1 : 0,
  MaxOrderQty: 3, // TODO: Field not present in Tagalys
  mou: '1', // TODO: Field not present in Tagalys
  name: name,
  price: price,
  sku: sku,
  small_image: '',
  special_price: price === sale_price ? '' : sale_price,
  status: (sell_online || []).indexOf('enable') > -1 ? 1 : 0,
  thumbnail: image_url,
  type_id: 'Pharma', // TODO: Field not present in Tagalys
  url_key: '',
});

let tagalysConfig: Tagalys.RootObject | null = null;
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

const buildTagalysConfig = (userId: string): Tagalys.RootObject => {
  if (tagalysConfig) {
    return tagalysConfig;
  } else {
    return {
      identification: {
        client_code: TAGALYS_CLIENT_CODE,
        api_key: TAGALYS_API_KEY,
        // store_id: '', // TOOD: Get it from the PM
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

declare module Tagalys {
  export interface Os {
    name: string;
  }

  export interface Browser {
    name: string;
    version: string;
  }

  export interface ScreenResolution {
    width: number;
    height: number;
  }

  export interface DeviceInfo {
    device_type: string;
    os: Os;
    browser: Browser;
    screen_resolution: ScreenResolution;
  }

  export interface User {
    device_id: string;
    visit_id: string;
    user_id: string;
  }

  export interface Identification {
    client_code: string;
    api_key: string;
    store_id: string;
    user: User;
  }

  export interface RootObject {
    device_info: DeviceInfo;
    identification: Identification;
  }
}
