import Axios, { AxiosResponse } from 'axios';

const AUTH_TOKEN = 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms';

export interface MedicineProductsResponse {
  product_count: number;
  products: MedicineProduct[];
}

export interface MedicineProduct {
  description: string;
  id: number;
  image: string;
  is_in_stock: boolean;
  is_prescription_required: string; //1 for  required
  name: string;
  price: number;
  sku: string;
  small_image: string;
  status: string; //1, 2
  thumbnail: string;
  type_id: string;
}

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
