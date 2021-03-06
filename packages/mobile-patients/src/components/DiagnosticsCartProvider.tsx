import {
  MEDICINE_DELIVERY_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  EPrescription,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { checkPatientAge } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ITEM_GENDER } from '@aph/mobile-patients/src/components/Tests/utils/helpers';

export interface orderList
  extends getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList {}
export interface DiagnosticsCartItem {
  id: string;
  name: string;
  mou: number;
  price: number; //mrp
  thumbnail: string | null;
  gender?: DIAGNOSTIC_ITEM_GENDER | string;
  specialPrice?: number | null; //price
  circlePrice?: number | null; //mrp
  circleSpecialPrice?: number | null; //price
  discountPrice?: number | null; //mrp
  discountSpecialPrice?: number | null; //price
  collectionMethod: TEST_COLLECTION_TYPE;
  groupPlan?: string;
  packageMrp?: number;
  inclusions?: any[];
  isSelected?: boolean;
  parameterCount?: number;
}
export interface DiagnosticPatientCartItem {
  patientId: string;
  cartItems: DiagnosticsCartItem[];
}
export interface DiagnosticSlot {
  slotStartTime: string;
  slotEndTime: string;
  date: number; // timestamp
  selectedDate?: any;
  isPaidSlot: boolean;
  internalSlots: (string | null)[] | null;
  distanceCharges?: number;
}
export interface DiagnnoticSlots {
  slotDisplayTime: string;
  internalSlots: string;
  date: number;
  isPaidSlot: boolean;
}
export interface AddressServiceability {
  cityID: number;
  stateID: number;
}
export interface DiagnosticArea {
  key: number | string;
  value: string;
}
export interface TestBreadcrumbLink {
  title: string;
  onPress?: () => void;
}
export interface DiagnosticsCartContextProps {
  forPatientId: string;
  setPatientId: ((id: string) => void) | null;

  cartItems: DiagnosticsCartItem[];
  setCartItems: ((items: DiagnosticsCartItem[]) => void) | null;
  addCartItem: ((item: DiagnosticsCartItem) => void) | null;
  addMultipleCartItems: ((items: DiagnosticsCartItem[]) => void) | null;
  removeCartItem: ((itemId: DiagnosticsCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<DiagnosticsCartItem> & { id: DiagnosticsCartItem['id'] }) => void)
    | null;

  patientCartItems: DiagnosticPatientCartItem[];
  setPatientCartItems: ((items: DiagnosticPatientCartItem[]) => void) | null;
  addPatientCartItem: ((patientId: string, cartItems: DiagnosticsCartItem[]) => void) | null;
  removePatientCartItem: ((patientId: string, itemId?: DiagnosticsCartItem['id']) => void) | null;
  updatePatientCartItem: ((itemUpdates: any) => void) | null;
  removeMultiPatientCartItems: ((itemId?: DiagnosticsCartItem['id']) => void) | null;
  removePatientItem: ((patientId: string) => void) | null;
  removeDuplicatePatientCartItems: ((patientId: string, cartItemIds: number[]) => void) | null;

  cartTotal: number;
  totalPriceExcludingAnyDiscounts: number;
  cartSaving: number;
  normalSaving: number;
  discountSaving: number;
  circleSaving: number;
  deliveryCharges: number;
  temporaryCartSaving: number;
  temporaryNormalSaving: number;
  hcCharges: number;
  setHcCharges: ((id: number) => void) | null;

  modifyHcCharges: number;
  setModifyHcCharges: ((id: number) => void) | null;

  grandTotal: number;
  circleGrandTotal: number; //if circle is not applied

  uploadPrescriptionRequired: boolean;

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

  addAddress: ((address: savePatientAddress_savePatientAddress_patientAddress) => void) | null;
  deliveryAddressId: string;
  setDeliveryAddressId: ((id: string) => void) | null;
  deliveryAddressCityId: string;
  setDeliveryAddressCityId: ((id: string) => void) | null;
  deliveryAddressStateId: string;
  setDeliveryAddressStateId: ((id: string) => void) | null;

  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  setAddresses:
    | ((addresses: savePatientAddress_savePatientAddress_patientAddress[]) => void)
    | null;

  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;

  coupon: any | null;
  setCoupon: ((value: any) => void) | null;

  couponDiscount: number;
  setCouponDiscount: ((value: number) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearDiagnoticCartInfo: (() => void) | null;

  diagnosticSlot: DiagnosticSlot | null;
  setDiagnosticSlot: ((item: DiagnosticSlot | null) => void) | null;

  isDiagnosticCircleSubscription: boolean;
  setIsDiagnosticCircleSubscription: ((value: boolean) => void) | null;

  showSelectPatient: boolean;
  setShowSelectPatient: ((value: boolean) => void) | null;

  testListingBreadCrumbs: TestBreadcrumbLink[] | undefined;
  setTestListingBreadCrumbs: ((items: TestBreadcrumbLink[]) => void) | null;

  testDetailsBreadCrumbs: TestBreadcrumbLink[] | undefined;
  setTestDetailsBreadCrumbs: ((items: TestBreadcrumbLink[]) => void) | null;

  newAddressAddedHomePage: string;
  setNewAddressAddedHomePage: ((value: string) => void) | null;
  newAddressAddedCartPage: string;
  setNewAddressAddedCartPage: ((value: string) => void) | null;

  isCartPagePopulated: boolean;
  setCartPagePopulated: ((value: boolean) => void) | null;

  asyncDiagnosticPincode: any;
  setAsyncDiagnosticPincode: ((pincode: any) => void) | null;

  modifiedOrderItemIds: [];
  setModifiedOrderItemIds: ((items: any | []) => void) | null;
  modifiedOrder: any;
  setModifiedOrder: ((items: orderList | any | {}) => void) | null;

  serviceabilityObject: AddressServiceability | {}; //remove
  setServiceabilityObject: ((item: AddressServiceability) => void) | null;

  selectedPatient: any;
  showSelectedPatient: ((value: any) => void) | null;

  distanceCharges: number;
  setDistanceCharges: ((id: number) => void) | null;

  duplicateItemsArray: [];
  setDuplicateItemsArray: ((items: any | []) => void) | null;

  modifiedPatientCart: DiagnosticPatientCartItem[];
  setModifiedPatientCart: ((items: DiagnosticPatientCartItem[]) => void) | null;

  phleboETA: number;
  setPhleboETA: ((value: number) => void) | null;

  showMultiPatientMsg: boolean;
  setShowMultiPatientMsg: ((value: boolean) => void) | null;

  cartItemsMapping: any[];
  setCartItemsMapping: ((items: any[]) => void) | null;

  isCircleAddedToCart: boolean;
  setIsCircleAddedToCart: ((value: boolean) => void) | null;

  selectedCirclePlan: any;
  setSelectedCirclePlan: ((plan: any) => void) | null;

  isCirclePlanRemoved: boolean;
  setIsCirclePlanRemoved: ((value: boolean) => void) | null;

  couponCircleBenefits: boolean;
  setCouponCircleBenefits: ((value: boolean) => void) | null;
  couponOnMrp: any;
  setCouponOnMrp: ((items: any) => void) | null;
  waiveOffCollectionCharges: boolean;
  setWaiveOffCollectionCharges: ((value: boolean) => void) | null;
}

export const DiagnosticsCartContext = createContext<DiagnosticsCartContextProps>({
  forPatientId: '',
  setPatientId: null,

  cartItems: [],
  setCartItems: null,
  addCartItem: null,
  addMultipleCartItems: null,
  removeCartItem: null,
  updateCartItem: null,

  patientCartItems: [],
  setPatientCartItems: null,
  addPatientCartItem: null,
  removePatientCartItem: null,
  updatePatientCartItem: null,
  removeMultiPatientCartItems: null,
  removePatientItem: null,
  removeDuplicatePatientCartItems: null,

  cartTotal: 0,
  totalPriceExcludingAnyDiscounts: 0,
  cartSaving: 0,
  normalSaving: 0,
  discountSaving: 0,
  circleSaving: 0,
  couponDiscount: 0,
  setCouponDiscount: null,
  deliveryCharges: 0,
  temporaryNormalSaving: 0,
  temporaryCartSaving: 0,

  hcCharges: 0,
  setHcCharges: null,

  modifyHcCharges: 0,
  setModifyHcCharges: null,

  distanceCharges: 0,
  setDistanceCharges: null,

  grandTotal: 0,
  circleGrandTotal: 0,

  uploadPrescriptionRequired: false,

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

  coupon: null,
  setCoupon: null,

  deliveryAddressId: '',
  setDeliveryAddressId: null,

  deliveryAddressCityId: '',
  setDeliveryAddressCityId: null,

  deliveryAddressStateId: '',
  setDeliveryAddressStateId: null,

  addresses: [],
  setAddresses: null,
  addAddress: null,
  deliveryType: null,

  pinCode: '',
  setPinCode: null,

  clearDiagnoticCartInfo: null,

  diagnosticSlot: null,
  setDiagnosticSlot: null,
  isDiagnosticCircleSubscription: false,
  setIsDiagnosticCircleSubscription: null,
  showSelectPatient: false,
  setShowSelectPatient: null,
  testListingBreadCrumbs: [],
  setTestListingBreadCrumbs: null,
  testDetailsBreadCrumbs: [],
  setTestDetailsBreadCrumbs: null,

  newAddressAddedHomePage: '',
  setNewAddressAddedHomePage: null,
  newAddressAddedCartPage: '',
  setNewAddressAddedCartPage: null,

  isCartPagePopulated: false,
  setCartPagePopulated: null,
  asyncDiagnosticPincode: null,
  setAsyncDiagnosticPincode: null,
  modifiedOrderItemIds: [],
  setModifiedOrderItemIds: null,
  modifiedOrder: {},
  setModifiedOrder: null,
  serviceabilityObject: {},
  setServiceabilityObject: null,
  selectedPatient: null,
  showSelectedPatient: null,
  duplicateItemsArray: [],
  setDuplicateItemsArray: null,
  modifiedPatientCart: [],
  setModifiedPatientCart: null,
  phleboETA: 0,
  setPhleboETA: null,
  showMultiPatientMsg: true,
  setShowMultiPatientMsg: null,
  cartItemsMapping: [],
  setCartItemsMapping: null,
  isCircleAddedToCart: false,
  setIsCircleAddedToCart: null,
  selectedCirclePlan: null,
  setSelectedCirclePlan: null,
  isCirclePlanRemoved: false,
  setIsCirclePlanRemoved: null,
  couponCircleBenefits: false,
  setCouponCircleBenefits: null,
  couponOnMrp: null,
  setCouponOnMrp: null,
  waiveOffCollectionCharges: false,
  setWaiveOffCollectionCharges: null,
});

const showGenericAlert = (message: string) => {
  Alert.alert('Alert', message);
};

export const DiagnosticsCartProvider: React.FC = (props) => {
  const { allCurrentPatients } = useAllCurrentPatients();

  const id = '';
  const AsyncStorageKeys = {
    cartItems: `diagnosticsCartItems${id}`,
    ePrescriptions: `diagnosticsEPrescriptions${id}`,
    physicalPrescriptions: `diagnosticsPhysicalPrescriptions${id}`,
    showMultiPatientMsg: `diagnosticsMultiPatientMsg${id}`,
    patientCartItems: `diagnosticsPatientCartItems${id}`,
  };

  const [forPatientId, setPatientId] = useState<string>('');

  const [cartItems, _setCartItems] = useState<DiagnosticsCartContextProps['cartItems']>([]);
  const [patientCartItems, _setPatientCartItems] = useState<
    DiagnosticsCartContextProps['patientCartItems']
  >([]);
  const [modifiedPatientCart, setModifiedPatientCart] = useState<
    DiagnosticsCartContextProps['modifiedPatientCart']
  >([]);
  const [couponDiscount, setCouponDiscount] = useState<
    DiagnosticsCartContextProps['couponDiscount']
  >(0);

  const [coupon, setCoupon] = useState<DiagnosticsCartContextProps['coupon']>(null);

  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [pinCode, setPinCode] = useState<string>('');

  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    DiagnosticsCartContextProps['deliveryAddressId']
  >('');

  const [hcCharges, setHcCharges] = useState<DiagnosticsCartContextProps['hcCharges']>(0);

  const [modifyHcCharges, setModifyHcCharges] = useState<
    DiagnosticsCartContextProps['modifyHcCharges']
  >(0);

  const [distanceCharges, setDistanceCharges] = useState<
    DiagnosticsCartContextProps['distanceCharges']
  >(0);

  const [deliveryType, setDeliveryType] = useState<DiagnosticsCartContextProps['deliveryType']>(
    null
  );

  const [physicalPrescriptions, _setPhysicalPrescriptions] = useState<
    DiagnosticsCartContextProps['physicalPrescriptions']
  >([]);

  const [ePrescriptions, _setEPrescriptions] = useState<
    DiagnosticsCartContextProps['ePrescriptions']
  >([]);

  const [newAddressAddedHomePage, setNewAddressAddedHomePage] = useState<
    DiagnosticsCartContextProps['newAddressAddedHomePage']
  >('');

  const [newAddressAddedCartPage, setNewAddressAddedCartPage] = useState<
    DiagnosticsCartContextProps['newAddressAddedCartPage']
  >('');

  const [diagnosticSlot, _setDiagnosticSlot] = useState<
    DiagnosticsCartContextProps['diagnosticSlot']
  >(null);

  const [deliveryAddressCityId, setDeliveryAddressCityId] = useState<
    DiagnosticsCartContextProps['deliveryAddressCityId']
  >('');
  const [deliveryAddressStateId, setDeliveryAddressStateId] = useState<
    DiagnosticsCartContextProps['deliveryAddressStateId']
  >('');

  const [testListingBreadCrumbs, setTestListingBreadCrumbs] = useState<
    DiagnosticsCartContextProps['testListingBreadCrumbs']
  >();

  const [testDetailsBreadCrumbs, setTestDetailsBreadCrumbs] = useState<
    DiagnosticsCartContextProps['testDetailsBreadCrumbs']
  >();

  const [asyncDiagnosticPincode, setAsyncDiagnosticPincode] = useState<
    DiagnosticsCartContextProps['asyncDiagnosticPincode']
  >();

  const [modifiedOrder, setModifiedOrder] = useState<DiagnosticsCartContextProps['modifiedOrder']>(
    {}
  );

  const [serviceabilityObject, setServiceabilityObject] = useState<
    DiagnosticsCartContextProps['serviceabilityObject']
  >({});

  const [selectedPatient, showSelectedPatient] = useState<
    DiagnosticsCartContextProps['selectedPatient']
  >(null);

  const [duplicateItemsArray, setDuplicateItemsArray] = useState<
    DiagnosticsCartContextProps['duplicateItemsArray']
  >([]);

  const [phleboETA, setPhleboETA] = useState<DiagnosticsCartContextProps['phleboETA']>(0);
  const [showMultiPatientMsg, _setShowMultiPatientMsg] = useState<
    DiagnosticsCartContextProps['showMultiPatientMsg']
  >(true);

  const setDiagnosticSlot: DiagnosticsCartContextProps['setDiagnosticSlot'] = (item) => {
    _setDiagnosticSlot(item);
  };

  const setEPrescriptions: DiagnosticsCartContextProps['setEPrescriptions'] = (items) => {
    _setEPrescriptions(items);
    AsyncStorage.setItem(AsyncStorageKeys.ePrescriptions, JSON.stringify(items)).catch(() => {
      showGenericAlert('Failed to save E-Prescriptions in local storage.');
    });
  };

  const setPhysicalPrescriptions: DiagnosticsCartContextProps['setPhysicalPrescriptions'] = (
    items
  ) => {
    AsyncStorage.setItem(AsyncStorageKeys.physicalPrescriptions, JSON.stringify(items)).catch(
      () => {
        showGenericAlert('Failed to save Physical Prescriptions in local storage.');
      }
    );
    _setPhysicalPrescriptions(items);
  };

  const addEPrescription: DiagnosticsCartContextProps['addEPrescription'] = (itemToAdd) => {
    if (ePrescriptions.find((item) => item.id == itemToAdd.id)) {
      return;
    }
    const newItems = [...ePrescriptions, itemToAdd];
    setEPrescriptions(newItems);
  };

  const [isDiagnosticCircleSubscription, setIsDiagnosticCircleSubscription] = useState<
    DiagnosticsCartContextProps['isDiagnosticCircleSubscription']
  >(false);

  const [showSelectPatient, setShowSelectPatient] = useState<
    DiagnosticsCartContextProps['showSelectPatient']
  >(false);

  const addMultipleEPrescriptions: DiagnosticsCartContextProps['addMultipleEPrescriptions'] = (
    itemsToAdd
  ) => {
    const existingFilteredEPres = ePrescriptions.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    const updatedEPres = [...existingFilteredEPres, ...itemsToAdd];
    setEPrescriptions(updatedEPres);
  };

  const addAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setAddresses([address, ...addresses]);
  };

  const [isCartPagePopulated, setCartPagePopulated] = useState<
    DiagnosticsCartContextProps['isCartPagePopulated']
  >(false);

  const [modifiedOrderItemIds, setModifiedOrderItemIds] = useState<
    DiagnosticsCartContextProps['modifiedOrderItemIds']
  >([]);

  const [cartItemsMapping, setCartItemsMapping] = useState<
    DiagnosticsCartContextProps['cartItemsMapping']
  >([]);

  const [isCircleAddedToCart, setIsCircleAddedToCart] = useState<
    DiagnosticsCartContextProps['isCircleAddedToCart']
  >(false);

  const [selectedCirclePlan, setSelectedCirclePlan] = useState<
    DiagnosticsCartContextProps['selectedCirclePlan']
  >(null);

  const [isCirclePlanRemoved, setIsCirclePlanRemoved] = useState<
    DiagnosticsCartContextProps['isCirclePlanRemoved']
  >(false);

  const [couponCircleBenefits, setCouponCircleBenefits] = useState<
    DiagnosticsCartContextProps['couponCircleBenefits']
  >(false);

  const [couponOnMrp, setCouponOnMrp] = useState<DiagnosticsCartContextProps['couponOnMrp']>(null);

  const [waiveOffCollectionCharges, setWaiveOffCollectionCharges] = useState<
    DiagnosticsCartContextProps['waiveOffCollectionCharges']
  >(false);

  const setShowMultiPatientMsg: DiagnosticsCartContextProps['setShowMultiPatientMsg'] = (value) => {
    _setShowMultiPatientMsg(value);
    AsyncStorage.setItem(AsyncStorageKeys.showMultiPatientMsg, JSON.stringify(value)).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  const setCartItems: DiagnosticsCartContextProps['setCartItems'] = (cartItems) => {
    _setCartItems(cartItems);
    AsyncStorage.setItem(AsyncStorageKeys.cartItems, JSON.stringify(cartItems)).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  function checkMinorAgeItemValidation(patientCartItems: DiagnosticPatientCartItem[]) {
    let newPatientCartItem = [] as DiagnosticPatientCartItem[];

    patientCartItems?.map((pItem) => {
      const getPatientDetails = allCurrentPatients?.find(
        (patient: any) => pItem?.patientId == patient?.id
      );
      /**if minor age + rtpcr item */
      if (checkPatientAge(getPatientDetails)) {
        const getCovidItems = pItem?.cartItems?.filter((cItem) =>
          AppConfig.Configuration.DIAGNOSTICS_COVID_ITEM_IDS?.includes(Number(cItem?.id))
        );
        let obj: DiagnosticPatientCartItem = {
          patientId: getPatientDetails?.id,
          cartItems: getCovidItems, //keep only covid item
        };
        newPatientCartItem?.push(obj);
      } else {
        newPatientCartItem?.push(pItem);
      }
    });
    return newPatientCartItem;
  }

  const setPatientCartItems: DiagnosticsCartContextProps['setPatientCartItems'] = (
    patientCartItems
  ) => {
    const getUpdatedCartItem = checkMinorAgeItemValidation(patientCartItems);
    _setPatientCartItems(getUpdatedCartItem);
    AsyncStorage.setItem(
      AsyncStorageKeys.patientCartItems,
      JSON.stringify(getUpdatedCartItem)
    ).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  const addCartItem: DiagnosticsCartContextProps['addCartItem'] = (itemToAdd) => {
    if (cartItems.find((item) => item?.id == itemToAdd?.id)) {
      return;
    }
    const newCartItems = [itemToAdd, ...cartItems];
    setCartItems(newCartItems);
    //empty the slots and areas everytime due to dependency of api.
    setDiagnosticSlot(null);
  };

  const addMultipleCartItems: DiagnosticsCartContextProps['addMultipleCartItems'] = (
    itemsToAdd
  ) => {
    // If tried to add same items(by id) which already exists in the cart, it will update with new values.
    const existingFilteredCartItems = cartItems.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    const newCartItems = [
      ...existingFilteredCartItems,
      ...itemsToAdd.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i),
    ];
    setCartItems(newCartItems);
  };

  const removeCartItem: DiagnosticsCartContextProps['removeCartItem'] = (id) => {
    const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));
    //empty the slots and areas everytime due to dependency of api.
    setDiagnosticSlot(null);
    setCartItems(newCartItems);
  };
  const updateCartItem: DiagnosticsCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems?.findIndex((item) => item?.id == itemUpdates?.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      setCartItems([...cartItems]?.slice(0));
    }
  };

  const addPatientCartItem: DiagnosticsCartContextProps['addPatientCartItem'] = (
    patientId,
    listOfItems
  ) => {
    const findPatient =
      !!patientCartItems &&
      patientCartItems?.find(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );
    const findPatientIndex =
      !!patientCartItems &&
      patientCartItems?.findIndex(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );

    if (!!findPatient) {
      patientCartItems[findPatientIndex].cartItems = listOfItems; //just update the list with selected item attribute
      setPatientCartItems?.(patientCartItems);
    } else {
      const patientCartItemsObj: DiagnosticPatientCartItem = {
        patientId: patientId,
        cartItems: listOfItems,
      };
      const newCartItems = [patientCartItemsObj, ...patientCartItems];
      setPatientCartItems?.(newCartItems);
    }
    setDiagnosticSlot?.(null);
  };

  const removePatientCartItem: DiagnosticsCartContextProps['removePatientCartItem'] = (
    patientId: string,
    id?: string
  ) => {
    const findPatient = patientCartItems?.find((item) => item?.patientId == patientId);
    const findPatientIndex = patientCartItems?.findIndex((item) => item?.patientId == patientId);
    if (!!findPatient) {
      if (!!id) {
        const newCartItems = findPatient?.cartItems?.filter(
          (item) => Number(item?.id) !== Number(id)
        );
        patientCartItems[findPatientIndex].cartItems = newCartItems;
        setPatientCartItems?.(patientCartItems);
      } else {
        removePatientItem?.(patientId);
      }
    }
    setDiagnosticSlot(null);
  };

  const removePatientItem: DiagnosticsCartContextProps['removePatientItem'] = (patientId) => {
    const newCartItems = patientCartItems?.filter((item) => item?.patientId !== patientId);
    setPatientCartItems?.(newCartItems);
  };

  const removeMultiPatientCartItems: DiagnosticsCartContextProps['removeMultiPatientCartItems'] = (
    id
  ) => {
    patientCartItems?.map((pItem) => removePatientCartItem?.(pItem?.patientId, `${id}`));
  };

  const updatePatientCartItem: DiagnosticsCartContextProps['updatePatientCartItem'] = (
    itemUpdates
  ) => {
    const newPatientCartItem = patientCartItems?.map((patientItems: DiagnosticPatientCartItem) => {
      const findLineItemsIndex = patientItems?.cartItems?.findIndex(
        (lineItems: DiagnosticsCartItem) => lineItems?.id === itemUpdates?.id
      );
      if (findLineItemsIndex !== -1) {
        patientItems.cartItems[findLineItemsIndex] = itemUpdates;
        const patientLineItemObj: DiagnosticPatientCartItem = {
          patientId: patientItems?.patientId,
          cartItems: patientItems?.cartItems,
        };
        return patientLineItemObj;
      } else {
        return patientItems;
      }
    });
    setPatientCartItems?.([...newPatientCartItem!]?.slice(0));
  };

  const removeDuplicatePatientCartItems: DiagnosticsCartContextProps['removeDuplicatePatientCartItems'] = (
    patientId: string,
    cartItemIds: number[]
  ) => {
    cartItemIds?.forEach((id: number) => {
      const findPatientIndex = patientCartItems?.findIndex(
        (patient: DiagnosticPatientCartItem) => patient?.patientId === patientId
      );
      if (findPatientIndex !== -1) {
        const lineItemsIndex = patientCartItems[findPatientIndex]?.cartItems?.findIndex(
          (cartItems: DiagnosticsCartItem) => Number(cartItems?.id) === Number(id)
        );
        if (lineItemsIndex !== -1) {
          patientCartItems[findPatientIndex]?.cartItems?.splice(lineItemsIndex, 1);
        }
      }
      const newPatientLineItems: DiagnosticPatientCartItem[] = patientCartItems?.filter(
        (patient: DiagnosticPatientCartItem) => patient?.cartItems?.length > 0
      );
      _setPatientCartItems(newPatientLineItems);
      checkItemRemovedFromAllPatients(id);
    });
  };

  const checkItemRemovedFromAllPatients = (cartItemId: number) => {
    let isItemExistInPatientCart: boolean = true;
    patientCartItems?.forEach((patient: DiagnosticPatientCartItem) => {
      const findAllItem = patient?.cartItems?.filter(
        (itemObj: DiagnosticsCartItem) => Number(itemObj?.id) === Number(cartItemId)
      );
      const findItem =
        !!findAllItem && findAllItem?.length > 0 && findAllItem?.filter((item) => item?.isSelected);
      if (!!findItem && findItem?.length > 0) {
        isItemExistInPatientCart = false;
      }
    });
    if (isItemExistInPatientCart) {
      removeCartItem?.(cartItemId?.toString());
    }
  };

  const selectedPatientCartItems =
    !!modifiedPatientCart && modifiedPatientCart?.length > 0
      ? modifiedPatientCart
      : patientCartItems;

  const filterPatientCartItem =
    !!selectedPatientCartItems &&
    selectedPatientCartItems?.map((item: DiagnosticPatientCartItem) => {
      let obj = {
        patientId: item?.patientId,
        cartItems:
          !!item?.cartItems &&
          item?.cartItems?.filter((items: DiagnosticsCartItem) => items?.isSelected == true),
      };
      return obj;
    });

  const allCartItems =
    !!filterPatientCartItem && filterPatientCartItem?.map((item) => item?.cartItems)?.flat();

  const withDiscount = allCartItems?.filter(
    (item: DiagnosticsCartItem) => item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
  );

  //update this logic.
  const withAll = allCartItems?.filter((item: DiagnosticsCartItem) =>
    (isDiagnosticCircleSubscription || isCircleAddedToCart) && !!coupon && !coupon?.circleBenefits
      ? item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.CIRCLE ||
        item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
      : item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.CIRCLE ||
        item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );

  const cartItemsWithAll = allCartItems?.filter(
    (item: DiagnosticsCartItem) => item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );

  /**
   * added the coupon check
   */

  function getDiscountSavingPrice(currentItem: DiagnosticsCartItem) {
    const getItem =
      !!coupon &&
      !!couponOnMrp &&
      couponOnMrp?.find((item: any) => Number(item?.testId) == Number(currentItem?.id));
    const isMrpTrue = !!getItem && getItem?.onMrp;
    return {
      isMrpTrue,
    };
  }

  const discountSaving: DiagnosticsCartContextProps['discountSaving'] = call();

  function call() {
    return withDiscount?.reduce(
      (currTotal: number, currItem: DiagnosticsCartItem) =>
        currTotal +
        (currItem?.packageMrp && currItem?.packageMrp > currItem?.discountSpecialPrice!
          ? !!coupon && !couponCircleBenefits
            ? currItem?.packageMrp! -
              (getDiscountSavingPrice(currItem)?.isMrpTrue
                ? currItem?.specialPrice!
                : currItem?.discountSpecialPrice!)
            : currItem?.packageMrp! -
              (getDiscountSavingPrice(currItem)?.isMrpTrue
                ? currItem?.specialPrice!
                : currItem?.discountSpecialPrice!)
          : !!coupon && !couponCircleBenefits
          ? currItem?.price! -
            (getDiscountSavingPrice(currItem)?.isMrpTrue
              ? currItem?.specialPrice!
              : currItem?.discountSpecialPrice!)
          : currItem?.price! -
            (getDiscountSavingPrice(currItem)?.isMrpTrue
              ? currItem?.specialPrice!
              : currItem?.discountSpecialPrice!)),
      0
    );
  }
  const withAllForCoupons = allCartItems?.filter((item: DiagnosticsCartItem) => {
    var array = [];
    const getAllCouponResponse =
      couponOnMrp && couponOnMrp?.find((val: any) => Number(val?.testId) == Number(item?.id));
    const shouldHaveCircleBenefits =
      (isDiagnosticCircleSubscription || isCircleAddedToCart) && coupon?.circleBenefits;
    const hasOnMrpTrue = getAllCouponResponse?.onMrp;

    array.push(
      hasOnMrpTrue
        ? item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.ALL ||
            item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.CIRCLE ||
            item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
        : !shouldHaveCircleBenefits
        ? item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.ALL ||
          item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.CIRCLE
        : isDiagnosticCircleSubscription || isCircleAddedToCart
        ? item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.ALL
        : item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.CIRCLE
    );
    return array;
  });

  const normalSaving: DiagnosticsCartContextProps['normalSaving'] = withAll?.reduce(
    (currTotal: number, currItem: DiagnosticsCartItem) =>
      currTotal +
      (currItem?.packageMrp && currItem?.packageMrp > currItem?.specialPrice!
        ? currItem?.packageMrp! - currItem?.specialPrice!
        : currItem?.price! - currItem?.specialPrice!),
    0
  );

  const temporaryNormalSaving: DiagnosticsCartContextProps['temporaryNormalSaving'] = cartItemsWithAll?.reduce(
    (currTotal: number, currItem: DiagnosticsCartItem) =>
      currTotal +
      (currItem?.packageMrp && currItem?.packageMrp > currItem?.specialPrice!
        ? currItem?.packageMrp! - currItem?.specialPrice!
        : currItem?.price! - currItem?.specialPrice!),
    0
  );

  const cartTotal: DiagnosticsCartContextProps['cartTotal'] = parseFloat(
    allCartItems
      ?.reduce((currTotal: number, currItem: DiagnosticsCartItem) => currTotal + currItem?.price, 0)
      .toFixed(2)
  );

  const totalPriceExcludingAnyDiscounts: DiagnosticsCartContextProps['totalPriceExcludingAnyDiscounts'] = parseFloat(
    allCartItems
      ?.reduce(
        (currTotal: number, currItem: DiagnosticsCartItem) =>
          currTotal +
          (currItem?.packageMrp! > currItem?.price ? currItem?.packageMrp! : currItem?.price),
        0
      )
      .toFixed(2)
  );

  const cartSaving: DiagnosticsCartContextProps['cartTotal'] = discountSaving + normalSaving;
  const temporaryCartSaving: DiagnosticsCartContextProps['temporaryCartSaving'] =
    discountSaving + temporaryNormalSaving;

  //removed packageMrp code
  const circleSaving: DiagnosticsCartContextProps['circleSaving'] = parseFloat(
    allCartItems
      ?.reduce(
        (currTotal: number, currItem: DiagnosticsCartItem) =>
          currTotal +
          (currItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
            ? currItem?.circlePrice! - currItem?.circleSpecialPrice!
            : 0 || 0),
        0
      )
      .toFixed(2)
  );

  const deliveryCharges =
    deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP ? 0 : cartTotal > 0 ? modifyHcCharges : 0;

  //carttotal
  const grandTotal = parseFloat(
    (
      totalPriceExcludingAnyDiscounts +
      deliveryCharges -
      couponDiscount -
      cartSaving -
      (isDiagnosticCircleSubscription || isCircleAddedToCart ? circleSaving : 0) +
      (!!distanceCharges ? distanceCharges : 0)
    ).toFixed(2)
  );

  const circleGrandTotal = parseFloat(
    (
      totalPriceExcludingAnyDiscounts +
      deliveryCharges -
      couponDiscount -
      temporaryCartSaving -
      circleSaving +
      (!!distanceCharges ? distanceCharges : 0)
    ).toFixed(2)
  );

  const setDeliveryAddressId = (id: DiagnosticsCartContextProps['deliveryAddressId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.HOME_DELIVERY);
    _setDeliveryAddressId(id);
  };

  const addPhysicalPrescription: DiagnosticsCartContextProps['addPhysicalPrescription'] = (
    item
  ) => {
    setPhysicalPrescriptions([item, ...physicalPrescriptions]);
  };

  const updatePhysicalPrescription: DiagnosticsCartContextProps['updatePhysicalPrescription'] = (
    itemUpdates
  ) => {
    const foundIndex = physicalPrescriptions.findIndex((item) => item.title == itemUpdates.title);
    if (foundIndex !== -1) {
      physicalPrescriptions[foundIndex] = {
        ...physicalPrescriptions[foundIndex],
        ...itemUpdates,
      };
      setPhysicalPrescriptions([...physicalPrescriptions]);
    }
  };

  const removePhysicalPrescription: DiagnosticsCartContextProps['removePhysicalPrescription'] = (
    title
  ) => {
    const newItems = physicalPrescriptions.filter((item) => item.title !== title);
    setPhysicalPrescriptions([...newItems]);
  };

  const removeEPrescription: DiagnosticsCartContextProps['removeEPrescription'] = (id) => {
    const newItems = ePrescriptions.filter((item) => item.id !== id);
    setEPrescriptions([...newItems]);
  };

  const clearDiagnoticCartInfo = () => {
    setPhysicalPrescriptions([]);
    setEPrescriptions([]);
    setCartItems([]);
    setPatientCartItems([]);
    setDeliveryAddressId('');
    setDeliveryAddressCityId('');
    setDeliveryAddressStateId('');
    setPinCode('');
    setCoupon(null);
    setCouponDiscount(0);
    setDiagnosticSlot(null);
    setModifiedOrderItemIds([]);
    setHcCharges?.(0);
    setModifyHcCharges?.(0);
    setDistanceCharges?.(0);
    setNewAddressAddedHomePage('');
    setNewAddressAddedHomePage('');
    setShowSelectPatient(false);
    setCartPagePopulated(false);
    setModifiedOrder({});
    setServiceabilityObject({});
    showSelectedPatient(null);
    setDuplicateItemsArray([]);
    setModifiedPatientCart([]);
    setPhleboETA(0);
    setShowMultiPatientMsg(false);
    setCartItemsMapping([]);
    setIsCircleAddedToCart?.(
      isDiagnosticCircleSubscription ? false : AppConfig.Configuration.CIRCLE_PLAN_PRESELECTED
    );
    setIsCirclePlanRemoved?.(false);
    setSelectedCirclePlan?.(null);
    setCouponCircleBenefits?.(false);
    setCouponOnMrp?.(false);
    setWaiveOffCollectionCharges?.(false);
  };

  useEffect(() => {
    // update cart items from async storage the very first time app opened
    const updateCartItemsFromStorage = async () => {
      try {
        const cartItemsFromStorage = await AsyncStorage.multiGet([
          AsyncStorageKeys.cartItems,
          AsyncStorageKeys.physicalPrescriptions,
          AsyncStorageKeys.ePrescriptions,
          AsyncStorageKeys.showMultiPatientMsg,
          AsyncStorageKeys.patientCartItems,
        ]);
        const cartItems = cartItemsFromStorage[0][1];
        const physicalPrescriptions = cartItemsFromStorage[1][1];
        const ePrescriptions = cartItemsFromStorage[2][1];
        const showMultiPatientMsg = cartItemsFromStorage[3][1];
        const patientCartItems = cartItemsFromStorage[4][1];
        _setCartItems(JSON.parse(cartItems || 'null') || []);
        _setPhysicalPrescriptions(JSON.parse(physicalPrescriptions || 'null') || []);
        _setEPrescriptions(JSON.parse(ePrescriptions || 'null') || []);
        _setShowMultiPatientMsg(JSON.parse(showMultiPatientMsg || 'null'));
        _setPatientCartItems(JSON.parse(patientCartItems || 'null') || []);
      } catch (error) {
        CommonBugFender('DiagnosticsCartProvider_updateCartItemsFromStorage_try', error);
        showGenericAlert('Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  useEffect(() => {
    // updating prescription here on update in cart items
    if (cartTotal == 0) {
      physicalPrescriptions.length > 0 && setPhysicalPrescriptions([]);
      ePrescriptions.length > 0 && setEPrescriptions([]);
    }
  }, [cartTotal]);

  useEffect(() => {
    patientCartItems?.map(
      (item) => item?.cartItems?.length == 0 && removePatientItem?.(item?.patientId)
    );
  }, [patientCartItems]);

  return (
    <DiagnosticsCartContext.Provider
      value={{
        forPatientId,
        setPatientId,
        cartItems,
        setCartItems,
        addCartItem,
        addMultipleCartItems,
        removeCartItem,
        updateCartItem,

        patientCartItems,
        addPatientCartItem,
        setPatientCartItems,
        updatePatientCartItem,
        removePatientCartItem,
        removePatientItem,

        cartTotal,
        totalPriceExcludingAnyDiscounts,
        cartSaving,
        discountSaving,
        normalSaving,
        circleSaving,
        grandTotal,
        circleGrandTotal,
        temporaryCartSaving, //used for cal circle savings, even if circle is not applied
        temporaryNormalSaving,
        couponDiscount,
        setCouponDiscount,
        deliveryCharges,
        hcCharges,
        setHcCharges,
        modifyHcCharges,
        setModifyHcCharges,
        distanceCharges,
        setDistanceCharges,
        uploadPrescriptionRequired: false,
        ePrescriptions,
        addEPrescription,
        addMultipleEPrescriptions,
        removeEPrescription,
        setEPrescriptions,
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
        deliveryAddressCityId,
        setDeliveryAddressCityId,
        deliveryAddressStateId,
        setDeliveryAddressStateId,
        deliveryType,
        coupon,
        setCoupon,
        pinCode,
        setPinCode,
        clearDiagnoticCartInfo,
        diagnosticSlot,
        setDiagnosticSlot,
        isDiagnosticCircleSubscription,
        setIsDiagnosticCircleSubscription,
        showSelectPatient,
        setShowSelectPatient,
        testListingBreadCrumbs,
        setTestListingBreadCrumbs,
        testDetailsBreadCrumbs,
        setTestDetailsBreadCrumbs,
        newAddressAddedHomePage,
        setNewAddressAddedHomePage,
        newAddressAddedCartPage,
        setNewAddressAddedCartPage,
        isCartPagePopulated,
        setCartPagePopulated,
        asyncDiagnosticPincode,
        setAsyncDiagnosticPincode,
        modifiedOrderItemIds,
        setModifiedOrderItemIds,
        modifiedOrder,
        setModifiedOrder,
        serviceabilityObject,
        setServiceabilityObject,
        selectedPatient,
        showSelectedPatient,
        duplicateItemsArray,
        setDuplicateItemsArray,
        modifiedPatientCart,
        setModifiedPatientCart,
        removeMultiPatientCartItems,
        phleboETA,
        setPhleboETA,
        showMultiPatientMsg,
        setShowMultiPatientMsg,
        removeDuplicatePatientCartItems,
        cartItemsMapping,
        setCartItemsMapping,
        isCircleAddedToCart,
        setIsCircleAddedToCart,
        selectedCirclePlan,
        setSelectedCirclePlan,
        isCirclePlanRemoved,
        setIsCirclePlanRemoved,
        couponCircleBenefits,
        setCouponCircleBenefits,
        couponOnMrp,
        setCouponOnMrp,
        waiveOffCollectionCharges,
        setWaiveOffCollectionCharges,
      }}
    >
      {props.children}
    </DiagnosticsCartContext.Provider>
  );
};

export const useDiagnosticsCart = () =>
  useContext<DiagnosticsCartContextProps>(DiagnosticsCartContext);
