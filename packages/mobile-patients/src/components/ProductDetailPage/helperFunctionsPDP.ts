import { ProductPageViewedEventProps } from "@aph/mobile-patients/src/components/ProductDetailPage/ProductDetailPage";
import { PharmacyCircleEvent } from "@aph/mobile-patients/src/components/ShoppingCartProvider";
import { pharmaSubstitution_pharmaSubstitution_substitutes } from "@aph/mobile-patients/src/graphql/types/pharmaSubstitution";
import { saveCart_saveCart_data_medicineOrderCartLineItems } from "@aph/mobile-patients/src/graphql/types/saveCart";
import { AppsFlyerEventName } from "@aph/mobile-patients/src/helpers/AppsFlyerEvents";
import { CleverTapEventName, CleverTapEvents } from "@aph/mobile-patients/src/helpers/CleverTapEvents";
import { FirebaseEventName } from "@aph/mobile-patients/src/helpers/firebaseEvents";
import { 
  getCleverTapCircleMemberValues, 
  postCleverTapEvent, 
  postWebEngageEvent, 
  postAppsFlyerEvent,
  postFirebaseEvent 
} from "@aph/mobile-patients/src/helpers/helperFunctions";
import { WebEngageEventName, WebEngageEvents } from "@aph/mobile-patients/src/helpers/webEngageEvents";
import { AppConfig } from "@aph/mobile-patients/src/strings/AppConfig";
import moment from "moment";

type PharmacyTatApiCalled =
| WebEngageEvents[WebEngageEventName.PHARMACY_TAT_API_CALLED]
| CleverTapEvents[CleverTapEventName.PHARMACY_TAT_API_CALLED];

export const onNotifyMeClickPDP = (isPharmacyPincodeServiceable: boolean, medicineDetails: any, pincode: string) => {
  const serviceableYesNo = isPharmacyPincodeServiceable ? 'Yes' : 'No';
  const eventAttributes: WebEngageEvents[WebEngageEventName.NOTIFY_ME] = {
    'product name': medicineDetails?.name,
    'product id': medicineDetails?.sku,
    'category ID': medicineDetails?.category_id,
    price: medicineDetails?.price,
    pincode: pincode,
    serviceable: serviceableYesNo,
  };
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_NOTIFY_ME] = {
    'Product name': medicineDetails?.name,
    'SKU ID': medicineDetails?.sku,
    'Category ID': medicineDetails?.category_id || '',
    Price: medicineDetails?.price,
    Pincode: pincode,
    Serviceability: serviceableYesNo,
  };
  postCleverTapEvent(CleverTapEventName.PHARMACY_NOTIFY_ME, cleverTapEventAttributes);
  postWebEngageEvent(WebEngageEventName.NOTIFY_ME, eventAttributes);
};

export const getItemQuantity = (id: string, serverCartItems: saveCart_saveCart_data_medicineOrderCartLineItems[]) => {
  const foundItem = serverCartItems?.find((item) => item.sku == id);
  return foundItem ? foundItem.quantity : 0;
};

export const fireTatApiCalledEvent = (
  response: any,
  latitude: string,
  longitude: string,
  currentPincode: string,
  serverCartItems: saveCart_saveCart_data_medicineOrderCartLineItems[],
  medicineDetails: any,
  setTatEventData: (eventAttributes: PharmacyTatApiCalled) => void,
  sku: string
) => {
  try {
    const item = response.items[0];
    const eventAttributes: PharmacyTatApiCalled = {
      Source: 'PDP',
      Input_SKU: sku,
      Input_qty: getItemQuantity(sku, serverCartItems) || 1,
      Input_lat: latitude,
      Input_long: longitude,
      Input_pincode: currentPincode,
      Input_MRP: medicineDetails?.price, // overriding this value after PDP API call
      No_of_items_in_the_cart: serverCartItems?.length,
      Response_Exist: item.exist ? 'Yes' : 'No',
      Response_MRP: item.mrp, // overriding this value after PDP API call
      Response_Qty: item.qty,
      Response_lat: response.lat,
      Response_lng: response.lng,
      Response_ordertime: response.ordertime,
      Response_pincode: `${response.pincode}`,
      Response_storeCode: response.storeCode,
      Response_storeType: response.storeType,
      Response_tat: response.tat,
      Response_tatU: response.tatU,
    };
    setTatEventData(eventAttributes);
  } catch (error) {}
};

export const fireProductDetailPincodeCheckEvent = (
  currentPincode: string,
  deliveryDate: any,
  pinCodeNotServiceable: boolean,
  medicineDetails: any,
  currentPatient: any,
) => {
  try {
    const currentDate = moment();
    const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK] = {
      'product id': medicineDetails?.sku,
      'product name': medicineDetails?.name,
      pincode: Number(currentPincode),
      'customer id': currentPatient?.id || '',
      'Delivery TAT': moment(
        deliveryDate,
        AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT
      ).diff(currentDate, 'd'),
      Serviceable: pinCodeNotServiceable ? 'No' : 'Yes',
    };
    postWebEngageEvent(WebEngageEventName.PRODUCT_DETAIL_PINCODE_CHECK, eventAttributes);
  } catch (error) {}
};

export const postProductPageViewedEvent = (
  pincode: string, 
  isProductInStock: boolean, 
  movedFrom: string, 
  medicineDetails: any,
  productPageViewedEventProps: ProductPageViewedEventProps | undefined,
  pharmacyCircleAttributes: PharmacyCircleEvent | null,
  userType: string,
  isPharmacyPincodeServiceable: boolean,
  deliveryTime: string,
  cashback: number,
  multiVariantAttributes: any[],
  productSubstitutes: pharmaSubstitution_pharmaSubstitution_substitutes | null,
  circleID: string,
  circleMembershipCharges: number,
) => {
  if (movedFrom) {
    const {
      sku,
      name,
      type_id,
      sell_online,
      MaxOrderQty,
      price,
      special_price,
      category_id,
      subcategory,
    } = medicineDetails;
    const stock_availability =
      sell_online == 0 ? 'Not for Sale' : !!isProductInStock ? 'Yes' : 'No';
    let eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED] = {
      source: movedFrom,
      ProductId: sku?.toUpperCase(),
      ProductName: name,
      Stockavailability: stock_availability,
      ...productPageViewedEventProps,
      ...pharmacyCircleAttributes,
      User_Type: userType,
      Pincode: pincode,
      serviceable: isPharmacyPincodeServiceable ? 'Yes' : 'No',
      TATDay: deliveryTime ? moment(deliveryTime).diff(moment(), 'days') : null,
      TatHour: deliveryTime ? moment(deliveryTime).diff(moment(), 'hours') : null,
      TatDateTime: deliveryTime,
      ProductType: type_id,
      MaxOrderQuantity: MaxOrderQty,
      MRP: price,
      SpecialPrice: special_price || null,
      CircleCashback: cashback,
      isMultiVariant: multiVariantAttributes?.length ? 1 : 0,
    };
    let multiVariantArray = [];
    if (!!medicineDetails?.multi_variants_products) {
      multiVariantArray = Object.keys(medicineDetails?.multi_variants_products?.products);
    }
    let cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_PRODUCT_PAGE_VIEWED] = {
      'Nav src': movedFrom,
      'SKU ID': sku?.toUpperCase(),
      'Product name': name,
      'Stock availability': stock_availability,
      'Category ID': category_id || undefined,
      'Category name': productPageViewedEventProps?.CategoryName || undefined,
      'Section name': productPageViewedEventProps?.SectionName || undefined,
      'Circle member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Circle membership value':
        pharmacyCircleAttributes?.['Circle Membership Value'] || undefined,
      'User type': userType || undefined,
      Pincode: pincode,
      Serviceability: isPharmacyPincodeServiceable ? 'Yes' : 'No',
      'TAT day': deliveryTime ? moment(deliveryTime).diff(moment(), 'days') : undefined,
      'TAT hour': deliveryTime ? moment(deliveryTime).diff(moment(), 'hours') : undefined,
      'TAT date time': deliveryTime || undefined,
      'Product type': type_id || undefined,
      'Max order quantity': MaxOrderQty,
      MRP: price,
      'Special price': special_price || undefined,
      'Circle Cashback': Number(cashback) || 0,
      'Sub category': subcategory || '',
    };

    let appsFlyerEvents = {
      af_country: 'India',
      source: movedFrom,
      af_content_id: sku?.toUpperCase(),
      af_content: name,
      Stockavailability: stock_availability,
      ...productPageViewedEventProps,
      ...pharmacyCircleAttributes,
      User_Type: userType,
      Pincode: pincode,
      serviceable: isPharmacyPincodeServiceable ? 'Yes' : 'No',
      TATDay: deliveryTime ? moment(deliveryTime).diff(moment(), 'days') : null,
      TatHour: deliveryTime ? moment(deliveryTime).diff(moment(), 'hours') : null,
      TatDateTime: deliveryTime,
      ProductType: type_id,
      MaxOrderQuantity: MaxOrderQty,
      MRP: price,
      SpecialPrice: special_price || undefined,
      'Circle cashback': Number(cashback) || 0,
      SubCategory: subcategory || '',
      'Multivariants available': multiVariantArray?.length > 0 ? 'Yes' : 'No',
      'No of variants': multiVariantArray?.length > 0 ? multiVariantArray?.length : null,
      'Substitutes available':
        productSubstitutes?.length > 0 ? 'Yes' : 'No',
      'No of substitutes':
        productSubstitutes?.length > 0 ? productSubstitutes.length : null,
    };

    if (movedFrom === 'deeplink') {
      eventAttributes['Circle Membership Added'] = circleID
        ? 'Existing'
        : !!circleMembershipCharges
        ? 'Yes'
        : 'No';
      appsFlyerEvents['Circle Membership Added'] = circleID
        ? 'Existing'
        : !!circleMembershipCharges
        ? 'Yes'
        : 'No';
      eventAttributes['CategoryID'] = category_id;
      appsFlyerEvents['CategoryID'] = category_id;
      cleverTapEventAttributes['Circle Member'] = circleID
        ? 'Existing'
        : !!circleMembershipCharges
        ? 'Added'
        : 'Not Added';
    }
    postCleverTapEvent(CleverTapEventName.PHARMACY_PRODUCT_PAGE_VIEWED, cleverTapEventAttributes);
    postWebEngageEvent(WebEngageEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, appsFlyerEvents);
    postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
  }
};
