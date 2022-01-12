import { AddToCartSource, PharmacyCircleEvent } from "@aph/mobile-patients/src/components/ShoppingCartProvider";
import { GetCurrentPatients_getCurrentPatients_patients } from "@aph/mobile-patients/src/graphql/types/GetCurrentPatients";
import { saveCart_saveCart_data_medicineOrderCartLineItems } from "@aph/mobile-patients/src/graphql/types/saveCart";
import { CleverTapEventName, CleverTapEvents } from "@aph/mobile-patients/src/helpers/CleverTapEvents";
import { postAppsFlyerAddToCartEvent, postCleverTapEvent, postFirebaseAddToCartEvent, postwebEngageAddToCartEvent, postWebEngageEvent } from "@aph/mobile-patients/src/helpers/helperFunctions";
import { WebEngageEventName, WebEngageEvents } from "@aph/mobile-patients/src/helpers/webEngageEvents";

export const addPharmaItemToCart = (
  cartItem: saveCart_saveCart_data_medicineOrderCartLineItems,
  pincode: string,
  currentPatient: GetCurrentPatients_getCurrentPatients_patients,
  isLocationServeiceable: boolean,
  otherInfo: AddToCartSource,
  itemsInCart?: string,
  pharmacyCircleAttributes?: PharmacyCircleEvent,
  setAddToCartSource?: () => void,
) => {
  try {
    const addToCartEvents = () => {
      postwebEngageAddToCartEvent(
        {
          sku: cartItem?.sku,
          name: cartItem?.name,
          price: cartItem?.price,
          special_price: cartItem?.sellingPrice,
          category_id: otherInfo?.categoryId,
        },
        otherInfo?.source,
        otherInfo?.section,
        otherInfo?.categoryName,
        pharmacyCircleAttributes!
      );
      postFirebaseAddToCartEvent(
        {
          sku: cartItem?.sku,
          name: cartItem?.name,
          price: cartItem?.price,
          special_price: cartItem?.sellingPrice,
          category_id: otherInfo?.categoryId,
        },
        otherInfo?.source,
        otherInfo?.section,
        '',
        pharmacyCircleAttributes!
      );
      postAppsFlyerAddToCartEvent(
        {
          sku: cartItem?.sku,
          name: cartItem?.name,
          price: cartItem?.price,
          special_price: cartItem?.sellingPrice,
          category_id: otherInfo?.categoryId,
        },
        currentPatient?.id,
        pharmacyCircleAttributes!
      );
    };
    addToCartEvents();
    setAddToCartSource?.(null);
    if (!isLocationServeiceable) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE] = {
        'product name': cartItem?.name,
        'product id': cartItem?.sku,
        pincode: pincode,
        'Mobile Number': currentPatient?.mobileNumber,
      };
      postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE, eventAttributes);
    }
  } catch(error) {}
};

export const reviewCartPageViewClevertapEvent = (
  pincode: string,
  shippingCharges: number,
  toPay: number,
  isPrescriptionRequired: boolean,
  appliedCoupon: string,
  isCircleMember: boolean,
  prescriptionOption: string,
  userType: string,
  mobileNumber: string,
  shipmentInfo: object[], 
  circleMembershipValue?: number,
) => {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CART_REVIEW_ORDER_PAGE_VIEWED] = {
      Pincode: pincode,
      Shipping_Charges: shippingCharges,
      Amount_To_Pay: toPay,
      Prescription_Required: isPrescriptionRequired ? 'Yes' : 'No',
      Prescription_Option_Selected: prescriptionOption,
      Coupon_Applied: appliedCoupon,
      Circle_Member: isCircleMember ? 'Yes' : 'No',
      Circle_Membership_Value: circleMembershipValue,
      User_Type: userType,
      User_Mobile_Number: mobileNumber,
      Shipment: JSON.stringify(shipmentInfo) || '',
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CART_REVIEW_ORDER_PAGE_VIEWED, eventAttributes);
  } catch (e) {}
}
