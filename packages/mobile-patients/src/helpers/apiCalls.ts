import Axios, { AxiosResponse } from 'axios';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface MedicineProduct {
  description: string;
  id: number;
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
  type_id: string;
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

export interface GetDeliveryTimeResponse {
  tat: {
    artCode: string;
    deliverydate: string;
    siteId: string;
  }[];
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

interface OfferBannerResponse {
  mainbanners: {
    name: string;
    status: '0' | '1';
    image: string; // full url
    start_time: string; // '2019-02-10 01:21:00';
    end_time: string;
  }[];
}

type GooglePlacesType =
  | 'postal_code'
  | 'locality'
  | 'administrative_area_level_2'
  | 'administrative_area_level_1'
  | 'country';

export enum ProductCategory {
  HOT_SELLERS = '1174',
}

interface PlacesApiResponse {
  results: {
    address_components: {
      long_name: string;
      short_name: string;
      types: GooglePlacesType[];
    }[];
  }[];
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

let cancelSearchMedicineApi: any;

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
      cancelToken: new CancelToken(function executor(c) {
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

let cancelSearchSuggestionsApi: any;

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
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancelSearchSuggestionsApi = c;
      }),
    }
  );
};

export const getProductsByCategoryApi = (
  categoryId: String,
  pageId: number = 1
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.get(
    `${config.PRODUCTS_BY_CATEGORY[0]}?category_id=${categoryId}&page_id=${pageId}&type=category`
  );
};

export const getOfferBanner = (): Promise<AxiosResponse<OfferBannerResponse>> => {
  return Axios.post(
    `${config.OFFER_BANNER[0]}`,
    {},
    {
      headers: {
        Authorization: config.OFFER_BANNER[1],
      },
    }
  );
};

export const getPlaceInfoByPincode = (
  pincode: string
): Promise<AxiosResponse<PlacesApiResponse>> => {
  const apiKey = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;
  return Axios.get(url);
};

export const getDeliveryTime = (params: {
  postalcode: string;
  ordertype: string;
  lookup: { sku: string; qty: number }[];
}): Promise<AxiosResponse<GetDeliveryTimeResponse>> => {
  return Axios.post(config.GET_DELIVERY_TIME[0], params, {
    headers: {
      Authentication: config.GET_DELIVERY_TIME[1],
    },
  });
};

export const getSubstitutes = async (
  sku: string
): Promise<AxiosResponse<{ Stores: Store[]; stores_count: number }>> => {
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
