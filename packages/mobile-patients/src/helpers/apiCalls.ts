import Axios, { AxiosResponse, Canceler } from 'axios';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface MedicineProduct {
  description: string;
  id: number;
  category_id: string;
  image: string | null;
  is_in_stock: boolean;
  is_prescription_required: '0' | '1'; //1 for required
  name: string;
  price: number;
  special_price: number | string;
  sku: string;
  small_image?: string | null;
  status: number;
  thumbnail: string | null;
  type_id: 'Fmcg' | 'Pharma';
  mou: string;
  manufacturer: string;
  PharmaOverview: PharmaOverview[];
}

export type Doseform = 'TABLET' | 'INJECTION' | 'SYRUP' | '';

interface PharmaOverview {
  generic: string;
  Doseform: Doseform;
  Unit: string;
  Strength: string;
  Strengh: string;
  Overview:
    | {
        Caption: string;
        CaptionDesc: string;
      }[]
    | string;
}

export interface MedicineProductDetails extends MedicineProduct {
  PharmaOverview: PharmaOverview[];
}

export interface MedicineProductDetailsResponse {
  productdp: MedicineProductDetails[];
  message?: string;
}

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
}

export interface Brand {
  category_id: string;
  image_url: number;
  title: string;
}

export interface BrandsResponse {
  count: number;
  brands: Brand[];
}

export interface Store {
  storeid: string;
  storename: string;
  address: string;
  workinghrs: string;
  phone: string;
  city: string;
  state: string;
  message: string;
}

export interface Clinic {
  CentreType: string;
  CentreCode: string;
  CentreName: string;
  MobileNo: string;
  BusinessZone: string;
  State: string;
  City: string;
  Zone: string;
  Locality: string;
  IsNabl: boolean;
  IsCap: boolean;
}

export interface ClinicDetailsResponse {
  Message: string;
  Status: boolean;
  data: Clinic[];
}

export interface GetDeliveryTimeResponse {
  tat: {
    artCode: string;
    deliverydate: string;
    siteId: string;
  }[];
  errorMSG?: string;
}
interface InventoryCheckApiResponse {
  InvChkResult: {
    Message: string; //"Data Founds" | "Authentication Failure-Invalid Token" | "No Items to Check Inventory"
    Status: boolean;
    item:
      | {
          artCode: string;
          batch: string;
          expDate: string; //'2024-05-30 00:00:00.0'
          mrp: number;
          qoh: number;
        }[]
      | null;
  };
}

export type GooglePlacesType =
  | 'route'
  | 'sublocality_level_2'
  | 'sublocality_level_1'
  | 'postal_code'
  | 'locality'
  | 'administrative_area_level_2'
  | 'administrative_area_level_1'
  | 'country';

export interface PlaceByIdApiResponse {
  result: PlacesApiResponse['results'][0];
}

export interface PlacesApiResponse {
  results: {
    address_components: {
      long_name: string;
      short_name: string;
      types: GooglePlacesType[];
    }[];
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
  }[];
}

// MedicineLandingPageAPi
interface MedicinePageSection {
  category_id: string;
  title: string;
  image_url: string;
}
interface DealsOfTheDaySection {
  category_id: string;
  image_url: string;
  position: number;
}
interface OfferBannerSection {
  name: string;
  status: '0' | '1';
  image: string; // full url
  start_time: string; // '2019-02-10 01:21:00';
  end_time: string;
}

export interface MedicinePageAPiResponse {
  mainbanners: OfferBannerSection[];
  healthareas: MedicinePageSection[];
  deals_of_the_day: DealsOfTheDaySection[];
  shop_by_category: MedicinePageSection[];
  shop_by_brand: MedicinePageSection[];
  hot_sellers?: { products: MedicineProduct[] };
}

export interface PackageInclusion {
  TestInclusion: string;
  SampleRemarks: string;
  SampleTypeName: string;
  TestParameters: string;
  TestName?: string; // getting TestInclusion value in TestName from API
}

export interface TestPackage {
  ItemID: string;
  ItemCode: string;
  ItemName: string;
  ItemAliasName: string;
  Rate: number;
  LabName: string;
  LabCode: string;
  Panel_ID: number;
  FromAgeInDays: number;
  ToAgeInDays: number;
  Gender: string;
  PackageInClussion: PackageInclusion[];
}

export interface TestsPackageResponse {
  status: boolean;
  message: string;
  data: TestPackage[];
}

export interface GetPackageDataResponse {
  status: boolean;
  message: string;
  data: PackageInclusion[];
}

export interface NotificationResponse {
  data: { data: [] };
}
/*
type CityOptions =
  | 'hyderabad'
  | 'bengaluru'
  | 'chennai'
  | 'delhi'
  | 'kolkata'
  | 'mumbai'
  | 'vijaywada'
  | 'ahmedabad'
  | 'all';

export interface CartItem extends Partial<MedicineProduct> {
  item_id: number;
  sku: string;
  qty: number;
  product_type: string;
  quote_id: string;
  extension_attributes: {
    image_url: string;
  };
}

export interface Customer {
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface BillingAddress {
  id: number;
  region?: unknown;
  region_id?: unknown;
  region_code?: unknown;
  country_id?: unknown;
  street: string[];
  telephone?: unknown;
  postcode?: unknown;
  city?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  same_as_billing: number;
  save_in_address_book: number;
}

export interface Currency {
  global_currency_code: string;
  base_currency_code: string;
  store_currency_code: string;
  quote_currency_code: string;
  store_to_base_rate: number;
  store_to_quote_rate: number;
  base_to_global_rate: number;
  base_to_quote_rate: number;
}

export interface ExtensionAttributes {
  shipping_assignments: unknown[];
}

export interface CartInfoResponse {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_virtual: boolean;
  items: CartItem[];
  items_count: number;
  items_qty: number;
  customer: Customer;
  billing_address: BillingAddress;
  orig_order_id: number;
  currency: Currency;
  customer_is_guest: boolean;
  customer_note_notify: boolean;
  customer_tax_class_id: number;
  store_id: number;
  extension_attributes: ExtensionAttributes;
  grand_total: number;
}
*/

// 9f15bdd0fcd5423190c2e877ba0228A24
// const AUTH_TOKEN = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';

/*
export const getQuoteId = async () =>
  (await AsyncStorage.getItem('QUOTE_ID')) || (await generateAndSaveQuoteId()); // in-progress, need to optimize

const getCartId = async () =>
  (await AsyncStorage.getItem('CART_ID')) || (await generateAndSaveCartId()); // in-progress, need to optimize

let CART_INFO: CartInfoResponse | null = null;

export const setLocalCartInfo = (cartInfo: CartInfoResponse | null) => {
  CART_INFO = cartInfo;
};

export const getCartInfo = async () => {
  if (CART_INFO) {
    return CART_INFO;
  } else {
    const cartInfo = (await getCartInfoApi()).data;
    await AsyncStorage.setItem('CART_ID', cartInfo.id.toString()); //optimize the flow later
    CART_INFO = cartInfo;
    return CART_INFO;
  }
};

export const generateAndSaveQuoteId = async (): Promise<string> => {
  const quoteId = (await generateQuoteIdApi()).data.quote_id;
  await AsyncStorage.setItem('QUOTE_ID', quoteId);
  return quoteId;
};

export const generateAndSaveCartId = async (): Promise<number> => {
  const cartId = (await getCartInfoApi()).data.id;
  await AsyncStorage.setItem('CART_ID', cartId.toString());
  return cartId;
};

export const generateQuoteIdApi = (): Promise<AxiosResponse<{ quote_id: string }>> => {
  return Axios.get(`http://api.apollopharmacy.in/apollo_api.php?type=guest_quote`);
};

export const getCartInfoApi = async (): Promise<AxiosResponse<CartInfoResponse>> => {
  return Axios.get(
    `http://api.apollopharmacy.in/apollo_api.php?type=guest_quote_info&quote_id=${await getQuoteId()}`
  );
};

export const addProductToCartApi = async (
  productSku: string,
  quantity: number = 1
): Promise<AxiosResponse<CartItem>> => {
  const cartId = await getCartId();
  const quoteId = await getQuoteId();

  console.log({ cartId, quoteId });

  return Axios.post(`http://api.apollopharmacy.in/rest/V1/guest-carts/${cartId}/items`, {
    cartItem: { quote_id: quoteId, sku: productSku, qty: quantity },
  });
};

export const incOrDecProductCountToCartApi = async (
  productSku: string,
  cartItemId: number,
  newQuantity: number
): Promise<AxiosResponse<CartItem>> => {
  return Axios.put(
    `http://api.apollopharmacy.in/rest/V1/guest-carts/${await getCartId()}/items/${cartItemId}`,
    {
      cartItem: {
        quote_id: await getQuoteId(),
        sku: productSku,
        item_id: cartItemId,
        qty: newQuantity,
      },
    }
  );
};

export const removeProductFromCartApi = async (
  cartItemId: number
): Promise<AxiosResponse<{ status: number }>> => {
  return Axios.post(
    `http://api.apollopharmacy.in/apollo_api.php?type=guest_delete_item&quote_id=${await getQuoteId()}&item_id=${cartItemId}`,
    {
      cartItem: {
        item_id: cartItemId,
      },
    }
  );
};
*/

const config = AppConfig.Configuration;

export const getMedicineDetailsApi = (
  productSku: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `${config.MED_DETAIL[0]}/popcsrchpdp_api.php`,
    { params: productSku },
    {
      headers: {
        Authorization: config.MED_DETAIL[1],
      },
    }
  );
};

let cancelSearchMedicineApi: Canceler | undefined;

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchMedicineApi && cancelSearchMedicineApi();

  return Axios.post(
    `${config.MED_SEARCH[0]}/popcsrchprd_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: config.MED_SEARCH[1],
        'Content-Type': 'application/json',
      },
      cancelToken: new CancelToken((c) => {
        // An executor function receives a cancel function as a parameter
        cancelSearchMedicineApi = c;
      }),
    }
  );
};

export const searchPickupStoresApi = async (
  pincode: string
): Promise<AxiosResponse<{ Stores: Store[]; stores_count: number }>> => {
  return Axios.post(
    // `${config.PHARMA_BASE_URL}/popcsrchpin_api.php`,
    `${config.STORES_LIST[0]}/searchpin_api.php`, //Production
    { params: pincode },
    {
      headers: {
        Authorization: config.STORES_LIST[1],
      },
    }
  );
};

export const searchClinicApi = async (): Promise<AxiosResponse<ClinicDetailsResponse>> => {
  return Axios.post(
    AppConfig.Configuration.GET_CLINICS[0] as string,
    {
      ...(AppConfig.Configuration.GET_CLINICS[1] as object),
    },
    {
      headers: {},
    }
  );
};

export const pinCodeServiceabilityApi = (
  pinCode: string
): Promise<AxiosResponse<{ Availability: boolean }>> => {
  return Axios.post(
    // `${config.PHARMA_UAT_BASE_URL}/pincode_api.php`,
    `${config.PIN_SERVICEABILITY[0]}/servicability_api.php`, //Production
    {
      postalcode: pinCode,
      skucategory: [
        {
          SKU: 'PHARMA',
        },
      ],
    },
    {
      headers: {
        Authorization: config.PIN_SERVICEABILITY[1],
      },
    }
  );
};

export const inventoryCheckApi = (
  itemIds: string[]
): Promise<AxiosResponse<InventoryCheckApiResponse>> => {
  return Axios.post(
    `${config.INVENTORY_CHECK[0]}/INV_CHECK`, //Production
    {
      siteid: '14057',
      Itemid: itemIds.map((ItemID) => ({ ItemID })),
    },
    {
      headers: {
        Token: config.INVENTORY_CHECK[1],
      },
    }
  );
};

// export const getPopularProductsBasedOnCityApi = (
//   city: CityOptions
// ): Promise<AxiosResponse<any>> => {
//   return Axios.get(`${config.SHOP_BY_CITY[0]}/popularinyourcityapi.php?plc=${city}`);
// };

let cancelSearchSuggestionsApi: Canceler | undefined;

export const getMedicineSearchSuggestionsApi = (
  params: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchSuggestionsApi && cancelSearchSuggestionsApi();

  return Axios.post(
    `${config.MED_SEARCH_SUGGESTION[0]}/popcsrchss_api.php`,
    {
      params: params,
    },
    {
      headers: {
        Authorization: config.MED_SEARCH_SUGGESTION[1],
      },
      cancelToken: new CancelToken((c) => {
        // An executor function receives a cancel function as a parameter
        cancelSearchSuggestionsApi = c;
      }),
    }
  );
};

export const getProductsByCategoryApi = (
  categoryId: string,
  pageId: number = 1
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.post(
    `${config.PRODUCTS_BY_CATEGORY[0]}?category_id=${categoryId}&page_id=${pageId}&type=category`,
    {
      category_id: categoryId,
      page_id: pageId,
    },
    {
      headers: {
        Authorization: config.PRODUCTS_BY_CATEGORY[1],
      },
    }
  );
};

export const getMedicinePageProducts = (): Promise<AxiosResponse<MedicinePageAPiResponse>> => {
  return Axios.post(
    `${config.MEDICINE_PAGE[0]}`,
    {},
    {
      headers: {
        Authorization: config.MEDICINE_PAGE[1],
      },
    }
  );
};

const googlePlacesApiKey = AppConfig.Configuration.GOOGLE_API_KEY;

export const getPlaceInfoByPincode = (
  pincode: string
): Promise<AxiosResponse<PlacesApiResponse>> => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${googlePlacesApiKey}`;
  return Axios.get(url);
};

export const getPlaceInfoByLatLng = (
  lat: number,
  lng: number
): Promise<AxiosResponse<PlacesApiResponse>> => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googlePlacesApiKey}`;
  return Axios.get(url);
};

export const getPlaceInfoByPlaceId = (
  placeId: string
): Promise<AxiosResponse<PlaceByIdApiResponse>> => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${googlePlacesApiKey}`;
  return Axios.get(url);
};

// let cancelAutoCompletePlaceSearchApi: Canceler | undefined;

export const autoCompletePlaceSearch = (searchText: string): Promise<AxiosResponse<any>> => {
  // const CancelToken = Axios.CancelToken;
  // cancelAutoCompletePlaceSearchApi && cancelAutoCompletePlaceSearchApi();

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&key=${googlePlacesApiKey}`;
  return Axios.get(url, {
    // cancelToken: new CancelToken((c) => {
    //   // An executor function receives a cancel function as a parameter
    //   cancelSearchSuggestionsApi = c;
    // }),
  });
};

let cancelGetDeliveryTimeApi: Canceler | undefined;

export const getDeliveryTime = (params: {
  postalcode: string;
  ordertype: string;
  lookup: { sku: string; qty: number }[];
}): Promise<AxiosResponse<GetDeliveryTimeResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelGetDeliveryTimeApi && cancelGetDeliveryTimeApi();
  return Axios.post(config.GET_DELIVERY_TIME[0], params, {
    headers: {
      Authentication: config.GET_DELIVERY_TIME[1],
    },
    cancelToken: new CancelToken((c) => {
      // An executor function receives a cancel function as a parameter
      cancelGetDeliveryTimeApi = c;
    }),
  });
};

export const getSubstitutes = async (
  sku: string
): Promise<AxiosResponse<{ products: MedicineProductDetails[]; product_count: number }>> => {
  return Axios.post(
    config.GET_SUBSTITUTES[0],
    { params: sku },
    {
      headers: {
        Authorization: config.GET_SUBSTITUTES[1],
      },
    }
  );
};

export const getAllBrands = (): Promise<AxiosResponse<BrandsResponse>> => {
  return Axios.get(config.ALL_BRANDS[0], {
    headers: {
      Authorization: config.ALL_BRANDS[1],
    },
  });
};

const TestApiCredentials = {
  UserName: 'ASKAPOLLO',
  Password: '3HAQbAb9wrsykr8TMLnV',
  InterfaceClient: 'ASKAPOLLO',
};

export const getTestsPackages = (
  CityID: string,
  StateID: string
): Promise<AxiosResponse<TestsPackageResponse>> => {
  return Axios.post(
    config.GET_TEST_PACKAGES[0] as string,
    {
      ...(config.GET_TEST_PACKAGES[1] as object),
      StateID,
      CityID,
    },
    {
      headers: {},
    }
  );
};

export const getPackageData = (
  currentItemId: string
): Promise<AxiosResponse<GetPackageDataResponse>> => {
  return Axios.post(config.GET_PACKAGE_DATA[0], {
    ...TestApiCredentials,
    ItemID: currentItemId,
  });
};

export const GenerateTokenforCM = (
  uhid: string,
  userName: string,
  gender: string,
  emailId: string,
  phoneNumber: string
): Promise<AxiosResponse<any>> => {
  const url = `${config.CONDITIONAL_MANAGENET_BASE_URL}/getCmToken?appUserId=${uhid}&userName=${userName}&gender=${gender}&emailId=${emailId}&phoneNumber=${phoneNumber}`;
  console.log('GenerateTokenforCMurl', url);
  return Axios.get(url);
};

export const notifcationsApi = (params: {
  phone: string;
  size: number;
}): Promise<AxiosResponse<NotificationResponse>> => {
  return Axios.get('https://notifications.apollo247.com/notificatons', {
    headers: { 'x-api-key': 'gNXyYhY2VDxwzv8f6TwJqvfYmPmj' },
    params: params,
  });
};
