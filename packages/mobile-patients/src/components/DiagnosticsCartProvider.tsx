import { getCoupons_getCoupons_coupons } from '@aph/mobile-patients/src/graphql/types/getCoupons';
import {
  DiscountType,
  MEDICINE_DELIVERY_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Clinic, DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  EPrescription,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';

export interface DiagnosticsCartItem {
  id: string;
  name: string;
  mou: number; // package of how many tests (eg. 10)
  price: number; //mrp
  thumbnail: string | null;
  specialPrice?: number | null; //price
  circlePrice?: number | null; //mrp
  circleSpecialPrice?: number | null; //price
  discountPrice?: number | null; //mrp
  discountSpecialPrice?: number | null; //price
  collectionMethod: TEST_COLLECTION_TYPE;
  groupPlan?: string;
  packageMrp?: number;
  inclusions?: any[];
}

export interface DiagnosticClinic extends Clinic {
  date: number; // timestamp
}

export interface DiagnosticSlot {
  employeeSlotId: number | string;
  diagnosticBranchCode: string;
  diagnosticEmployeeCode: string;
  slotStartTime: string;
  slotEndTime: string;
  city: string;
  date: number; // timestamp
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

  cartTotal: number;
  totalPriceExcludingAnyDiscounts: number;
  cartSaving: number;
  normalSaving: number;
  discountSaving: number;
  circleSaving: number;
  couponDiscount: number;
  deliveryCharges: number;

  hcCharges: number;
  setHcCharges: ((id: number) => void) | null;

  modifyHcCharges: number;
  setModifyHcCharges: ((id: number) => void) | null;

  grandTotal: number;

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

  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  setAddresses:
    | ((addresses: savePatientAddress_savePatientAddress_patientAddress[]) => void)
    | null;

  clinicId: string;
  setClinicId: ((id: string) => void) | null;

  clinics: Clinic[];
  setClinics: ((clinic: Clinic[]) => void) | null;

  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;

  coupon: getCoupons_getCoupons_coupons | null;
  setCoupon: ((id: getCoupons_getCoupons_coupons) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearDiagnoticCartInfo: (() => void) | null;

  diagnosticSlot: DiagnosticSlot | null;
  setDiagnosticSlot: ((item: DiagnosticSlot | null) => void) | null;

  areaSelected: DiagnosticArea | {};
  setAreaSelected: ((items: DiagnosticArea | {}) => void) | null;

  diagnosticAreas: [];
  setDiagnosticAreas: ((items: any | []) => void) | null;

  diagnosticClinic: DiagnosticClinic | null;
  setDiagnosticClinic: ((item: DiagnosticClinic) => void) | null;

  isDiagnosticCircleSubscription: boolean;
  setIsDiagnosticCircleSubscription: ((value: boolean) => void) | null;

  showSelectPatient: boolean;
  setShowSelectPatient: ((value: boolean) => void) | null;

  getUniqueId: string;
  setUniqueId: ((value: string) => void) | null;

  testListingBreadCrumbs: TestBreadcrumbLink[] | undefined;
  setTestListingBreadCrumbs: ((items: TestBreadcrumbLink[]) => void) | null;

  testDetailsBreadCrumbs: TestBreadcrumbLink[] | undefined;
  setTestDetailsBreadCrumbs: ((items: TestBreadcrumbLink[]) => void) | null;

  newAddressAddedHomePage: string;
  setNewAddressAddedHomePage: ((value: string) => void) | null;
  newAddressAddedCartPage: string;
  setNewAddressAddedCartPage: ((value: string) => void) | null;

  showSelectedArea: boolean;
  setShowSelectedArea: ((value: boolean) => void) | null;

  isCartPagePopulated: boolean;
  setCartPagePopulated: ((value: boolean) => void) | null;

  asyncDiagnosticPincode: any;
  setAsyncDiagnosticPincode: ((pincode: any) => void) | null;
  modifiedOrderItemIds: [];
  setModifiedOrderItemIds: ((items: any | []) => void) | null;
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
  cartTotal: 0,
  totalPriceExcludingAnyDiscounts: 0,
  cartSaving: 0,
  normalSaving: 0,
  discountSaving: 0,
  circleSaving: 0,
  couponDiscount: 0,
  deliveryCharges: 0,

  hcCharges: 0,
  setHcCharges: null,

  modifyHcCharges: 0,
  setModifyHcCharges: null,

  grandTotal: 0,

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

  clinics: [],
  setClinics: null,

  deliveryAddressId: '',
  setDeliveryAddressId: null,

  deliveryAddressCityId: '',
  setDeliveryAddressCityId: null,

  addresses: [],
  setAddresses: null,
  addAddress: null,
  clinicId: '',
  setClinicId: null,
  deliveryType: null,

  pinCode: '',
  setPinCode: null,

  clearDiagnoticCartInfo: null,

  diagnosticClinic: null,
  diagnosticSlot: null,
  setDiagnosticClinic: null,
  setDiagnosticSlot: null,
  areaSelected: {},
  setAreaSelected: null,
  diagnosticAreas: [],
  setDiagnosticAreas: null,
  isDiagnosticCircleSubscription: false,
  setIsDiagnosticCircleSubscription: null,
  showSelectPatient: false,
  setShowSelectPatient: null,
  getUniqueId: '',
  setUniqueId: null,
  testListingBreadCrumbs: [],
  setTestListingBreadCrumbs: null,
  testDetailsBreadCrumbs: [],
  setTestDetailsBreadCrumbs: null,

  newAddressAddedHomePage: '',
  setNewAddressAddedHomePage: null,
  newAddressAddedCartPage: '',
  setNewAddressAddedCartPage: null,

  showSelectedArea: false,
  setShowSelectedArea: null,
  isCartPagePopulated: false,
  setCartPagePopulated: null,
  asyncDiagnosticPincode: null,
  setAsyncDiagnosticPincode: null,
  modifiedOrderItemIds: [],
  setModifiedOrderItemIds: null,
});

const showGenericAlert = (message: string) => {
  Alert.alert('Alert', message);
};

export const DiagnosticsCartProvider: React.FC = (props) => {
  const id = '';
  const AsyncStorageKeys = {
    cartItems: `diagnosticsCartItems${id}`,
    ePrescriptions: `diagnosticsEPrescriptions${id}`,
    physicalPrescriptions: `diagnosticsPhysicalPrescriptions${id}`,
  };

  const [forPatientId, setPatientId] = useState<string>('');

  const [cartItems, _setCartItems] = useState<DiagnosticsCartContextProps['cartItems']>([]);
  const [couponDiscount, setCouponDiscount] = useState<
    DiagnosticsCartContextProps['couponDiscount']
  >(0);

  const [coupon, setCoupon] = useState<DiagnosticsCartContextProps['coupon']>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [pinCode, setPinCode] = useState<string>('');

  const [clinicId, _setClinicId] = useState<DiagnosticsCartContextProps['clinicId']>('');

  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    DiagnosticsCartContextProps['deliveryAddressId']
  >('');

  const [hcCharges, setHcCharges] = useState<DiagnosticsCartContextProps['hcCharges']>(0);

  const [modifyHcCharges, setModifyHcCharges] = useState<
    DiagnosticsCartContextProps['modifyHcCharges']
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

  const [diagnosticClinic, _setDiagnosticClinic] = useState<
    DiagnosticsCartContextProps['diagnosticClinic']
  >(null);

  const [diagnosticSlot, _setDiagnosticSlot] = useState<
    DiagnosticsCartContextProps['diagnosticSlot']
  >(null);

  const [areaSelected, setAreaSelected] = useState<DiagnosticsCartContextProps['areaSelected']>({});
  const [deliveryAddressCityId, setDeliveryAddressCityId] = useState<
    DiagnosticsCartContextProps['deliveryAddressCityId']
  >('');
  const [diagnosticAreas, setDiagnosticAreas] = useState<
    DiagnosticsCartContextProps['diagnosticAreas']
  >([]);
  const [getUniqueId, setUniqueId] = useState<DiagnosticsCartContextProps['getUniqueId']>('');

  const [testListingBreadCrumbs, setTestListingBreadCrumbs] = useState<
    DiagnosticsCartContextProps['testListingBreadCrumbs']
  >();

  const [testDetailsBreadCrumbs, setTestDetailsBreadCrumbs] = useState<
    DiagnosticsCartContextProps['testDetailsBreadCrumbs']
  >();

  const [asyncDiagnosticPincode, setAsyncDiagnosticPincode] = useState<
    DiagnosticsCartContextProps['asyncDiagnosticPincode']
  >();

  const setDiagnosticClinic: DiagnosticsCartContextProps['setDiagnosticClinic'] = (item) => {
    _setDiagnosticClinic(item);
    _setDiagnosticSlot(null);
    _setDeliveryAddressId('');
    setDeliveryAddressCityId('');
  };

  const setDiagnosticSlot: DiagnosticsCartContextProps['setDiagnosticSlot'] = (item) => {
    _setDiagnosticSlot(item);
    _setDiagnosticClinic(null);
    _setClinicId('');
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

  const [showSelectedArea, setShowSelectedArea] = useState<
    DiagnosticsCartContextProps['showSelectedArea']
  >(false);

  const [isCartPagePopulated, setCartPagePopulated] = useState<
    DiagnosticsCartContextProps['isCartPagePopulated']
  >(false);

  const [modifiedOrderItemIds, setModifiedOrderItemIds] = useState<
    DiagnosticsCartContextProps['modifiedOrderItemIds']
  >([]);

  const setCartItems: DiagnosticsCartContextProps['setCartItems'] = (cartItems) => {
    _setCartItems(cartItems);
    AsyncStorage.setItem(AsyncStorageKeys.cartItems, JSON.stringify(cartItems)).catch(() => {
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
      setCartItems([...cartItems]);
    }
  };

  const withDiscount = cartItems?.filter(
    (item) => item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
  );

  const withAll = cartItems?.filter((item) =>
    isDiagnosticCircleSubscription
      ? item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.ALL
      : item?.groupPlan! == DIAGNOSTIC_GROUP_PLAN.CIRCLE ||
        item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );
  const discountSaving: DiagnosticsCartContextProps['discountSaving'] = withDiscount?.reduce(
    (currTotal, currItem) =>
      currTotal +
      (currItem?.packageMrp && currItem?.packageMrp > currItem?.discountSpecialPrice!
        ? currItem?.packageMrp! - currItem?.discountSpecialPrice!
        : currItem?.price! - currItem?.discountSpecialPrice!),
    0
  );
  const normalSaving: DiagnosticsCartContextProps['normalSaving'] = withAll?.reduce(
    (currTotal, currItem) =>
      currTotal +
      (currItem?.packageMrp && currItem?.packageMrp > currItem?.specialPrice!
        ? currItem?.packageMrp! - currItem?.specialPrice!
        : currItem?.price! - currItem?.specialPrice!),
    0
  );

  const cartTotal: DiagnosticsCartContextProps['cartTotal'] = parseFloat(
    cartItems?.reduce((currTotal, currItem) => currTotal + currItem?.price, 0).toFixed(2)
  );

  //this takes packageMrp if exists or mrp
  const totalPriceExcludingAnyDiscounts: DiagnosticsCartContextProps['totalPriceExcludingAnyDiscounts'] = parseFloat(
    cartItems
      ?.reduce(
        (currTotal, currItem) =>
          currTotal +
          (currItem?.packageMrp! > currItem?.price ? currItem?.packageMrp! : currItem?.price),
        0
      )
      .toFixed(2)
  );

  const cartSaving: DiagnosticsCartContextProps['cartTotal'] = discountSaving + normalSaving;
  const circleSaving: DiagnosticsCartContextProps['circleSaving'] = parseFloat(
    cartItems
      ?.reduce(
        (currTotal, currItem) =>
          currTotal +
          (currItem?.groupPlan == 'CIRCLE'
            ? (currItem?.packageMrp! > currItem?.circlePrice!
                ? currItem?.packageMrp!
                : currItem?.circlePrice!) - currItem?.circleSpecialPrice!
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
      deliveryCharges +
      couponDiscount -
      cartSaving -
      (isDiagnosticCircleSubscription ? circleSaving : 0)
    ).toFixed(2)
  );

  const setClinicId = (id: DiagnosticsCartContextProps['clinicId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.STORE_PICKUP);
    _setClinicId(id);
  };

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
    setDeliveryAddressId('');
    setDeliveryAddressCityId('');
    setClinicId('');
    setPinCode('');
    setClinics([]);
    setCoupon(null);
    setDiagnosticSlot(null);
    setAreaSelected({});
    setDiagnosticAreas([]);
    setModifiedOrderItemIds([]);
    setHcCharges?.(0);
    setModifyHcCharges?.(0);
    setNewAddressAddedHomePage('');
    setNewAddressAddedHomePage('');
    setShowSelectPatient(false);
    setShowSelectedArea(false);
    setCartPagePopulated(false);
    setHcCharges(0);
  };

  useEffect(() => {
    // update cart items from async storage the very first time app opened
    const updateCartItemsFromStorage = async () => {
      try {
        const cartItemsFromStorage = await AsyncStorage.multiGet([
          AsyncStorageKeys.cartItems,
          AsyncStorageKeys.physicalPrescriptions,
          AsyncStorageKeys.ePrescriptions,
        ]);
        const cartItems = cartItemsFromStorage[0][1];
        const physicalPrescriptions = cartItemsFromStorage[1][1];
        const ePrescriptions = cartItemsFromStorage[2][1];

        _setCartItems(JSON.parse(cartItems || 'null') || []);
        _setPhysicalPrescriptions(JSON.parse(physicalPrescriptions || 'null') || []);
        _setEPrescriptions(JSON.parse(ePrescriptions || 'null') || []);
      } catch (error) {
        CommonBugFender('DiagnosticsCartProvider_updateCartItemsFromStorage_try', error);
        showGenericAlert('Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  useEffect(() => {
    // updating coupon discount here on update in cart or new coupon code applied
    const minimumOrderAmount = coupon && coupon.minimumOrderAmount;
    if (!coupon || (minimumOrderAmount && cartTotal < minimumOrderAmount)) {
      setCoupon(null);
      setCouponDiscount(0);
    } else {
      let discountAmount = 0;
      if (coupon.discountType == DiscountType.PERCENT) {
        discountAmount = parseFloat(((coupon.discount / 100) * cartTotal).toFixed(2));
      } else {
        discountAmount = parseFloat((cartTotal - coupon.discount).toFixed(2));
      }
      setCouponDiscount(discountAmount);
    }
  }, [cartTotal, coupon]);

  useEffect(() => {
    // updating prescription here on update in cart items
    if (cartTotal == 0) {
      physicalPrescriptions.length > 0 && setPhysicalPrescriptions([]);
      ePrescriptions.length > 0 && setEPrescriptions([]);
    }
  }, [cartTotal]);

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
        cartTotal,
        totalPriceExcludingAnyDiscounts,
        cartSaving,
        discountSaving,
        normalSaving,
        circleSaving,
        grandTotal,
        couponDiscount,
        deliveryCharges,
        setAreaSelected,
        areaSelected,
        setDiagnosticAreas,
        diagnosticAreas,
        hcCharges,
        setHcCharges,
        modifyHcCharges,
        setModifyHcCharges,
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
        deliveryType,
        coupon,
        setCoupon,
        clinics,
        setClinics,
        clinicId,
        setClinicId,
        pinCode,
        setPinCode,
        clearDiagnoticCartInfo,
        diagnosticClinic,
        setDiagnosticClinic,
        diagnosticSlot,
        setDiagnosticSlot,
        isDiagnosticCircleSubscription,
        setIsDiagnosticCircleSubscription,
        showSelectPatient,
        setShowSelectPatient,
        getUniqueId,
        setUniqueId,
        testListingBreadCrumbs,
        setTestListingBreadCrumbs,
        testDetailsBreadCrumbs,
        setTestDetailsBreadCrumbs,
        newAddressAddedHomePage,
        setNewAddressAddedHomePage,
        newAddressAddedCartPage,
        setNewAddressAddedCartPage,
        showSelectedArea,
        setShowSelectedArea,
        isCartPagePopulated,
        setCartPagePopulated,
        asyncDiagnosticPincode,
        setAsyncDiagnosticPincode,
        modifiedOrderItemIds,
        setModifiedOrderItemIds,
      }}
    >
      {props.children}
    </DiagnosticsCartContext.Provider>
  );
};

export const useDiagnosticsCart = () =>
  useContext<DiagnosticsCartContextProps>(DiagnosticsCartContext);
