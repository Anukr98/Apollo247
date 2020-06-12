import { MEDICINE_UNIT } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import Axios, { AxiosResponse, Canceler } from 'axios';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';

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
export type Doseform =
  | 'TABLET'
  | 'INJECTION'
  | 'SYRUP'
  | 'DROPS'
  | 'CAPSULE'
  | 'BOTTLE'
  | 'SUSPENSION'
  | 'ROTACAPS'
  | 'SACHET'
  | 'POWDER'
  | 'CREAM'
  | 'SOAP'
  | 'GEL'
  | 'LOTION'
  | 'SPRAY'
  | 'SOLUTION'
  | 'OINTMENT'
  | '';

interface PharmaOverview {
  generic: string;
  Doseform: MEDICINE_UNIT | '';
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

let cancelSearchMedicineApi: Canceler | undefined;

export const searchMedicineApi = (
  searchText: string
): Promise<AxiosResponse<MedicineProductsResponse>> => {
  const CancelToken = Axios.CancelToken;
  cancelSearchMedicineApi && cancelSearchMedicineApi();
  return Axios.post(
    `${AppConfig.Configuration.APOLLO_BASE_URL}/popcsrchss_api.php`,
    { params: searchText },
    {
      headers: {
        Authorization: AppConfig.Configuration.APOLLO_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      cancelToken: new CancelToken((c) => {
        // An executor function receives a cancel function as a parameter
        cancelSearchMedicineApi = c;
      }),
    }
  );
};

export const getMedicineDetailsApi = (
  productSku: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return Axios.post(
    `${AppConfig.Configuration.APOLLO_BASE_URL}/popcsrchpdp_api.php`,
    { params: productSku },
    {
      headers: {
        Authorization: AppConfig.Configuration.APOLLO_AUTH_TOKEN,
      },
    }
  );
};
