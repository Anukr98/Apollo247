import { AppRoutes } from "@aph/mobile-patients/src/components/NavigatorContainer";
import { AddToCartSource, PharmacyCircleEvent } from "@aph/mobile-patients/src/components/ShoppingCartProvider";
import { GetCurrentPatients_getCurrentPatients_patients } from "@aph/mobile-patients/src/graphql/types/GetCurrentPatients";
import { saveCart_saveCart_data_medicineOrderCartLineItems } from "@aph/mobile-patients/src/graphql/types/saveCart";
import { availabilityApi247 } from "@aph/mobile-patients/src/helpers/apiCalls";
import { CleverTapEventName, CleverTapEvents } from "@aph/mobile-patients/src/helpers/CleverTapEvents";
import { postAppsFlyerAddToCartEvent, postCleverTapEvent, postFirebaseAddToCartEvent, postwebEngageAddToCartEvent, postWebEngageEvent } from "@aph/mobile-patients/src/helpers/helperFunctions";
import { WebEngageEventName, WebEngageEvents } from "@aph/mobile-patients/src/helpers/webEngageEvents";
import moment from "moment";
import { NavigationActions } from "react-navigation";

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
  const outOfStockMsg = 'Sorry, this item is out of stock in your area.';

  const navigate = () => {
    NavigationActions.navigate({
      routeName: AppRoutes.ProductDetailPage,
      params: {
        sku: cartItem?.sku,
        urlKey: cartItem?.urlKey,
        deliveryError: outOfStockMsg,
      }
    });
  };

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

  if (!isLocationServeiceable) {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE] = {
      'product name': cartItem?.name,
      'product id': cartItem?.sku,
      pincode: pincode,
      'Mobile Number': currentPatient?.mobileNumber,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_TO_CART_NONSERVICEABLE, eventAttributes);
    navigate();
    return;
  }

  availabilityApi247(pincode, cartItem.id)
    .then((res) => {
      const availability = res?.data?.response?.[0]?.exist;
      if (availability) {
        addToCartEvents();
      } else {
        navigate();
      }
      try {
        const { mrp, exist, qty } = res.data.response[0];
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED] = {
          Source: 'Add_Display',
          Input_SKU: cartItem?.sku,
          Input_Pincode: pincode,
          Input_MRP: cartItem.price,
          No_of_items_in_the_cart: 1,
          Response_Exist: exist ? 'Yes' : 'No',
          Response_MRP: mrp,
          Response_Qty: qty,
          'Cart Items': JSON.stringify(itemsInCart) || '',
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_AVAILABILITY_API_CALLED, eventAttributes);
      } catch (error) { }
    })
    .catch(() => {
      addToCartEvents();
    })
    .finally(() => {
      setAddToCartSource?.(null);
    })
};

export const reviewCartPageViewClevertapEvent = (
  pincode: string,
  tatDayOne: string,
  shippingCharges: number,
  toPay: number,
  isPrescriptionRequired: boolean,
  appliedCoupon: string,
  isCircleMember: boolean,
  prescriptionOption: string,
  userType: string,
  mobileNumber: string,
  circleMembershipValue?: number,
  tatDayTwo?: string,
) => {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CART_REVIEW_ORDER_PAGE_VIEWED] = {
      Pincode: pincode,
      TAT_1_Day: moment(tatDayOne).diff(new Date(), 'd'),
      TAT_1_Hour: moment(tatDayOne).format('hh:mm a'),
      TAT_2_Day: moment(tatDayTwo).diff(new Date(), 'd'),
      TAT_2_Hour: moment(tatDayTwo).format('hh:mm a'),
      Shipping_Charges: shippingCharges,
      Amount_To_Pay: toPay,
      Prescription_Required: isPrescriptionRequired ? 'Yes' : 'No',
      Prescription_Option_Selected: prescriptionOption,
      Coupon_Applied: appliedCoupon,
      Circle_Member: isCircleMember ? 'Yes' : 'No',
      Circle_Membership_Value: circleMembershipValue,
      User_Type: userType,
      User_Mobile_Number: mobileNumber,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CART_REVIEW_ORDER_PAGE_VIEWED, eventAttributes);
  } catch (e) {}
}
