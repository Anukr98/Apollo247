import Axios, { AxiosResponse } from 'axios';
import { AsyncStorage } from 'react-native';

export interface MedicineProduct {
  description: string;
  id: number;
  image: string;
  is_in_stock: boolean; //1 for in stock (confirm this)
  is_prescription_required: string; //1 for not required (confirm this)
  name: string;
  price: number;
  sku: string;
  small_image: string;
  status: string; //1, 2
  thumbnail: string;
  type_id: string;
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
  items: unknown[];
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

export interface IncDecOrAddProductToCartResponse {
  item_id: number;
  name: string;
  price: number;
  product_type: string;
  qty: number;
  quote_id: string;
  sku: string;
  extension_attributes: { image_url: string };
}

const AUTH_TOKEN = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';
const getQuoteId = async () =>
  AsyncStorage.getItem('QUOTE_ID') || (await generateQuoteIdApi()).data.quote_id; // in-progress
const getCartId = async () => AsyncStorage.getItem('CART_ID') || (await getCartInfoApi()).data.id; // in-progress

// This API is not being used, verify and remove it later
export const getProductsBasedOnCategory = (
  CATEGORY_ID = '239',
  PAGE_INDEX = 0
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.get(
    `http://api.apollopharmacy.in/apollo_api.php?category_id=${CATEGORY_ID}&page_id=${PAGE_INDEX}&type=category`
  );
};

export const generateQuoteIdApi = (): Promise<AxiosResponse<{ quote_id: string }>> => {
  return Axios.get(`http://api.apollopharmacy.in/apollo_api.php?type=guest_quote`);
};

export const getMedicineDetailsApi = (PRODUCT_SKU: string) => {
  return Axios.get(
    `http://api.apollopharmacy.in/apollo_api.php?sku=${PRODUCT_SKU}&type=product_desc`
  );
};

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.post(
    `http://uat.apollopharmacy.in/searchprd_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: AUTH_TOKEN,
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
): Promise<AxiosResponse<IncDecOrAddProductToCartResponse>> => {
  return Axios.post(`http://api.apollopharmacy.in/rest/V1/guest-carts/${await getCartId()}/items`, {
    cartItem: { quote_id: await getQuoteId(), sku: productSku, qty: quantity },
  });
};

export const incOrDecProductCountToCartApi = async (
  productSku: string,
  itemId: number,
  newQuantity: number
): Promise<AxiosResponse<IncDecOrAddProductToCartResponse>> => {
  return Axios.post(
    `http://api.apollopharmacy.in/rest/V1/guest-carts/${await getCartId()}/items/${itemId}`,
    {
      cartItem: {
        quote_id: await getQuoteId(),
        sku: productSku,
        item_id: itemId,
        qty: newQuantity,
      },
    }
  );
};

export const removeProductFromCartApi = async (
  itemId: number
): Promise<AxiosResponse<{ status: number }>> => {
  return Axios.post(
    `http://api.apollopharmacy.in/apollo_api.php?type=guest_delete_item&quote_id=${await getCartId()}&item_id=${itemId}`,
    { item_id: itemId }
  );
};
