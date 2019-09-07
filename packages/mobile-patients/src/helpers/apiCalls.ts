import Axios, { AxiosResponse } from 'axios';
import { AsyncStorage } from 'react-native';

export interface MedicineProduct {
  description: string;
  id: number;
  image: string;
  is_in_stock: boolean; // always returning true
  is_prescription_required: string; //1 for required
  name: string;
  price: number;
  special_price: number;
  sku: string;
  small_image: string;
  status: number; // 1, 2 (1 = in-stock, 2= out-of-stock)
  thumbnail: string;
  type_id: string;
  mou: string;
}

interface PharmaOverview {
  generic: string;
  Doseform: string;
  Unit: string;
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

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
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
// 9f15bdd0fcd5423190c2e877ba0228A24
// const AUTH_TOKEN = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
const config = {
  AUTH_TOKEN: 'dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
  BASE_URL: 'http://13.126.95.18',
  AUTH_TOKEN_OLD: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
};

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

export const getMedicineDetailsApi = (
  productSku: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `${config.BASE_URL}/popcsrchpdp_api.php`,
    { params: productSku },
    {
      headers: {
        Authorization: config.AUTH_TOKEN,
      },
    }
  );
};

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.post(
    `${config.BASE_URL}/popcsrchprd_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: config.AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );
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

export const searchPickupStoresApi = async (
  pincode: string
): Promise<AxiosResponse<{ Stores: Store[]; stores_count: number }>> => {
  return Axios.post(
    `${config.BASE_URL}/popcsrchpin_api.php`,
    { params: pincode },
    {
      headers: {
        Authorization: config.AUTH_TOKEN,
      },
    }
  );
};

export const pinCodeServiceabilityApi = (
  pinCode: string,
  category: 'FMCG' | 'PHARMA'
): Promise<AxiosResponse<{ Availability: boolean; catg: 'FMCG' | 'PHARMA' }>> => {
  return Axios.post(
    `http://uat.apollopharmacy.in/pincode_api.php`,
    {
      postalcode: pinCode,
      skucategory: [
        {
          SKU: category,
        },
      ],
    },
    {
      headers: {
        Authorization: config.AUTH_TOKEN_OLD,
      },
    }
  );
};
