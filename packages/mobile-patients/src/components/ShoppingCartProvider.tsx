import {
  MEDICINE_DELIVERY_TYPE,
  MedicineOrderShipmentInput,
  MedicineCartOMSItem,
  PrescriptionType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Store, GetStoreInventoryResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { validatePharmaCoupon_validatePharmaCoupon } from '@aph/mobile-patients/src/graphql/types/validatePharmaCoupon';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { addToCartTagalysEvent } from '@aph/mobile-patients/src/helpers/Tagalys';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface ShoppingCartItem {
  id: string;
  name: string;
  mou: string; // Minimum order unit (eg. 10 tablets)
  quantity: number;
  maxOrderQty: number;
  price: number;
  prescriptionRequired: boolean;
  thumbnail: string | null;
  specialPrice?: number;
  couponPrice?: number;
  isInStock: boolean;
  unserviceable?: boolean;
  unavailableOnline?: boolean; // sell_online
  isMedicine: string;
  productType?: 'FMCG' | 'Pharma' | 'PL';
  isFreeCouponProduct?: boolean;
  applicable?: boolean;
  circleCashbackAmt?: number;
  url_key?: string;
}

export interface CouponProducts {
  categoryId: any;
  discountAmt: number;
  mrp: number;
  onMrp: boolean;
  quantity: number;
  sku: string;
  specialPrice: number;
  subCategoryId: any;
  couponFree: number;
  applicable?: boolean;
}

export interface PhysicalPrescription {
  title: string;
  fileType: string;
  base64: string;
  uploadedUrl?: string;
  prismPrescriptionFileId?: string;
}

export interface EPrescription {
  id: string;
  uploadedUrl: string;
  forPatient: string;
  date: string;
  medicines: string;
  fileName?: string;
  doctorName: string;
  prismPrescriptionFileId: string;
  message?: string;
  healthRecord?: boolean;
}

export interface PharmaCoupon extends validatePharmaCoupon_validatePharmaCoupon {
  coupon: string;
  message?: string;
  discount: number;
  valid: boolean;
  reason: String;
  freeDelivery: boolean;
  products: [];
}

export interface CartProduct {
  sku: string;
  categoryId: any;
  subCategoryId: any;
  mrp: number;
  specialPrice: number;
  quantity: number;
  discountAmt: number;
  onMrp: boolean;
  couponFree?: number;
  applicable?: boolean;
}

export interface CircleCashbackData {
  FMCG: number | null;
  PL: number | null;
  PHARMA: number | null;
}
export interface onHold {
  id: string;
  itemName?: string;
}

export interface circleValidity {
  startDate: Date;
  endDate: Date;
}

export type EPrescriptionDisableOption = 'CAMERA_AND_GALLERY' | 'E-PRESCRIPTION' | 'NONE';
export interface PharmacyCircleEvent {
  'Circle Membership Added': 'Yes' | 'No' | 'Existing';
  'Circle Membership Value': number | null;
}

export interface BreadcrumbLink {
  title: string;
  onPress?: () => void;
}

export interface ShoppingCartContextProps {
  cartItems: ShoppingCartItem[];
  setCartItems: ((items: ShoppingCartItem[]) => void) | null;
  addCartItem: ((item: ShoppingCartItem) => void) | null;
  addMultipleCartItems: ((items: ShoppingCartItem[]) => void) | null;
  removeCartItem: ((itemId: ShoppingCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<ShoppingCartItem> & { id: ShoppingCartItem['id'] }) => void)
    | null;
  getCartItemQty: (id: string) => number;
  cartTotal: number;
  cartTotalCashback: number;
  cartDiscountTotal: number; //consider the special price or price
  cartTotalOfRxProducts: number;
  couponDiscount: number;
  couponProducts: CouponProducts[];
  setCouponProducts: ((items: CouponProducts[]) => void) | null;
  productDiscount: number;
  deliveryCharges: number;
  packagingCharges: number;
  grandTotal: number;
  isValidCartValue: boolean;
  uploadPrescriptionRequired: boolean;
  prescriptionType: PrescriptionType | null;
  setPrescriptionType: (type: PrescriptionType | null) => void;
  isFreeDelivery: boolean;
  setIsFreeDelivery: ((value: boolean) => void) | null;
  circleCashback: CircleCashbackData | null;
  setCircleCashback: ((items: CircleCashbackData) => void) | null;
  isCircleSubscription: boolean;
  setIsCircleSubscription: ((value: boolean) => void) | null;
  circleMembershipCharges: number;
  setCircleMembershipCharges: ((value: number) => void) | null;
  circleSubPlanId: string;
  setCircleSubPlanId: ((id: string) => void) | null;
  showPrescriptionAtStore: boolean;
  setShowPrescriptionAtStore: ((value: boolean) => void) | null;
  stores: Store[];
  setStores: ((store: Store[]) => void) | null;
  storesInventory: GetStoreInventoryResponse[];
  setStoresInventory: ((store: GetStoreInventoryResponse[]) => void) | null;
  ePrescriptions: EPrescription[];
  addEPrescription: ((item: EPrescription) => void) | null;
  addMultipleEPrescriptions: ((items: EPrescription[]) => void) | null;
  setEPrescriptions: ((items: EPrescription[]) => void) | null;
  removeEPrescription: ((id: EPrescription['id']) => void) | null;
  addPhysicalPrescription: ((item: PhysicalPrescription) => void) | null;
  setPhysicalPrescriptions: ((items: PhysicalPrescription[]) => void) | null;
  updatePhysicalPrescription:
    | ((
        itemUpdates: Partial<PhysicalPrescription> & { base64: PhysicalPrescription['base64'] }
      ) => void)
    | null;
  removePhysicalPrescription: ((base64: string) => void) | null;
  physicalPrescriptions: PhysicalPrescription[];
  consultProfile: GetCurrentPatients_getCurrentPatients_patients | null;
  setConsultProfile: (profile: GetCurrentPatients_getCurrentPatients_patients | null) => void;

  addAddress: ((address: savePatientAddress_savePatientAddress_patientAddress) => void) | null;
  deliveryAddressId: string;
  setDeliveryAddressId: ((id: string) => void) | null;
  deliveryTime: string;
  setdeliveryTime: ((date: string) => void) | null;
  newAddressAdded: string;
  setNewAddressAdded: ((id: string) => void) | null;
  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  setAddresses:
    | ((addresses: savePatientAddress_savePatientAddress_patientAddress[]) => void)
    | null;
  storeId: string;
  setStoreId: ((id: string) => void) | null;
  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;
  coupon: PharmaCoupon | null;
  setCoupon: ((coupon: PharmaCoupon | null) => void) | null;
  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearCartInfo: (() => void) | null;
  hdfcPlanName: string;
  setHdfcPlanName: ((id: string) => void) | null;
  isProuctFreeCouponApplied: boolean;
  circleSubscriptionId: string;
  setCircleSubscriptionId: ((id: string) => void) | null;
  isCircleExpired: boolean;
  setIsCircleExpired: ((expired: boolean) => void) | null;
  circlePlanSelected: any;
  setCirclePlanSelected: ((plan: any) => void) | null;
  selectDefaultPlan: ((plan: any) => void) | null;
  defaultCirclePlan: any;
  setDefaultCirclePlan: ((plan: any) => void) | null;
  onHoldOptionOrder: onHold[];
  setOnHoldOptionOrder: ((items: onHold[]) => void) | null;
  autoCirlcePlanAdded: boolean;
  setAutoCirlcePlanAdded: ((planAdded: boolean) => void) | null;
  showCircleSubscribed: boolean;
  hdfcSubscriptionId: string;
  setHdfcSubscriptionId: ((id: string) => void) | null;
  corporateSubscription: boolean;
  setCorporateSubscription: (id: boolean) => void;
  circlePlanValidity: circleValidity | null;
  setCirclePlanValidity: ((validity: circleValidity) => void) | null;
  circlePaymentReference: any;
  setCirclePaymentReference: ((payment: any) => void) | any;
  pharmacyCircleAttributes: PharmacyCircleEvent | null;
  pdpBreadCrumbs: BreadcrumbLink[];
  setPdpBreadCrumbs: ((items: BreadcrumbLink[]) => void) | null;
  orders: any;
  setOrders: ((orders: any[]) => void) | null;
  shipments: (MedicineOrderShipmentInput | null)[];
  asyncPincode: any;
  setAsyncPincode: ((pincode: any) => void) | null;
  minimumCartValue: number;
  setMinimumCartValue: ((value: number) => void) | null;
  minCartValueForCOD: number;
  setMinCartValueForCOD: ((value: number) => void) | null;
  maxCartValueForCOD: number;
  setMaxCartValueForCOD: ((value: number) => void) | null;
  nonCodSKus: string[];
  setNonCodSKus: ((items: string[]) => void) | null;
  cartPriceNotUpdateRange: number;
  setCartPriceNotUpdateRange: ((value: number) => void) | null;
  pdpDisclaimerMessage: string;
  setPdpDisclaimerMessage: ((message: string) => void) | null;
}

export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  cartItems: [],
  setCartItems: null,
  addCartItem: null,
  addMultipleCartItems: null,
  removeCartItem: null,
  updateCartItem: null,
  getCartItemQty: () => 0,
  cartTotal: 0,
  cartTotalCashback: 0,
  cartDiscountTotal: 0,
  cartTotalOfRxProducts: 0,
  couponDiscount: 0,
  productDiscount: 0,
  deliveryCharges: 0,
  packagingCharges: 0,
  grandTotal: 0,
  isValidCartValue: true,
  uploadPrescriptionRequired: false,
  prescriptionType: null,
  setPrescriptionType: () => {},
  couponProducts: [],
  setCouponProducts: null,
  ePrescriptions: [],
  addEPrescription: null,
  addMultipleEPrescriptions: null,
  setEPrescriptions: null,
  removeEPrescription: null,
  setPhysicalPrescriptions: null,
  addPhysicalPrescription: null,
  updatePhysicalPrescription: null,
  removePhysicalPrescription: null,
  physicalPrescriptions: [],
  consultProfile: null,
  setConsultProfile: () => {},

  stores: [],
  setStores: null,
  storesInventory: [],
  setStoresInventory: null,
  isFreeDelivery: false,
  setIsFreeDelivery: null,
  circleCashback: null,
  setCircleCashback: null,
  isCircleSubscription: false,
  setIsCircleSubscription: null,
  circleMembershipCharges: 0,
  setCircleMembershipCharges: null,
  circleSubPlanId: '',
  setCircleSubPlanId: null,
  showPrescriptionAtStore: false,
  setShowPrescriptionAtStore: null,
  pinCode: '',
  setPinCode: null,
  addresses: [],
  setAddresses: null,
  addAddress: null,
  coupon: null,
  setCoupon: null,
  deliveryAddressId: '',
  setDeliveryAddressId: null,
  newAddressAdded: '',
  setNewAddressAdded: null,
  storeId: '',
  setStoreId: null,
  deliveryType: null,
  clearCartInfo: null,
  hdfcPlanName: '',
  setHdfcPlanName: null,
  isProuctFreeCouponApplied: false,
  circleSubscriptionId: '',
  setCircleSubscriptionId: null,
  isCircleExpired: false,
  setIsCircleExpired: null,
  circlePlanSelected: null,
  setCirclePlanSelected: null,
  selectDefaultPlan: null,
  defaultCirclePlan: null,
  setDefaultCirclePlan: null,
  onHoldOptionOrder: [],
  setOnHoldOptionOrder: null,
  deliveryTime: '',
  setdeliveryTime: null,
  autoCirlcePlanAdded: false,
  setAutoCirlcePlanAdded: null,
  showCircleSubscribed: false,
  hdfcSubscriptionId: '',
  setHdfcSubscriptionId: null,
  corporateSubscription: false,
  setCorporateSubscription: null,
  circlePlanValidity: null,
  setCirclePlanValidity: null,
  circlePaymentReference: null,
  setCirclePaymentReference: null,
  pharmacyCircleAttributes: null,
  pdpBreadCrumbs: [],
  setPdpBreadCrumbs: null,
  orders: [],
  setOrders: null,
  shipments: [],
  asyncPincode: null,
  setAsyncPincode: null,
  minimumCartValue: 0,
  setMinimumCartValue: null,
  minCartValueForCOD: 0,
  setMinCartValueForCOD: null,
  maxCartValueForCOD: 0,
  setMaxCartValueForCOD: null,
  nonCodSKus: [],
  setNonCodSKus: null,
  cartPriceNotUpdateRange: 0,
  setCartPriceNotUpdateRange: null,
  pdpDisclaimerMessage: '',
  setPdpDisclaimerMessage: null,
});

const AsyncStorageKeys = {
  cartItems: 'cartItems',
  ePrescriptions: 'ePrescriptions',
  physicalPrescriptions: 'physicalPrescriptions',
  onHoldOptionOrder: 'onHoldItems',
};

const showGenericAlert = (message: string) => {
  Alert.alert('Uh oh.. :(', message);
};

export const ShoppingCartProvider: React.FC = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [cartItems, _setCartItems] = useState<ShoppingCartContextProps['cartItems']>([]);
  const [couponDiscount, setCouponDiscount] = useState<ShoppingCartContextProps['couponDiscount']>(
    0
  );
  const [prescriptionType, setPrescriptionType] = useState<
    ShoppingCartContextProps['prescriptionType']
  >(null);
  const [productDiscount, setProductDiscount] = useState<
    ShoppingCartContextProps['productDiscount']
  >(0);
  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storesInventory, setStoresInventory] = useState<GetStoreInventoryResponse[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    ShoppingCartContextProps['deliveryAddressId']
  >('');
  const [newAddressAdded, _setNewAddedAddress] = useState<
    ShoppingCartContextProps['newAddressAdded']
  >('');
  const [deliveryTime, setdeliveryTime] = useState<ShoppingCartContextProps['deliveryTime']>('');
  const [storeId, _setStoreId] = useState<ShoppingCartContextProps['storeId']>('');
  const [coupon, setCoupon] = useState<ShoppingCartContextProps['coupon']>(null);
  const [deliveryType, setDeliveryType] = useState<ShoppingCartContextProps['deliveryType']>(null);
  const [hdfcPlanName, _setHdfcPlanName] = useState<ShoppingCartContextProps['hdfcPlanName']>('');
  const [circleSubscriptionId, setCircleSubscriptionId] = useState<
    ShoppingCartContextProps['circleSubscriptionId']
  >('');
  const [isCircleExpired, setIsCircleExpired] = useState<
    ShoppingCartContextProps['isCircleExpired']
  >(false);
  const [circlePlanSelected, setCirclePlanSelected] = useState<
    ShoppingCartContextProps['circlePlanSelected']
  >(null);
  const [defaultCirclePlan, setDefaultCirclePlan] = useState<
    ShoppingCartContextProps['defaultCirclePlan']
  >(null);
  const [autoCirlcePlanAdded, setAutoCirlcePlanAdded] = useState<
    ShoppingCartContextProps['autoCirlcePlanAdded']
  >(false);
  const [circlePlanValidity, setCirclePlanValidity] = useState<
    ShoppingCartContextProps['circlePlanValidity']
  >(null);

  const showCircleSubscribed =
    circleSubscriptionId || (!autoCirlcePlanAdded && circlePlanSelected && !defaultCirclePlan);

  const [isFreeDelivery, setIsFreeDelivery] = useState<ShoppingCartContextProps['isFreeDelivery']>(
    false
  );

  const [circleCashback, _setCircleCashback] = useState<ShoppingCartContextProps['circleCashback']>(
    null
  );
  const [isCircleSubscription, setIsCircleSubscription] = useState<
    ShoppingCartContextProps['isCircleSubscription']
  >(false);
  const [circleMembershipCharges, setCircleMembershipCharges] = useState<
    ShoppingCartContextProps['circleMembershipCharges']
  >(0);
  const [circleSubPlanId, setCircleSubPlanId] = useState<
    ShoppingCartContextProps['circleSubPlanId']
  >('');

  const [showPrescriptionAtStore, setShowPrescriptionAtStore] = useState<
    ShoppingCartContextProps['showPrescriptionAtStore']
  >(false);

  const [couponProducts, _setCouponProducts] = useState<ShoppingCartContextProps['couponProducts']>(
    []
  );

  const [onHoldOptionOrder, _setOnHoldOptionOrder] = useState<
    ShoppingCartContextProps['onHoldOptionOrder']
  >([]);

  const [physicalPrescriptions, _setPhysicalPrescriptions] = useState<
    ShoppingCartContextProps['physicalPrescriptions']
  >([]);

  const [ePrescriptions, _setEPrescriptions] = useState<ShoppingCartContextProps['ePrescriptions']>(
    []
  );

  const [hdfcSubscriptionId, setHdfcSubscriptionId] = useState<
    ShoppingCartContextProps['hdfcSubscriptionId']
  >('');
  const [corporateSubscription, setCorporateSubscription] = useState<
    ShoppingCartContextProps['corporateSubscription']
  >(false);
  const [circlePaymentReference, setCirclePaymentReference] = useState<
    ShoppingCartContextProps['circlePaymentReference']
  >();

  const [pdpBreadCrumbs, setPdpBreadCrumbs] = useState<
    ShoppingCartContextProps['pdpBreadCrumbs']
  >();

  const [consultProfile, setConsultProfile] = useState<ShoppingCartContextProps['consultProfile']>(
    null
  );

  const [minimumCartValue, setMinimumCartValue] = useState<
    ShoppingCartContextProps['minimumCartValue']
  >(0);
  const [minCartValueForCOD, setMinCartValueForCOD] = useState<
    ShoppingCartContextProps['minCartValueForCOD']
  >(0);
  const [maxCartValueForCOD, setMaxCartValueForCOD] = useState<
    ShoppingCartContextProps['maxCartValueForCOD']
  >(0);
  const [cartPriceNotUpdateRange, setCartPriceNotUpdateRange] = useState<
    ShoppingCartContextProps['cartPriceNotUpdateRange']
  >(0);
  const [nonCodSKus, setNonCodSKus] = useState<ShoppingCartContextProps['nonCodSKus']>([]);
  const [asyncPincode, setAsyncPincode] = useState<ShoppingCartContextProps['asyncPincode']>();

  const [isProuctFreeCouponApplied, setisProuctFreeCouponApplied] = useState<boolean>(false);
  const [orders, setOrders] = useState<ShoppingCartContextProps['orders']>([]);
  const [shipments, setShipments] = useState<ShoppingCartContextProps['shipments']>([]);
  const setEPrescriptions: ShoppingCartContextProps['setEPrescriptions'] = (items) => {
    _setEPrescriptions(items);
  };

  const [pdpDisclaimerMessage, setPdpDisclaimerMessage] = useState<
    ShoppingCartContextProps['pdpDisclaimerMessage']
  >('');

  const setPhysicalPrescriptions: ShoppingCartContextProps['setPhysicalPrescriptions'] = (
    items
  ) => {
    _setPhysicalPrescriptions(items);
  };

  const addEPrescription: ShoppingCartContextProps['addEPrescription'] = (itemToAdd) => {
    if (ePrescriptions.find((item) => item.id == itemToAdd.id)) {
      return;
    }
    const newItems = [...ePrescriptions, itemToAdd];
    setEPrescriptions(newItems);
  };

  const addMultipleEPrescriptions: ShoppingCartContextProps['addMultipleEPrescriptions'] = (
    itemsToAdd
  ) => {
    const existingFilteredEPres = ePrescriptions.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    const updatedEPres = [...existingFilteredEPres, ...itemsToAdd];
    setEPrescriptions(updatedEPres);
  };

  const setCartItems: ShoppingCartContextProps['setCartItems'] = (cartItems) => {
    if (cartItems.length) {
      // calculate circle cashback
      cartItems.forEach((item) => {
        const finalPrice = item.specialPrice
          ? item.price - item.specialPrice
            ? item.specialPrice
            : item.price
          : item.price;
        let cashback = 0;
        const type_id = item?.productType?.toUpperCase();
        if (!!circleCashback && !!circleCashback[type_id]) {
          cashback = finalPrice * item.quantity * (circleCashback[type_id] / 100);
        }
        item.circleCashbackAmt = cashback || 0;
      });
    }
    _setCartItems(cartItems);
    AsyncStorage.setItem(AsyncStorageKeys.cartItems, JSON.stringify(cartItems)).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  const addCartItem: ShoppingCartContextProps['addCartItem'] = (itemToAdd) => {
    if (cartItems.find((item) => item.id == itemToAdd.id)) {
      return;
    }
    addToCartTagalysEvent(
      { sku: itemToAdd.id, quantity: itemToAdd.quantity },
      g(currentPatient, 'id')
    );
    const newCartItems = [itemToAdd, ...cartItems];
    setCartItems(newCartItems);
  };

  const addMultipleCartItems: ShoppingCartContextProps['addMultipleCartItems'] = (itemsToAdd) => {
    // If tried to add same items (by id) which already exists in the cart, it will update with new values like quantity.
    const existingFilteredCartItems = cartItems.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    const newCartItems = [
      ...existingFilteredCartItems,
      ...itemsToAdd.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i),
    ];
    newCartItems.forEach((i) =>
      addToCartTagalysEvent({ sku: i.id, quantity: i.quantity }, g(currentPatient, 'id'))
    );
    setCartItems(newCartItems);
  };

  const removeCartItem: ShoppingCartContextProps['removeCartItem'] = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id);
    const newCartTotal = newCartItems.reduce(
      (currTotal, currItem) =>
        currTotal +
        currItem.quantity *
          (typeof currItem.specialPrice !== 'undefined' ? currItem.specialPrice : currItem.price),
      0
    );
    if (newCartTotal <= 0) {
      setCartItems([]);
    } else {
      setCartItems(newCartItems);
    }
  };
  const updateCartItem: ShoppingCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      addToCartTagalysEvent(
        { sku: cartItems[foundIndex].id, quantity: itemUpdates.quantity || 1 },
        g(currentPatient, 'id')
      );
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      const newCartTotal = cartItems.reduce(
        (currTotal, currItem) =>
          currTotal +
          currItem.quantity *
            (typeof currItem.specialPrice !== 'undefined'
              ? currItem.isFreeCouponProduct && currItem.quantity === 1
                ? 0
                : currItem.specialPrice
              : currItem.price),
        0
      );
      if (newCartTotal <= 0) {
        setCartItems([]);
      } else {
        setCartItems([...cartItems]);
      }
    }
  };

  const getCartItemQty: ShoppingCartContextProps['getCartItemQty'] = (id) =>
    cartItems.find(({ id: cId }) => cId == id)?.quantity || 0;

  const setCouponProducts: ShoppingCartContextProps['setCouponProducts'] = (items) => {
    _setCouponProducts(items);
  };

  const setOnHoldOptionOrder: ShoppingCartContextProps['setOnHoldOptionOrder'] = (items) => {
    const addOnHoldItems = [...onHoldOptionOrder, ...items];
    _setOnHoldOptionOrder(addOnHoldItems);
    AsyncStorage.setItem(
      AsyncStorageKeys.onHoldOptionOrder,
      JSON.stringify(addOnHoldItems)
    ).catch(() => {});
  };

  const cartTotal: ShoppingCartContextProps['cartTotal'] = parseFloat(
    cartItems
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const cartDiscountTotal: ShoppingCartContextProps['cartDiscountTotal'] = parseFloat(
    cartItems
      .reduce(
        (currTotal, currItem) =>
          currTotal + currItem.quantity * (currItem?.specialPrice! || currItem.price),
        0
      )
      .toFixed(2)
  );

  const setCircleCashback: ShoppingCartContextProps['setCircleCashback'] = (circleCashback) => {
    _setCircleCashback(circleCashback);
  };

  const cartTotalCashback: ShoppingCartContextProps['cartTotalCashback'] = parseFloat(
    cartItems?.reduce((cbTotal, currItem) => cbTotal + currItem?.circleCashbackAmt!, 0)?.toFixed(2)
  );

  const cartTotalOfRxProducts: ShoppingCartContextProps['cartTotalOfRxProducts'] = parseFloat(
    cartItems
      .filter((currItem) => currItem.prescriptionRequired == true)
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const deliveryCharges =
    isFreeDelivery ||
    deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP ||
    isCircleSubscription ||
    circleMembershipCharges ||
    hdfcPlanName === string.Hdfc_values.PLATINUM_PLAN
      ? 0
      : cartTotal > 0 &&
        cartTotal - productDiscount - couponDiscount <
          AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY
      ? AppConfig.Configuration.DELIVERY_CHARGES
      : 0;

  const packagingCharges = isCircleSubscription
    ? 0
    : cartTotal > 0 &&
      cartTotal - productDiscount - couponDiscount <
        AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_PACKAGING
    ? AppConfig.Configuration.PACKAGING_CHARGES
    : 0;

  const getGrandTotalFromShipments = () => {
    let total = 0;
    shipments.forEach((item: any) => (total = total + item.estimatedAmount));
    if (circleMembershipCharges) {
      total += circleMembershipCharges;
    }
    return total;
  };

  const grandTotal = shipments?.length
    ? getGrandTotalFromShipments()
    : parseFloat(
        (
          cartTotal +
          packagingCharges +
          deliveryCharges -
          couponDiscount -
          productDiscount +
          (!!circleMembershipCharges ? circleMembershipCharges : 0)
        ).toFixed(2)
      );

  const isValidCartValue =
    !!minimumCartValue &&
    deliveryAddressId &&
    addresses?.length &&
    grandTotal &&
    grandTotal !== deliveryCharges
      ? grandTotal >= minimumCartValue
      : true;

  const uploadPrescriptionRequired =
    cartItems.findIndex((item) => item.prescriptionRequired) != -1 ||
    !!physicalPrescriptions.length ||
    !!ePrescriptions.length;

  const addAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setAddresses([address, ...addresses]);
  };

  const setStoreId = (id: ShoppingCartContextProps['storeId']) => {
    setDeliveryType(id ? MEDICINE_DELIVERY_TYPE.STORE_PICKUP : null);
    _setStoreId(id);
    _setDeliveryAddressId('');
  };

  const setDeliveryAddressId = (id: ShoppingCartContextProps['deliveryAddressId']) => {
    setDeliveryType(id ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY : null);
    _setDeliveryAddressId(id);
    _setStoreId('');
  };

  const setHdfcPlanName = (plan: ShoppingCartContextProps['hdfcPlanName']) => {
    _setHdfcPlanName(plan);
  };

  const setNewAddressAdded = (id: ShoppingCartContextProps['newAddressAdded']) => {
    _setNewAddedAddress(id);
  };

  const addPhysicalPrescription: ShoppingCartContextProps['addPhysicalPrescription'] = (item) => {
    setPhysicalPrescriptions([item, ...physicalPrescriptions]);
  };

  const updatePhysicalPrescription: ShoppingCartContextProps['updatePhysicalPrescription'] = (
    itemUpdates
  ) => {
    const foundIndex = physicalPrescriptions.findIndex((item) => item.title == itemUpdates.title);
    if (foundIndex !== -1) {
      physicalPrescriptions[foundIndex] = { ...physicalPrescriptions[foundIndex], ...itemUpdates };
      setPhysicalPrescriptions([...physicalPrescriptions]);
    }
  };

  const removePhysicalPrescription: ShoppingCartContextProps['removePhysicalPrescription'] = (
    title
  ) => {
    const newItems = physicalPrescriptions.filter((item) => item.title !== title);
    setPhysicalPrescriptions([...newItems]);
  };

  const removeEPrescription: ShoppingCartContextProps['removeEPrescription'] = (id) => {
    const newItems = ePrescriptions.filter((item) => item.id !== id);
    setEPrescriptions([...newItems]);
  };

  const clearCartInfo = () => {
    setPhysicalPrescriptions([]);
    setEPrescriptions([]);
    setCartItems([]);
    setDeliveryAddressId('');
    setNewAddressAdded('');
    setStoreId('');
    setPinCode('');
    setStores([]);
    setAddresses([]);
    setCoupon(null);
    setCouponProducts([]);
    setHdfcPlanName('');
    setdeliveryTime('');
    setPrescriptionType(null);
    setConsultProfile(null);
  };

  useEffect(() => {
    orders?.length ? updateShipments() : setDefaultShipment();
  }, [orders, coupon, cartItems, deliveryCharges, grandTotal]);

  function updateShipments() {
    let shipmentsArray: (MedicineOrderShipmentInput | null)[] = [];
    orders?.forEach((order: any) => {
      let shipment: MedicineOrderShipmentInput | null = {};
      const sku = order?.items?.map((item: any) => item?.sku);
      let shipmentCouponDiscount = 0;
      let shipmentProductDiscount = 0;
      let shipmentTotal = 0;
      let shipmentCashback = 0;
      const items: (MedicineCartOMSItem | null)[] = cartItems
        ?.map((item) => {
          if (sku.includes(item?.id)) {
            const discountedPrice = formatNumber(
              coupon && item.couponPrice == 0
                ? 0
                : (coupon && item.couponPrice) || item.specialPrice || item.price
            );

            shipmentCouponDiscount = shipmentCouponDiscount + getShipmentCouponDiscount(item);
            shipmentProductDiscount = shipmentProductDiscount + getShipmentProductDiscount(item);
            shipmentTotal = shipmentTotal + formatNumber(item?.price * item?.quantity);
            shipmentCashback += item?.circleCashbackAmt;
            return {
              medicineSKU: item?.id,
              medicineName: item?.name,
              quantity: item?.quantity,
              mrp: formatNumber(item?.price),
              price: discountedPrice,
              specialPrice: Number(item?.specialPrice || item?.price),
              itemValue: formatNumber(item?.price * item?.quantity), // (multiply MRP with quantity)
              itemDiscount: formatNumber(
                item?.price * item?.quantity - discountedPrice * item?.quantity
              ), // (diff of (MRP - discountedPrice) * quantity)
              isPrescriptionNeeded: item?.prescriptionRequired ? 1 : 0,
              mou: Number(item?.mou),
              isMedicine: item?.isMedicine?.toString(),
              couponFree: item?.isFreeCouponProduct ? 1 : 0,
            } as MedicineCartOMSItem;
          }
        })
        .filter((item) => item);
      let shipmentDeliveryfee = orders?.length ? deliveryCharges / orders?.length : 0;
      let shipmentPackagingfee = orders?.length ? packagingCharges / orders?.length : 0;
      let estimatedAmount =
        shipmentTotal +
        shipmentDeliveryfee +
        shipmentPackagingfee -
        shipmentCouponDiscount -
        shipmentProductDiscount;
      shipment['shopId'] = order['storeCode'];
      shipment['tatType'] = order['storeType'];
      shipment['estimatedAmount'] = formatNumber(estimatedAmount);
      shipment['deliveryCharges'] = shipmentDeliveryfee;
      shipment['orderTat'] = order['tat'];
      shipment['couponDiscount'] = formatNumber(shipmentCouponDiscount);
      shipment['productDiscount'] = formatNumber(shipmentProductDiscount);
      shipment['packagingCharges'] = shipmentPackagingfee;
      shipment['storeDistanceKm'] = order['distance'];
      shipment['items'] = items;
      shipment['tatCity'] = order['tatCity'];
      shipment['tatHours'] = order['tatDuration'];
      shipment['allocationProfileName'] = order['allocationProfileName'];
      shipment['clusterId'] = order['clusterId'];
      shipment['totalCashBack'] =
        !coupon?.coupon && (isCircleSubscription || circleSubscriptionId)
          ? Number(shipmentCashback) || 0
          : 0;
      shipmentsArray.push(shipment);
      shipment['coupon'] = coupon ? coupon.coupon : '';
    });
    setShipments(shipmentsArray);
  }

  function setDefaultShipment() {
    let shipment: MedicineOrderShipmentInput | null = {};
    let shipmentCouponDiscount = 0;
    let shipmentProductDiscount = 0;
    let shipmentTotal = 0;
    let shipmentCashback = 0;
    const items: (MedicineCartOMSItem | null)[] = cartItems
      ?.map((item) => {
        const discountedPrice = formatNumber(
          coupon && item.couponPrice == 0
            ? 0
            : (coupon && item.couponPrice) || item.specialPrice || item.price
        );

        shipmentCouponDiscount = shipmentCouponDiscount + getShipmentCouponDiscount(item);
        shipmentProductDiscount = shipmentProductDiscount + getShipmentProductDiscount(item);
        shipmentTotal = shipmentTotal + formatNumber(item?.price * item?.quantity);
        shipmentCashback += item?.circleCashbackAmt;
        return {
          medicineSKU: item?.id,
          medicineName: item?.name,
          quantity: item?.quantity,
          mrp: formatNumber(item?.price),
          price: discountedPrice,
          specialPrice: Number(item?.specialPrice || item?.price),
          itemValue: formatNumber(item?.price * item?.quantity), // (multiply MRP with quantity)
          itemDiscount: formatNumber(
            item?.price * item?.quantity - discountedPrice * item?.quantity
          ), // (diff of (MRP - discountedPrice) * quantity)
          isPrescriptionNeeded: item?.prescriptionRequired ? 1 : 0,
          mou: Number(item?.mou),
          isMedicine: item?.isMedicine?.toString(),
          couponFree: item?.isFreeCouponProduct ? 1 : 0,
        } as MedicineCartOMSItem;
      })
      .filter((item) => item);
    let estimatedAmount =
      shipmentTotal +
      deliveryCharges +
      packagingCharges -
      shipmentCouponDiscount -
      shipmentProductDiscount;
    shipment['estimatedAmount'] = formatNumber(estimatedAmount);
    shipment['deliveryCharges'] = deliveryCharges;
    shipment['couponDiscount'] = formatNumber(shipmentCouponDiscount);
    shipment['productDiscount'] = formatNumber(shipmentProductDiscount);
    shipment['packagingCharges'] = packagingCharges;
    shipment['items'] = items;
    shipment['orderTat'] = null;
    shipment['shopId'] = null;
    shipment['tatType'] = null;
    shipment['storeDistanceKm'] = 0;
    shipment['tatCity'] = null;
    shipment['tatHours'] = null;
    shipment['allocationProfileName'] = null;
    shipment['clusterId'] = null;
    shipment['totalCashBack'] =
      !coupon?.coupon && (isCircleSubscription || circleSubscriptionId)
        ? Number(shipmentCashback) || 0
        : 0;
    shipment['coupon'] = coupon ? coupon.coupon : '';
    setShipments([shipment]);
  }

  const getShipmentProductDiscount = (item: ShoppingCartItem) => {
    let discount = 0;
    let quantity = item.quantity;
    if (!!item.isFreeCouponProduct) {
      quantity = 1; // one free product
      discount = item.price * quantity;
    } else if (item.price != item.specialPrice) {
      discount = (item?.price - (item?.specialPrice || item?.price)) * quantity;
    }
    return discount;
  };

  const getShipmentCouponDiscount = (item: ShoppingCartItem) => {
    let discount = 0;
    discount = !!item.isFreeCouponProduct
      ? 0
      : formatNumber(
          item?.quantity *
            (item?.couponPrice || item?.couponPrice == 0
              ? (item?.specialPrice || item?.price) - item?.couponPrice
              : 0)
        );
    return discount;
  };

  useEffect(() => {
    // update cart items from async storage the very first time app opened
    const updateCartItemsFromStorage = async () => {
      try {
        const cartItemsFromStorage = await AsyncStorage.multiGet([
          AsyncStorageKeys.cartItems,
          AsyncStorageKeys.onHoldOptionOrder,
        ]);
        const cartItems = cartItemsFromStorage[0][1];
        const showOnHoldOptions = cartItemsFromStorage[1][1];

        _setCartItems(JSON.parse(cartItems || 'null') || []);
        _setOnHoldOptionOrder(JSON.parse(showOnHoldOptions || 'null') || []);
      } catch (error) {
        CommonBugFender('ShoppingCartProvider_updateCartItemsFromStorage_try', error);
        showGenericAlert('Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  function formatNumber(value: number | string) {
    return Number(Number(value).toFixed(2));
  }

  const getDiscountPrice = (cartItem: ShoppingCartItem, lineItems: CartProduct[]) => {
    const foundItem = lineItems.find((item) => item.sku == cartItem.id);
    return foundItem && foundItem.discountAmt != 0
      ? foundItem.onMrp
        ? formatNumber(foundItem!.discountAmt) >
          formatNumber(foundItem!.mrp - foundItem!.specialPrice)
          ? foundItem.mrp - foundItem.discountAmt
          : undefined
        : foundItem.specialPrice - foundItem.discountAmt
      : undefined;
  };

  const getApplicable = (cartItem: ShoppingCartItem, lineItems: CartProduct[]) => {
    const foundItem = lineItems.find((item) => item.sku == cartItem.id);
    return foundItem ? foundItem?.applicable : false;
  };
  useEffect(() => {
    // updating coupon discount here on update in cart or new coupon code applied
    if (cartTotal == 0) {
      setCouponDiscount(0);
      setProductDiscount(0);
      setCoupon(null);
      setCouponProducts([]);
      return;
    }
    const productDiscount =
      cartItems.reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0) -
      cartItems.reduce(
        (currTotal, currItem) =>
          currTotal + currItem.quantity * (currItem.specialPrice || currItem.price),
        0
      );

    if (coupon) {
      isProductFreeCoupon(coupon.products);
      let couponDiscount: number = coupon?.discount;
      if (
        couponDiscount != 0 &&
        Number(couponDiscount) - Number(deductProductDiscount(coupon.products)) > 0.1
      ) {
        setCouponDiscount(
          Number(couponDiscount) - Number(deductProductDiscount(coupon.products)) || 0
        );
        setProductDiscount(getProductDiscount(coupon.products) || 0);
        setCartItems(
          cartItems.map((item) => ({
            ...item,
            couponPrice: getDiscountPrice(item, coupon.products),
            applicable: getApplicable(item, coupon.products),
          }))
        );
      } else {
        setCouponDiscount(0);
        setProductDiscount(getProductDiscount(coupon.products) || 0);
        setCartItems(
          cartItems.map((item) => ({
            ...item,
            couponPrice: undefined,
          }))
        );
      }
    } else {
      setCouponDiscount(0);
      setProductDiscount(productDiscount);
      setCartItems(
        cartItems
          .filter((item) => !item?.isFreeCouponProduct)
          .map((item) => ({ ...item, couponPrice: undefined }))
      );
      setCouponProducts!([]);
      setisProuctFreeCouponApplied(false);
    }
  }, [cartTotal, coupon]);

  const deductProductDiscount = (products: CartProduct[]) => {
    let discount = 0;
    products &&
      products.forEach((item) => {
        if (item.mrp != item.specialPrice && item.onMrp) {
          discount = discount + (item.mrp - item.specialPrice) * item.quantity;
        }
      });
    return Number(discount).toFixed(2);
  };

  const getProductDiscount = (products: CartProduct[]) => {
    let discount = 0;
    products &&
      products.forEach((item) => {
        let quantity = item.quantity;
        if (!!item.couponFree) {
          quantity = 1; // one free product
          discount = discount + item.mrp * quantity;
        } else if (item.mrp != item.specialPrice) {
          discount = discount + (item.mrp - item.specialPrice) * quantity;
        }
      });
    return discount;
  };

  function isProductFreeCoupon(lineItems: CartProduct[]) {
    const foundItem = lineItems.find((item) => item.couponFree == 1);
    foundItem ? setisProuctFreeCouponApplied(true) : setisProuctFreeCouponApplied(false);
  }
  useEffect(() => {
    // updating prescription here on update in cart items
    if (cartTotalOfRxProducts == 0) {
      physicalPrescriptions.length > 0 && setPhysicalPrescriptions([]);
      ePrescriptions.length > 0 && setEPrescriptions([]);
    }
  }, [cartTotalOfRxProducts]);

  useEffect(() => {
    // updating I will show the prescription at the store option on change in address
    if (deliveryAddressId) {
      setShowPrescriptionAtStore(false);
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (physicalPrescriptions?.length || ePrescriptions?.length) {
      setPrescriptionType(PrescriptionType.UPLOADED);
    }
  }, [physicalPrescriptions, ePrescriptions]);

  const selectDefaultPlan = (plan: any) => {
    const defaultPlan = plan?.filter((item: any) => item.defaultPack === true);
    if (defaultPlan?.length > 0) {
      setDefaultCirclePlan(defaultPlan[0]);
    }
  };

  const pharmacyCircleAttributes: PharmacyCircleEvent = {
    'Circle Membership Added': circleSubscriptionId
      ? 'Existing'
      : !!circleMembershipCharges
      ? 'Yes'
      : 'No',
    'Circle Membership Value': circleSubscriptionId
      ? circlePaymentReference?.purchase_via_HC
        ? circlePaymentReference?.HC_used
        : circlePaymentReference?.amount_paid
      : !!circleMembershipCharges
      ? circlePlanSelected?.currentSellingPrice
      : null,
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addCartItem,
        addMultipleCartItems,
        removeCartItem,
        updateCartItem,
        getCartItemQty,
        cartTotal, // MRP Total
        cartTotalCashback,
        cartTotalOfRxProducts,
        cartDiscountTotal, //discounted or price total
        grandTotal,
        isValidCartValue,
        couponDiscount,
        productDiscount,
        deliveryCharges,
        packagingCharges,
        uploadPrescriptionRequired,
        prescriptionType,
        setPrescriptionType,

        couponProducts,
        setCouponProducts,
        ePrescriptions,
        addEPrescription,
        addMultipleEPrescriptions,
        removeEPrescription,
        setEPrescriptions,
        consultProfile,
        setConsultProfile,

        physicalPrescriptions,
        setPhysicalPrescriptions,
        addPhysicalPrescription,
        updatePhysicalPrescription,
        removePhysicalPrescription,
        addresses,
        setAddresses,
        addAddress,
        deliveryAddressId,
        setDeliveryAddressId,
        newAddressAdded,
        setNewAddressAdded,
        stores,
        setStores,
        storesInventory,
        setStoresInventory,
        storeId,
        setStoreId,
        isFreeDelivery,
        setIsFreeDelivery,
        circleCashback,
        setCircleCashback,
        isCircleSubscription,
        setIsCircleSubscription,
        circleMembershipCharges,
        setCircleMembershipCharges,
        circleSubPlanId,
        setCircleSubPlanId,
        showPrescriptionAtStore,
        setShowPrescriptionAtStore,
        pinCode,
        setPinCode,
        coupon,
        setCoupon,
        deliveryType,
        clearCartInfo,
        hdfcPlanName,
        setHdfcPlanName,
        isProuctFreeCouponApplied,
        circleSubscriptionId,
        setCircleSubscriptionId,
        circlePlanSelected,
        isCircleExpired,
        setIsCircleExpired,
        setCirclePlanSelected,
        selectDefaultPlan,
        defaultCirclePlan,
        setDefaultCirclePlan,
        onHoldOptionOrder,
        setOnHoldOptionOrder,
        deliveryTime,
        setdeliveryTime,
        autoCirlcePlanAdded,
        setAutoCirlcePlanAdded,
        showCircleSubscribed,
        hdfcSubscriptionId,
        setHdfcSubscriptionId,
        corporateSubscription,
        setCorporateSubscription,
        circlePlanValidity,
        setCirclePlanValidity,
        circlePaymentReference,
        setCirclePaymentReference,
        pharmacyCircleAttributes,
        pdpBreadCrumbs,
        setPdpBreadCrumbs,
        orders,
        setOrders,
        shipments,
        asyncPincode,
        setAsyncPincode,
        minimumCartValue,
        setMinimumCartValue,
        minCartValueForCOD,
        setMinCartValueForCOD,
        maxCartValueForCOD,
        setMaxCartValueForCOD,
        nonCodSKus,
        setNonCodSKus,
        cartPriceNotUpdateRange,
        setCartPriceNotUpdateRange,
        pdpDisclaimerMessage,
        setPdpDisclaimerMessage,
      }}
    >
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => useContext<ShoppingCartContextProps>(ShoppingCartContext);
