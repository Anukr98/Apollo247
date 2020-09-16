import Axios, { AxiosResponse, Canceler } from 'axios';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getTagalysConfig, Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';

export interface MedicineProduct {
  category_id?: string;
  description: string;
  id: number;
  image: string;
  is_in_stock: 0 | 1;
  is_prescription_required: 0 | 1 | '0' | '1';
  MaxOrderQty: number;
  mou: string; // minimum order unit
  name: string;
  price: number;
  sell_online: 0 | 1;
  sku: string;
  small_image: string;
  special_price?: string | number;
  status: string | number;
  thumbnail: string;
  type_id: 'FMCG' | 'Pharma' | 'PL';
  url_key: string;
}

export interface MedicineProductDetails extends Omit<MedicineProduct, 'image'> {
  image: string[];
  manufacturer: string;
  PharmaOverview: PharmaOverview[];
  similar_products: MedicineProduct[];
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

export interface MedicineProductDetailsResponse {
  productdp: MedicineProductDetails[];
  message?: string;
}

export interface MedicineOrderBilledItem {
  batchId: string;
  issuedQty: number;
  itemId: string;
  itemName: string;
  mou: number;
  mrp: number;
}

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
  search_heading?: string;
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
  state_id: string;
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

export interface GetStoreInventoryResponse {
  shopId: string;
  requestStatus: boolean;
  requestMessage: string;
  itemDetails: {
    itemId: string;
    qty: number;
    mrp: number;
  }[];
}

export interface TatApiInput247 {
  pincode: string;
  lat: number;
  lng: number;
  items: {
    sku: string;
    qty: number;
  }[];
}

export interface ServiceAbilityApiInput {
  pincode: string;
  sku: string;
}

export interface GetAvailabilityResponse247 {
  response: {
    sku: string;
    exist: boolean;
  }[];
  errorMSG?: string;
}

export interface GetTatResponse247 {
  response: {
    items: {
      sku: string;
      qty: number;
      mrp: number;
      exist: boolean;
    }[];
    storeCode: string;
    tat: string;
    tatU: number;
    inventoryExist: boolean;
    storeType: string;
  };
  errorMSG?: string;
}

interface MedCartItemsDetailsResponse {
  productdp: MedicineProduct[];
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

export interface AutoCompleteApiResponse {
  predictions: Prediction[];
  status: string;
}

export interface Prediction {
  description: string;
  id: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: StructuredFormatting;
  terms: Term[];
  types: string[];
}

interface MatchedSubstring {
  length: number;
  offset: number;
}

interface MainTextMatchedSubstring {
  length: number;
  offset: number;
}

interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings: MainTextMatchedSubstring[];
  secondary_text: string;
}

interface Term {
  offset: number;
  value: string;
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
export interface MedicinePageSection {
  category_id: string;
  title: string;
  image_url: string;
}
export interface DealsOfTheDaySection {
  category_id: string;
  image_url: string;
  position: number;
}
export interface OfferBannerSection {
  name: string;
  status: '0' | '1';
  image: string; // full url
  start_time: string; // '2019-02-10 01:21:00';
  end_time: string;
  category_id?: number;
  sku?: string;
}

export interface MedicinePageAPiMetadata {
  section_key: string;
  section_name: string;
  section_position: number;
  visible: boolean;
}

export interface MedicinePageProducts {
  products: MedicineProduct[];
  category_id?: number;
}

export interface MedicinePageAPiResponse {
  mainbanners: OfferBannerSection[];
  healthareas: MedicinePageSection[];
  deals_of_the_day: DealsOfTheDaySection[];
  shop_by_category: MedicinePageSection[];
  shop_by_brand: MedicinePageSection[];
  hot_sellers?: MedicinePageProducts;
  monsoon_essentials?: MedicinePageProducts;
  widget_2?: MedicinePageProducts;
  widget_3?: MedicinePageProducts;
  metadata: MedicinePageAPiMetadata[];
  [key: string]:
    | MedicinePageAPiMetadata[]
    | MedicinePageProducts
    | OfferBannerSection[]
    | DealsOfTheDaySection[]
    | MedicinePageSection[]
    | any;
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

export interface SymptomTrackerChatRequest {
  userID: string;
  profileID: string;
  userProfile: SymptomTrackerUserProfile;
}

interface SymptomTrackerUserProfile {
  age: number;
  gender: string;
}

export interface SymptomTrackerChatResponse {
  dialogue: SymptomTrackerInfo;
  id: string;
  msg?: string;
}

interface SymptomTrackerInfo {
  options: DefaultSymptoms[];
  sender?: string;
  status?: string;
  text: string;
}

export interface DefaultSymptoms {
  name: string;
  id: string;
  description: string;
  url?: string;
}

export interface AutoCompleteSymptomsParams {
  text: string;
  filter: string;
}

interface AutoCompleteSymptomsResponse {
  hits?: number;
  results: AutoCompleteSymptoms[];
  status?: string;
}

export interface AutoCompleteSymptoms {
  name: string;
  id: string;
  description: string;
  url?: string;
  type?: string;
}

export interface UpdateSymptomTrackerChatRequest {
  dialogue: {
    text: string;
    options: [];
    status: string;
    sender: string;
  };
}

interface SymptomsTrackerResultResponse {
  diseases: SymptomsDiseases[];
  specialities: SymptomsSpecialities[];
  symptoms: {
    id: string;
    name: string;
  }[];
}

interface SymptomsDiseases {
  description: string;
  id: string;
  name: string;
  score: number;
  speciality: string;
  url?: string;
}

export interface SymptomsSpecialities {
  departmentID?: string[];
  description?: string;
  diseases?: string[];
  name: string;
}

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

export const searchMedicineApi = async (
  searchText: string,
  pageId: number = 1
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchMedicineApi && cancelSearchMedicineApi();

  return Axios({
    url: config.MED_SEARCH[0],
    method: 'POST',
    data: {
      params: searchText,
      page_id: pageId,
    },
    headers: {
      Authorization: config.MED_SEARCH[1],
    },
    cancelToken: new CancelToken((c) => {
      // An executor function receives a cancel function as a parameter
      cancelSearchMedicineApi = c;
    }),
  });
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

export const getStoreInventoryApi = (
  shopId: string,
  items: string[] // SKU list
): Promise<AxiosResponse<GetStoreInventoryResponse>> => {
  return Axios.post(
    `${config.GET_STORE_INVENTORY[0]}`,
    {
      shopId: shopId,
      itemdetails: items.map((itemId) => ({
        ItemId: itemId,
      })),
    },
    {
      headers: {
        Authentication: config.GET_STORE_INVENTORY[1],
      },
    }
  );
};

export const pinCodeServiceabilityApi247 = (
  pincode: string
): Promise<AxiosResponse<{ response: boolean }>> => {
  const url = `${config.UATTAT_CONFIG[0]}/serviceable?pincode=${pincode}`;
  return Axios.post(
    url,
    {},
    {
      headers: {
        Authorization: config.UATTAT_CONFIG[1],
      },
    }
  );
};

export const availabilityApi247 = (
  pincode: string,
  sku: string
): Promise<AxiosResponse<GetAvailabilityResponse247>> => {
  const url = `${config.UATTAT_CONFIG[0]}/availability?sku=${sku}&pincode=${pincode}`;
  return Axios.post(
    url,
    {},
    {
      headers: {
        Authorization: config.UATTAT_CONFIG[1],
      },
    }
  );
};

export const medCartItemsDetailsApi = (
  itemIds: string[]
): Promise<AxiosResponse<MedCartItemsDetailsResponse>> => {
  return Axios.post(
    config.MED_CART_ITEMS_DETAILS[0],
    {
      params: itemIds.toString(),
    },
    {
      headers: {
        Authorization: config.MED_CART_ITEMS_DETAILS[1],
      },
    }
  );
};

export const trackTagalysEvent = (
  params: Tagalys.Event,
  userId: string
): Promise<AxiosResponse<any>> => {
  return Axios({
    url: config.TRACK_EVENT[0],
    method: 'POST',
    data: {
      ...getTagalysConfig(userId),
      ...params,
    },
  });
};

let cancelSearchSuggestionsApi: Canceler | undefined;

export const getMedicineSearchSuggestionsApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchSuggestionsApi && cancelSearchSuggestionsApi();

  return Axios({
    url: config.MED_SEARCH_SUGGESTION[0],
    method: 'POST',
    data: {
      params: searchText,
    },
    headers: {
      Authorization: config.MED_SEARCH_SUGGESTION[1],
    },
    cancelToken: new CancelToken((c) => {
      // An executor function receives a cancel function as a parameter
      cancelSearchSuggestionsApi = c;
    }),
  });
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
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=pincode:${pincode}&components=country:in&key=${googlePlacesApiKey}`;
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

export const getLatLongFromAddress = (
  address: string
): Promise<AxiosResponse<PlacesApiResponse>> => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googlePlacesApiKey}`;
  return Axios.get(url);
};

// let cancelAutoCompletePlaceSearchApi: Canceler | undefined;

export const autoCompletePlaceSearch = (
  searchText: string
): Promise<AxiosResponse<AutoCompleteApiResponse>> => {
  // const CancelToken = Axios.CancelToken;
  // cancelAutoCompletePlaceSearchApi && cancelAutoCompletePlaceSearchApi();

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&components=country:in&key=${googlePlacesApiKey}`;
  return Axios.get(url, {
    // cancelToken: new CancelToken((c) => {
    //   // An executor function receives a cancel function as a parameter
    //   cancelSearchSuggestionsApi = c;
    // }),
  });
};

let cancelGetDeliveryTAT247: Canceler | undefined;

export const getDeliveryTAT247 = (
  params: TatApiInput247
): Promise<AxiosResponse<GetTatResponse247>> => {
  const CancelToken = Axios.CancelToken;
  cancelGetDeliveryTAT247 && cancelGetDeliveryTAT247();
  const url = `${config.UATTAT_CONFIG[0]}/tat`;
  return Axios.post(url, params, {
    headers: {
      Authorization: config.UATTAT_CONFIG[1],
    },
    timeout: config.TAT_API_TIMEOUT_IN_SEC * 1000,
    cancelToken: new CancelToken((c) => {
      cancelGetDeliveryTAT247 = c;
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

export const getNearByStoreDetailsApi = (pincode: any): Promise<AxiosResponse<any>> => {
  const url = `https://notifications.apollo247.com/webhooks/store/${pincode}`;
  return Axios.get(url, {
    headers: { 'x-api-key': 'gNXyYhY2VDxwzv8f6TwJqvfYmPmj' },
  });
};

export const callToExotelApi = (params: any): Promise<AxiosResponse<any>> => {
  const url = `https://notifications.apollo247.com/webhooks/exotel/call`;
  return Axios.post(
    url,
    { ...params },
    {
      headers: {
        'x-api-key': 'gNXyYhY2VDxwzv8f6TwJqvfYmPmj',
      },
    }
  );
};

export const fetchPaymentOptions = (): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
  const url = `${baseUrl}/list-of-payment-methods`;
  return Axios.get(url);
};

export const exotelCallAPI = (params: any): Promise<AxiosResponse<any>> => {
  const url = AppConfig.Configuration.EXOTEL_CALL_API_URL;
  return Axios.post(url, params);
};

export const getTxnStatus = (orderID: string): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
  const url = `${baseUrl}/transaction-status`;
  return Axios.post(url, { orderID: orderID });
};

export const fetchConsultCoupons = (): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  const url = `${baseUrl}/frontend`;
  return Axios.get(url);
};

export const validateConsultCoupon = (data: any): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  const url = `${baseUrl}/validate`;
  return Axios.post(url, data);
};

export const userSpecificCoupon = (mobileNumber: string): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  const url = `${baseUrl}/availableCoupons?mobile=${mobileNumber}`;
  return Axios.get(url);
};

export const startSymptomTrackerChat = async (
  data: SymptomTrackerChatRequest
): Promise<AxiosResponse<SymptomTrackerChatResponse>> => {
  const baseUrl = AppConfig.Configuration.SYMPTOM_TRACKER;
  return Axios.post(baseUrl, data);
};

export const fetchAutocompleteSymptoms = (
  chatId: string,
  params: AutoCompleteSymptomsParams
): Promise<AxiosResponse<AutoCompleteSymptomsResponse>> => {
  const baseUrl = AppConfig.Configuration.SYMPTOM_TRACKER;
  const url = `${baseUrl}/${chatId}/autosuggest`;
  return Axios.get(url, {
    params: params,
  });
};

export const updateSymptomTrackerChat = async (
  chatId: string,
  data: UpdateSymptomTrackerChatRequest
): Promise<AxiosResponse<SymptomTrackerChatResponse>> => {
  const baseUrl = AppConfig.Configuration.SYMPTOM_TRACKER;
  const url = `${baseUrl}/${chatId}`;
  return Axios.patch(url, data);
};

export const getSymptomsTrackerResult = (
  chatId: string
): Promise<AxiosResponse<SymptomsTrackerResultResponse>> => {
  const baseUrl = AppConfig.Configuration.SYMPTOM_TRACKER;
  const url = `${baseUrl}/${chatId}/specialities`;
  return Axios.get(url);
};
