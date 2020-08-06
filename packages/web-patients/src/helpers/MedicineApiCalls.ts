import axios, { AxiosError } from 'axios';

const apiDetails = {
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  service_url: process.env.PHARMACY_SERVICE_AVAILABILITY,
};

export interface MedicineProduct {
  MaxOrderQty: number;
  url_key: string;
  description: string;
  id: number;
  image: any;
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
  category_id: string;
}
export interface Brand {
  url_key: string;
  category_id: string;
  image_url: number;
  title: string;
}
export type Doseform = 'TABLET' | 'INJECTION' | 'SYRUP' | '';

export interface PharmaOverview {
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

export enum ProductCategory {
  HOT_SELLERS = '1174',
}

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
export interface MedicinePageSection {
  url_key: string;
  category_id: string;
  title: string;
  image_url: string;
}
export interface DealsOfTheDaySection {
  url_key: string;
  category_id: string;
  image_url: string;
  position: number;
}
interface OfferBannerSection {
  category_url_key: string;
  name: string;
  status: '0' | '1';
  image: string; // full url
  sku_url_key: string;
  start_time: string; // '2019-02-10 01:21:00';
  end_time: string;
}

export interface MedicinePageAPiResponse {
  monsoon_essentials: { products: MedicineProduct[] };
  mainbanners: OfferBannerSection[];
  mainbanners_desktop: OfferBannerSection[];
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

export const checkServiceAvailability = (zipCode: string) => {
  return axios.post(
    apiDetails.service_url || '',
    {
      postalcode: zipCode || '',
      skucategory: [
        {
          SKU: 'PHARMA',
        },
      ],
    },
    {
      headers: {
        Authorization: apiDetails.authToken,
      },
    }
  );
};
