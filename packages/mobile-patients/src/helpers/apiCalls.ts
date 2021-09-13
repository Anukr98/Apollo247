import Axios, { AxiosResponse, Canceler } from 'axios';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getTagalysConfig, Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { string } from '../strings/string';

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
  careCashback?: number | null;
  is_express?: 'Yes' | 'No';
  dc_availability?: 'Yes' | 'No';
  is_in_contract?: 'Yes' | 'No';
  is_returnable?: 'Yes' | 'No';
  marketer_address?: string | null;
  unit_of_measurement?: string | null;
  vegetarian?: 'Yes' | 'No';
  storage?: string | null;
  key_ingredient?: string | null;
  key_benefits?: string | null;
  safety_information?: string | null;
  size?: string | null;
  flavour_fragrance?: string | null;
  colour?: string | null;
  variant?: string | null;
  expiry_date?: string | null;
  composition?: string | null;
  consume_type?: string | null;
  dose_form_variant?: string | null;
  pack_form?: string | null;
  product_form?: string | null;
  pack_size?: string | null;
  banned?: 'Yes' | 'No';
  subcategory?: string | null;
  merchandising?: number | null;
  suggested_qty: string | null;
}

export interface MedicineProductDetails extends Omit<MedicineProduct, 'image'> {
  image: string[];
  manufacturer: string;
  PharmaOverview: PharmaOverview[];
  similar_products: MedicineProduct[];
  crosssell_products: MedicineProduct[];
}

export type Doseform = 'TABLET' | 'INJECTION' | 'SYRUP' | '';
export enum DIAGNOSTIC_GROUP_PLAN {
  ALL = 'ALL',
  CIRCLE = 'CIRCLE',
  SPECIAL_DISCOUNT = 'SPECIALDISCOUNTS',
}

interface PharmaOverview {
  generic: string;
  Doseform: Doseform;
  Unit: string;
  Strength: string;
  Strengh: string;
  Overview: {
    Caption: string;
    CaptionDesc: string;
  }[]; // type can be string if information not available
  NewPharmaOverview: NewPharmaOverview;
}

export interface NewPharmaOverview {
  Storage: string;
  StoragePlace: string;
  ColdChain: string;
  AboutProduct: string;
  HowToTake: string;
  LiverTag: string;
  LiverContent: string;
  KidneyTag: string;
  KidneyContent: string;
  PregnancyTag: string;
  PregnancyContent: string;
  BreastfeedingMothersTag: string;
  BreastfeedingMothersContent: string;
  AlcoholTag: string;
  AlcoholContent: string;
  DrivingTag: string;
  DrivingContent: string;
  WarningsAndPrecautions: string;
  CompositionContentFAQs: PharmaFAQ[];
  SideEffects: string;
  DiseaseConditionGlossary?: string;
  DietAndLifestyle?: string;
  SpecialAdvise?: string;
  HabitForming?: string;
}

export interface PharmaFAQ {
  field_question: string;
  field_answer: string;
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

export interface SearchSuggestion {
  name: string;
  categoryId: string;
  queryName: string;
  superQuery?: string;
}

export interface MedicineSearchQueryFilter {
  query: string[];
  filter: {
    __categories: string[];
  };
}

export interface MedicineProductsResponse {
  queries?: MedicineSearchQueryFilter[];
  products: MedicineProduct[];
  product_count?: number;
  count?: number;
}

export interface CategoryProductsApiResponse {
  products: MedicineProduct[];
  count: number;
  filters: MedFilter[];
  sort_by: Value[];
}

export interface PopcSrchPrdApiResponse {
  products: MedicineProduct[];
  product_count: number;
  search_heading: string;
  filters: MedFilter[];
  sort_by: Value[];
}

interface Value {
  id: string;
  name: string;
  child?: {
    category_id: string;
    title: string;
  }[];
}
export interface MedFilter {
  name: string;
  attribute: string; // 'category' | 'brand' ...
  select_type: 'single' | 'multi';
  min?: number;
  max?: number;
  values?: Value[];
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
  userType: 'regular' | 'circle';
}

export interface TatApiInput {
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
    qty: number;
    mrp: number;
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
    pincode: number;
    lat: number;
    lng: number;
    tat: string;
    tatU: number;
    inventoryExist: boolean;
    storeType: string;
    ordertime: number;
    distance: number;
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

export interface Category {
  category_id: string;
  title: string;
  url_key: string;
  image_url?: string;
  Child: Category[];
}

export interface MedicinePageAPiResponse {
  categories: Category[];
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
  requiredAttachment?: string;
  itemId?: number;
  TestInclusion: string;
  sampleRemarks: string;
  sampleTypeName: string;
  testParameters: string;
  name?: string;
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
  testDescription: string;
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

export interface ProceduresAndSymptomsParams {
  text: string;
}

interface ProceduresAndSymptomsResponse {
  hits?: number;
  results: ProceduresAndSymptomsResult[];
  status?: string;
}

export interface ProceduresAndSymptomsResult {
  description?: string;
  id?: string;
  name: string;
  speciality?: string;
  tag: string;
}

export interface SpecialOfferWidgetsData {
  widgetTitle: string;
  widgetRank: string;
}

export interface SpecialOffersWidgetsApiResponse {
  success: string;
  msg: string;
  data: SpecialOfferWidgetsData[]
}

export interface SpecialOffersCouponsData {
  couponCode: string;
  description: string;
  startDate: number;
  endDate: number;
  header: string;
  logo: string;
  knowMore: string;
  terms: string;
  redirectUrl: string;
  skus?: [] | null;
}

export interface SpecialOffersCouponsApiResponse {
  errorCode: number;
  errorMsg?: null;
  errorType?: null;
  response?: SpecialOffersCouponsData[];
}

export interface SpecialOffersCategoryApiResponse {
  category_id: number;
  title: string;
  url_key: string;
  image_url: string;
  specialoffer_position: string;
}

export interface SpecialOffersBrandsApiResponse {
  id: number;
  title: string;
  url_key: string;
  image: string;
  position: string;
  promotional_message: string;
  discount: string;
  sorting_option: string;
}

export interface SpecialOffersBrandsProductsApiResponse {
  filters?: [] | null;
  sort_by?: [] | null;
  products: MedicineProduct[];
  product_count: number;
  search_heading: string;
}



const config = AppConfig.Configuration;

export const getMedicineDetailsApi = (
  productSku: string,
  axdcCode?: string,
  pincode?: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `${config.MED_DETAIL[0]}/popcsrchpdp_api.php`,
    {
      params: productSku,
      axdcCode: axdcCode || '',
      pincode: pincode || '',
    },
    {
      headers: {
        Authorization: config.MED_DETAIL[1],
      },
    }
  );
};

export const getMedicineDetailsApiV2 = (
  urlKey: string,
  axdcCode?: string,
  pincode?: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `${config.MED_DETAIL[0]}/popcsrchpdpv2_api.php`,
    {
      params: urlKey,
      axdcCode: axdcCode || '',
      pincode: pincode || '',
    },
    {
      headers: {
        Authorization: config.MED_DETAIL[1],
      },
    }
  );
};

let cancelSearchMedicineApi247: Canceler | undefined;
export const searchMedicineApi = async (
  searchText: string,
  pageId: number = 1,
  sortBy: string | null,
  filters: { [key: string]: string[] } | null,
  axdcCode?: string | null,
  pincode?: string | null
): Promise<AxiosResponse<PopcSrchPrdApiResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchMedicineApi247 && cancelSearchMedicineApi247();
  const res =  Axios({
    url: config.MED_SEARCH[0],
    method: 'POST',
    data: {
      params: searchText,
      page_id: pageId,
      sort_by: sortBy,
      filters,
      axdcCode: `${axdcCode}`,
      pincode: `${pincode}`,
    },
    headers: {
      Authorization: config.MED_SEARCH[1],
    },
    cancelToken: new CancelToken((c) => {
      cancelSearchMedicineApi247 = c;
    }),
  });
  console.log('res is....................', res);
  return res;
};

export const formatFilters = (filters: { [key: string]: string[] } | null) =>
  filters &&
  Object.keys(filters).reduce(
    (prevVal, currKey) => ({
      ...prevVal,
      ...(filters[currKey]?.length
        ? { [currKey]: filters[currKey]?.length === 1 ? filters[currKey][0] : filters[currKey] } // to convert to string if array of length 1
        : {}),
    }),
    {}
  );

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
  const url = `${config.SERVICEABLE_CONFIG[0]}/${pincode}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.SERVICEABLE_CONFIG[1],
    },
  });
};

let cancelAvailabilityApi247: Canceler | undefined;

export const availabilityApi247 = (
  pincode: string,
  sku: string
): Promise<AxiosResponse<GetAvailabilityResponse247>> => {
  const CancelToken = Axios.CancelToken;
  cancelAvailabilityApi247 && cancelAvailabilityApi247();
  const url = `${config.UATTAT_CONFIG[0]}/availability?sku=${sku}&pincode=${pincode}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.UATTAT_CONFIG[1],
    },
    cancelToken: new CancelToken((c) => {
      cancelAvailabilityApi247 = c;
    }),
  });
};

export const nonCartTatApi247 = (pincode: string): Promise<AxiosResponse<>> => {
  const url = `${config.UATTAT_CONFIG[0]}/noncarttat?pin=${pincode}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.UATTAT_CONFIG[1],
    },
  });
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

let cancelGetMedicineSearchSuggestionsApi: Canceler | undefined;
export const getMedicineSearchSuggestionsApi = (
  searchText: string,
  axdcCode?: string | null,
  pincode?: string | null
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelGetMedicineSearchSuggestionsApi && cancelGetMedicineSearchSuggestionsApi();
  return Axios({
    url: config.MED_SEARCH_SUGGESTION[0],
    method: 'POST',
    data: {
      params: searchText,
      axdcCode: `${axdcCode}`,
      pincode: `${pincode}`,
    },
    headers: {
      Authorization: config.MED_SEARCH_SUGGESTION[1],
    },
    cancelToken: new CancelToken((c) => {
      cancelGetMedicineSearchSuggestionsApi = c;
    }),
  });
};

export const getProductsByCategoryApi = (
  categoryId: string,
  pageId: number = 1,
  sortBy: string | null,
  filters: { [key: string]: string[] } | null,
  axdcCode?: string | null,
  pincode?: string | null
): Promise<AxiosResponse<CategoryProductsApiResponse>> => {
  return Axios.post(
    config.PRODUCTS_BY_CATEGORY[0],
    {
      category_id: `${categoryId}`,
      page_id: pageId,
      sort_by: sortBy,
      filters,
      axdcCode: `${axdcCode}`,
      pincode: `${pincode}`,
    },
    {
      headers: {
        Authorization: config.PRODUCTS_BY_CATEGORY[1],
      },
      transformResponse: (_reponse: any) => {
        const reponse = JSON.parse(_reponse || '{}');

        const modifiedFilters = reponse?.filters?.map((f: any) => {
          const modifiedValues = f?.values?.map((item: any) => ({
            id: item.value,
            name: item.label,
            child: item.child,
          }));
          return { ...f, values: modifiedValues };
        });

        const modifiedSortBy = reponse?.sort_by?.values?.map((v: any) => {
          return { ...v, id: v.value, name: v.label };
        });

        return { ...reponse, filters: modifiedFilters || [], sort_by: modifiedSortBy || [] };
      },
    }
  );
};

export const getMedicinePageProducts = (
  axdcCode?: string | null,
  pincode?: string | null
): Promise<AxiosResponse<MedicinePageAPiResponse>> => {
  let url = `${config.MEDICINE_PAGE[0]}`;
  if (axdcCode) {
    url += `&axdcCode=${axdcCode}`;
  }
  if (pincode) {
    url += `&pincode=${pincode}`;
  }
  return Axios.get(url, {
    headers: {
      Authorization: config.MEDICINE_PAGE[1],
    },
  });
};

export const getSpecialOffersPageWidgets = (): Promise<AxiosResponse<SpecialOffersWidgetsApiResponse>> => {
  const url = `${config.SPECIAL_OFFERS_PAGE_WIDGETS[0]}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.SPECIAL_OFFERS_PAGE_WIDGETS[1],
    },
  });
};

export const getSpecialOffersPageCoupons = (): Promise<AxiosResponse<SpecialOffersCouponsApiResponse>> => {
  const url = `${config.SPECIAL_OFFERS_PAGE_COUPONS[0]}`;
  return Axios.get(url, {
    headers: {},
  });
};

export const getSpecialOffersPageCategory = (): Promise<AxiosResponse<SpecialOffersCategoryApiResponse>> => {
  const url = `${config.SPECIAL_OFFERS_CATEGORY[0]}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.SPECIAL_OFFERS_CATEGORY[1],
    },
  });
};

export const getSpecialOffersPageBrands = (): Promise<AxiosResponse<SpecialOffersBrandsApiResponse>> => {
  const url = `${config.SPECIAL_OFFERS_BRANDS[0]}`;
  return Axios.get(url, {
    headers: {
      Authorization: config.SPECIAL_OFFERS_BRANDS[1],
    },
  });
};

export const getSpecialOffersPageBrandsProducts = (activeBrand: string, discount_percentage: object) 
:Promise<AxiosResponse<SpecialOffersBrandsProductsApiResponse>> => {
  const url = `${config.SPECIAL_OFFERS_BRANDS_PRODUCTS[0]}`;
  return Axios.post(url,
    {
      params: activeBrand,
      filter: { discount_percentage}
    },
    {headers: {
      Authorization: config.SPECIAL_OFFERS_BRANDS_PRODUCTS[1],
    }},
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
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${googlePlacesApiKey}&components=country:IN`;
  return Axios.get(url);
};

export const autoCompletePlaceSearch = (
  searchText: string
): Promise<AxiosResponse<AutoCompleteApiResponse>> => {
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&components=country:in&key=${googlePlacesApiKey}`;
  return Axios.get(url, {});
};

let cancelGetDeliveryTAT247: Canceler | undefined;

export const getDeliveryTAT247 = (params: TatApiInput247): Promise<AxiosResponse<any>> => {
  const CancelToken = Axios.CancelToken;
  cancelGetDeliveryTAT247 && cancelGetDeliveryTAT247();
  const url = `${config.UATTAT_CONFIG[0]}/v2/tat`;
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

export const getDeliveryTAT = (params: TatApiInput): Promise<AxiosResponse<any>> => {
  const url = `${config.UATTAT_CONFIG[0]}/tat`;
  return Axios.post(url, params, {
    headers: {
      Authorization: config.UATTAT_CONFIG[1],
    },
    timeout: config.TAT_API_TIMEOUT_IN_SEC * 1000,
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

export const fetchConsultCoupons = (data: any): Promise<AxiosResponse<any>> => {
  const { mobile, packageId, email, type } = data;
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  let url = `${baseUrl}/frontend?mobile=${mobile}&email=${email}&type=${type}`;
  if (!!packageId) {
    url += `&packageId=${packageId}`;
  }
  return Axios.get(url);
};

export const validateConsultCoupon = (data: any): Promise<AxiosResponse<any>> => {
  const { mobile, email } = data;
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  let url = `${baseUrl}/validate?mobile=${mobile}&email=${email}`;
  return Axios.post(url, data);
};

export const fetchAutoApplyCoupon = (data: any): Promise<AxiosResponse<any>> => {
  const { mobile, packageId, email, type } = data;
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  let url = `${baseUrl}/autoapply?mobile=${mobile}&email=${email}&type=${type}`;
  if (!!packageId) {
    url += `&packageId=${packageId}`;
  }  
  return Axios.get(url);
};

export const userSpecificCoupon = (
  mobileNumber: string,
  type: string
): Promise<AxiosResponse<any>> => {
  const baseUrl = AppConfig.Configuration.CONSULT_COUPON_BASE_URL;
  const url = `${baseUrl}/availableCoupons?mobile=${mobileNumber}&type=${type}`;
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

export const getMedicineCategoryIds = (
  skuKey: string,
  level: string
): Promise<AxiosResponse<any>> => {
  return Axios({
    url: config.GET_SKU[0],
    method: 'POST',
    data: {
      params: skuKey,
      level,
    },
    headers: {
      Authorization: config.GET_SKU[1],
    },
  });
};

export const searchPHRApi = (
  searchText: string,
  uhid: string,
  healthRecordType: string = ''
): Promise<AxiosResponse<any>> => {
  const searchPHRUrl = `${AppConfig.Configuration.PHR_BASE_URL}/apollo/healthrecord/search?accessToken=KeyOf247&uhid=${uhid}&healthrecordType=${healthRecordType}&searchTerm=${searchText}`;
  return Axios.get(searchPHRUrl);
};

export const searchPHRApiWithAuthToken = (
  searchText: string,
  authToken: string,
  healthRecordType: string = ''
): Promise<AxiosResponse<any>> => {
  const searchPHRUrlWithAuthToke = `${AppConfig.Configuration.PHR_BASE_URL}/searchhealthrecord?authToken=${authToken}&healthrecordType=${healthRecordType}&searchTerm=${searchText}`;
  return Axios.get(searchPHRUrlWithAuthToke);
};

export const getCorporateMembershipData = (planId: string): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const corporateCmsUrl = `${baseurl}/corporate-package-benefit/${planId}`;
  return Axios.get(corporateCmsUrl, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const getLandingPageBanners = (
  pageName: string,
  cityId: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getBanners = `${baseurl}/banner/${pageName}?city=${cityId}`;
  return Axios.get(getBanners, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const getDiagnosticsSearchResults = (
  pageName: string,
  keyword: string,
  cityId: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getSearchResults = `${baseurl}/${pageName}/item-search?keyword=${keyword}&city=${cityId}`;
  return Axios.get(getSearchResults, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};
export const getDiagnosticsPopularResults = (
  pageName: string,
  cityId: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getSearchResults = `${baseurl}/${pageName}/popular-test-search?city=${cityId}`;
  return Axios.get(getSearchResults, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const getDiagnosticHomePageWidgets = (pageName: string,  cityId: number): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getWidgets = `${baseurl}/${pageName}/getwidgets?city=${cityId}`;
  return Axios.get(getWidgets, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const searchProceduresAndSymptoms = (
  params: ProceduresAndSymptomsParams
): Promise<AxiosResponse<ProceduresAndSymptomsResponse>> => {
  const url = AppConfig.Configuration.PROCEDURE_SYMPTOMS_SEARCH_URL;
  return Axios.get(url, {
    params: params,
  });
};

export const getDiagnosticTestDetails = (
  pageName: string,
  itemId: number,
  itemName: string,
  cityId: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getDetails = `${baseurl}/${pageName}/${itemId}?ctag=${itemName}&cityId=${cityId}`;
  return Axios.get(getDetails, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const getDiagnosticListingWidget = (
  pageName: string,
  widgetName: string
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getWidgets = `${baseurl}/${pageName}/${widgetName}`;
  return Axios.get(getWidgets, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const GetAllUHIDSForNumber_CM = (phoneNumber: string): Promise<AxiosResponse<any>> => {
  const url = `${config.CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL}/askapollo/user/uhids?phoneNumber=${phoneNumber}`;
  console.log('GetAllUHIDSForNumber_CM_Url', url);
  return Axios.get(url);
};

export const GenrateVitalsToken_CM = (
  appId: string,
  userId: string
): Promise<AxiosResponse<any>> => {
  const url = `${config.CONDITIONAL_MANAGEMENT_PROHEALTH_BASE_URL}/vitauser/vitatoken?appId=${appId}&appUserId=${userId}`;
  console.log('GetAllUHIDSForNumber_CM_Url', url);
  return Axios.get(url);
};

export const getDiagnosticCartItemReportGenDetails = (
  itemIds: string,
  cityId: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getReportGenDetails = `${baseurl}/diagnostic/cart-items?itemId=${itemIds}&cityId=${cityId}`;
  return Axios.get(getReportGenDetails, {
    headers: {
      Authorization: config.DRUPAL_CONFIG[1],
    },
  });
};

export const getDiagnosticDoctorPrescriptionResults = (
  itemNames: string,
  cityId?: number
): Promise<AxiosResponse<any>> => {
  const baseurl = config.DRUPAL_CONFIG[0];
  const getSearchResults = `${baseurl}/diagnostic/diagnosticdoctoritemsearch`;
  return Axios.post(
    getSearchResults,
    {
      keyword: itemNames,
    },
    {
      headers: {
        Authorization: config.DRUPAL_CONFIG[1],
      },
    }
  );
};

export const getTatStaticContent = (
): Promise<AxiosResponse<any>> => {
  const baseUrl = config.assetsBaseurl;
  const url = `${baseUrl}/tatCtaStaticContent.json`;
  return Axios.get(url);
};
