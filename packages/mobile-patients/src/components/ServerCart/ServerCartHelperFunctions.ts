import { AppRoutes } from "@aph/mobile-patients/src/components/NavigatorContainer";
import { AddToCartSource, PharmacyCircleEvent } from "@aph/mobile-patients/src/components/ShoppingCartProvider";
import { GetCurrentPatients_getCurrentPatients_patients } from "@aph/mobile-patients/src/graphql/types/GetCurrentPatients";
import { saveCart_saveCart_data_medicineOrderCartLineItems } from "@aph/mobile-patients/src/graphql/types/saveCart";
import { availabilityApi247 } from "@aph/mobile-patients/src/helpers/apiCalls";
import { postAppsFlyerAddToCartEvent, postFirebaseAddToCartEvent, postwebEngageAddToCartEvent, postWebEngageEvent } from "@aph/mobile-patients/src/helpers/helperFunctions";
import { WebEngageEventName, WebEngageEvents } from "@aph/mobile-patients/src/helpers/webEngageEvents";
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