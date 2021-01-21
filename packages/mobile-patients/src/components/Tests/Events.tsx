import {
  g,
  postAppsFlyerEvent,
  postWebEngageEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';

export const firePurchaseEvent = (orderId: string, grandTotal: number, cartItems: any) => {
  let items: any = [];
  cartItems.forEach((item, index) => {
    let itemObj: any = {};
    itemObj.item_name = item.name; // Product Name or Doctor Name
    itemObj.item_id = item.id; // Product SKU or Doctor ID
    itemObj.price = item.specialPrice ? item.specialPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
    itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
    itemObj.item_category = 'Diagnostics'; // 'Pharmacy' or 'Consultations'
    itemObj.item_category2 = ''; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
    itemObj.item_variant = item.collectionMethod; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
    itemObj.index = index + 1; // Item sequence number in the list
    itemObj.quantity = 1; // "1" or actual quantity
    items.push(itemObj);
  });
  const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
    currency: 'INR',
    items: items,
    transaction_id: orderId,
    value: Number(grandTotal),
    LOB: 'Diagnostics',
  };
  console.log('eventAttributes >>', eventAttributes);
  const appsFlyerAttributes: AppsFlyerEvents[AppsFlyerEventName.PURCHASE] = {
    currency: 'INR',
    items: items,
    transaction_id: orderId,
    af_revenue: Number(grandTotal),
  };
  console.log('appsFlyerAttributes >>', appsFlyerAttributes);
  postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PURCHASE, appsFlyerAttributes);
};
