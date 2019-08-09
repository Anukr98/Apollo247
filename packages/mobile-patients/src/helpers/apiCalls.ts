import Axios, { AxiosResponse } from 'axios';

export interface MedicineProductsResponse {
  product_count: number;
  products: {
    description: string;
    id: number;
    image: string;
    is_in_stock: number; //1 for in stock (confirm this)
    is_prescription_required: string; //1 for not required (confirm this)
    name: string;
    price: number;
    sku: string;
    special_price: string;
    status: string; //1
    thumbnail: string;
    type_id: string;
  }[];
}

export const getProductsBasedOnCategory = (
  CATEGORY_ID = '239',
  PAGE_INDEX = 0
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  return Axios.get(
    `http://api.apollopharmacy.in/apollo_api.php?category_id=${CATEGORY_ID}&page_id=${PAGE_INDEX}&type=category`
  );
};

export const getProductDetails = (PRODUCT_SKU: string) => {
  return Axios.get(
    `http://api.apollopharmacy.in/apollo_api.php?sku=${PRODUCT_SKU}&type=product_desc`
  );
};
