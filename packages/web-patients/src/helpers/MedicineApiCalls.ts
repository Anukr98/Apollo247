import axios, { AxiosError, AxiosResponse } from 'axios';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails as OrderDetails } from 'graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { MedicineCartItem, EPrescription } from 'components/MedicinesCartProvider';
import moment from 'moment';
import { getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails as LatestOrderDetailsType } from 'graphql/types/getLatestMedicineOrder';
import fetchUtil from 'helpers/fetch';

const apiDetails = {
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  service_url: process.env.PHARMACY_SERVICE_AVAILABILITY,
  cartItemDetails: process.env.PHARMACY_MED_CART_ITEM_DETAILS,
  medicineDetails: process.env.PHARMACY_MED_PROD_DETAIL_URL,
};

export interface MedicineProduct {
  MaxOrderQty: number;
  url_key: string;
  description: string;
  id: number;
  image: string[] | null;
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
  sell_online: boolean;
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
  similar_products: MedicineProduct[];
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
  return axios.get(`${process.env.INVENTORY_SYNC_URL}/serviceable?pincode=${zipCode}`, {
    headers: {
      Authorization: process.env.INVENTORY_SYNC_TOKEN,
      'Content-Type': 'application/json',
    },
  });
};

export const checkSkuAvailability = (sku: string, pincode: string) => {
  return axios.get(`${process.env.INVENTORY_SYNC_URL}/availability?sku=${sku}&pincode=${pincode}`, {
    headers: {
      Authorization: process.env.INVENTORY_SYNC_TOKEN,
      'Content-Type': 'application/json',
    },
  });
};

export const checkTatAvailability = (items: Items[], pincode: string, lat: string, lng: string) => {
  return axios.post(
    `${process.env.INVENTORY_SYNC_URL}/tat`,
    {
      items,
      pincode,
      lat,
      lng,
    },
    {
      headers: {
        Authorization: process.env.INVENTORY_SYNC_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );
};

export interface Items {
  sku: string;
  qty: number;
}

export interface MedicineOrderBilledItem {
  itemId: string;
  itemName: string;
  batchId: string;
  issuedQty: number;
  mou: number;
  mrp: number;
}

export interface MedCartItemsDetailsResponse {
  productdp: MedicineProduct[];
}

const medCartItemsDetailsApi = (
  itemIds: string[]
): Promise<AxiosResponse<MedCartItemsDetailsResponse>> => {
  return axios.post(
    apiDetails.cartItemDetails,
    {
      params: itemIds.toString(),
    },
    {
      headers: {
        Authorization: apiDetails.authToken,
      },
    }
  );
};

export const reOrderItems = async (
  orderDetails: OrderDetails | LatestOrderDetailsType,
  type: string,
  patientName: string
) => {
  // postReorderMedicines(source, currentPatient);
  // use billedItems for delivered orders
  if (orderDetails) {
    const billedItems =
      orderDetails.medicineOrderShipments &&
      orderDetails.medicineOrderShipments[0] &&
      orderDetails.medicineOrderShipments[0].medicineOrderInvoice &&
      orderDetails.medicineOrderShipments[0].medicineOrderInvoice[0] &&
      orderDetails.medicineOrderShipments[0].medicineOrderInvoice[0].itemDetails;
    const billedLineItems = billedItems
      ? (JSON.parse(billedItems) as MedicineOrderBilledItem[])
      : null;

    const isOfflineOrder = orderDetails.billNumber;

    const lineItems = orderDetails.medicineOrderLineItems || [];
    const lineItemsSkus = billedLineItems
      ? billedLineItems
          .filter((item: MedicineOrderBilledItem) => item.itemId)
          .map((item) => item.itemId)
      : lineItems.filter((item) => item.medicineSKU).map((item) => item.medicineSKU!);

    const lineItemsDetails = (await medCartItemsDetailsApi(lineItemsSkus)).data.productdp.filter(
      (lineItem) => lineItem.sku && lineItem.name
    );
    const availableLineItemsSkus = lineItemsDetails.map((lineItem) => lineItem.sku);
    const cartItemsToAdd = lineItemsDetails.map(
      (item, index) =>
        item.sku &&
        ({
          ...item,
          description: '',
          image: [],
          mou: isOfflineOrder
            ? Math.ceil(lineItems[index].price / lineItems[index].mrp / lineItems[index].quantity)
            : item.mou,
          quantity: Math.ceil(
            (billedLineItems ? billedLineItems[index].issuedQty : lineItems[index].quantity) || 1
          ),
          isShippable: true,
        } as MedicineCartItem)
    );
    const unAvailableItems =
      availableLineItemsSkus && billedLineItems
        ? billedLineItems
            .filter((item) => !availableLineItemsSkus.includes(item.itemId))
            .map((item) => item.itemName)
        : lineItems
            .filter((item) => !availableLineItemsSkus.includes(item.medicineSKU))
            .map((item) => item.medicineName);

    // Prescriptions
    const prescriptionUrls = (orderDetails.prescriptionImageUrl || '')
      .split(',')
      .map((item) => item.trim())
      .filter((v) => v);
    const medicineNames = (billedLineItems
      ? billedLineItems.filter((item) => item.itemName).map((item) => item.itemName)
      : lineItems.filter((item) => item.medicineName).map((item) => item.medicineName)
    ).join(',');
    const prescriptionsToAdd = prescriptionUrls.map(
      (item) =>
        ({
          id: item,
          date: moment().format('DD MMM YYYY'),
          doctorName: `Meds Rx ${(orderDetails.id &&
            orderDetails.id.substring(0, orderDetails.id.indexOf('-'))) ||
            ''}`,
          forPatient: patientName,
          medicines: medicineNames,
          uploadedUrl: item,
        } as EPrescription)
    );

    return {
      items: cartItemsToAdd || [],
      unAvailableItems,
      prescriptions: prescriptionsToAdd || [],
      totalItemsCount: lineItems.length,
      unavailableItemsCount: unAvailableItems.length,
    };
  }
};

export const getMedicineDetailsApi = (
  productSku: string
): Promise<AxiosResponse<MedicineProductDetailsResponse>> => {
  return axios.post(
    apiDetails.medicineDetails,
    { params: productSku },
    {
      headers: {
        Authorization: apiDetails.authToken,
      },
    }
  );
};
