import { getCoupons_getCoupons_coupons } from '@aph/mobile-patients/src/graphql/types/getCoupons';
import {
  DiscountType,
  MEDICINE_DELIVERY_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Clinic } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, AsyncStorage } from 'react-native';
import {
  EPrescription,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

export interface DiagnosticsCartItem {
  id: string;
  name: string;
  mou: number; // package of how many tests (eg. 10)
  price: number;
  thumbnail: string | null;
  specialPrice?: number;
  collectionMethod: TEST_COLLECTION_TYPE; // Home or Clinic (most probably `H` will not be an option)
}

export interface DiagnosticClinic extends Clinic {
  date: number; // timestamp
}

export interface DiagnosticSlot {
  employeeSlotId: number;
  diagnosticBranchCode: string;
  diagnosticEmployeeCode: string;
  slotStartTime: string;
  slotEndTime: string;
  city: string;
  date: number; // timestamp
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
  couponDiscount: number;
  deliveryCharges: number;
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
  clearCartInfo: (() => void) | null;

  diagnosticSlot: DiagnosticSlot | null;
  setDiagnosticSlot: ((item: DiagnosticSlot | null) => void) | null;

  diagnosticClinic: DiagnosticClinic | null;
  setDiagnosticClinic: ((item: DiagnosticClinic) => void) | null;
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
  couponDiscount: 0,
  deliveryCharges: 0,
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
  addresses: [],
  setAddresses: null,
  addAddress: null,
  clinicId: '',
  setClinicId: null,
  deliveryType: null,

  pinCode: '',
  setPinCode: null,

  clearCartInfo: null,

  diagnosticClinic: null,
  diagnosticSlot: null,
  setDiagnosticClinic: null,
  setDiagnosticSlot: null,
});

const showGenericAlert = (message: string) => {
  Alert.alert('Alert', message);
};

export const DiagnosticsCartProvider: React.FC = (props) => {
  // const { currentPatient } = useAllCurrentPatients();
  const id = ''; //(currentPatient && currentPatient.id) || '';
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

  const [deliveryType, setDeliveryType] = useState<DiagnosticsCartContextProps['deliveryType']>(
    null
  );

  const [physicalPrescriptions, _setPhysicalPrescriptions] = useState<
    DiagnosticsCartContextProps['physicalPrescriptions']
  >([]);

  const [ePrescriptions, _setEPrescriptions] = useState<
    DiagnosticsCartContextProps['ePrescriptions']
  >([]);

  const [diagnosticClinic, _setDiagnosticClinic] = useState<
    DiagnosticsCartContextProps['diagnosticClinic']
  >(null);

  const [diagnosticSlot, _setDiagnosticSlot] = useState<
    DiagnosticsCartContextProps['diagnosticSlot']
  >(null);

  const setDiagnosticClinic: DiagnosticsCartContextProps['setDiagnosticClinic'] = (item) => {
    _setDiagnosticClinic(item);
    _setDiagnosticSlot(null);
    _setDeliveryAddressId('');
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

  const addMultipleEPrescriptions: DiagnosticsCartContextProps['addMultipleEPrescriptions'] = (
    itemsToAdd
  ) => {
    const existingFilteredEPres = ePrescriptions.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    // console.log('existingFilteredEPres\n', { existingFilteredEPres });
    const updatedEPres = [...existingFilteredEPres, ...itemsToAdd];
    // console.log('updatedEPres\n', { updatedEPres });
    setEPrescriptions(updatedEPres);
  };

  const addAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setAddresses([address, ...addresses]);
  };

  const setCartItems: DiagnosticsCartContextProps['setCartItems'] = (cartItems) => {
    _setCartItems(cartItems);
    AsyncStorage.setItem(AsyncStorageKeys.cartItems, JSON.stringify(cartItems)).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  const addCartItem: DiagnosticsCartContextProps['addCartItem'] = (itemToAdd) => {
    if (cartItems.find((item) => item.id == itemToAdd.id)) {
      return;
    }
    const newCartItems = [itemToAdd, ...cartItems];
    setCartItems(newCartItems);
  };

  const addMultipleCartItems: DiagnosticsCartContextProps['addMultipleCartItems'] = (
    itemsToAdd
  ) => {
    // If tried to add same items(by id) which already exists in the cart, it will update with new values.
    const existingFilteredCartItems = cartItems.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    // console.log('existingFilteredCartItems\n', { existingFilteredCartItems });
    const newCartItems = [
      ...existingFilteredCartItems,
      ...itemsToAdd.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i),
    ];
    // console.log('newCartItems\n', { newCartItems });
    setCartItems(newCartItems);
  };

  const removeCartItem: DiagnosticsCartContextProps['removeCartItem'] = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(newCartItems);
  };
  const updateCartItem: DiagnosticsCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      setCartItems([...cartItems]);
    }
  };

  const cartTotal: DiagnosticsCartContextProps['cartTotal'] = parseFloat(
    cartItems
      .reduce((currTotal, currItem) => currTotal + (currItem.specialPrice || currItem.price), 0)
      .toFixed(2)
  );

  const deliveryCharges =
    deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
      ? 0
      : cartTotal > 0 && cartTotal < AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY
      ? AppConfig.Configuration.DIASGNOS_DELIVERY_CHARGES
      : 0;

  const grandTotal = parseFloat((cartTotal + deliveryCharges - couponDiscount).toFixed(2));

  const setClinicId = (id: DiagnosticsCartContextProps['clinicId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.STORE_PICKUP);
    _setClinicId(id);
    // _setDeliveryAddressId('');
  };

  const setDeliveryAddressId = (id: DiagnosticsCartContextProps['deliveryAddressId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.HOME_DELIVERY);
    _setDeliveryAddressId(id);
    // _setClinicId('');
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

  const clearCartInfo = () => {
    setPhysicalPrescriptions([]);
    setEPrescriptions([]);
    setCartItems([]);
    setDeliveryAddressId('');
    setClinicId('');
    setPinCode('');
    setClinics([]);
    setCoupon(null);
    setDiagnosticSlot(null);
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
        grandTotal,
        couponDiscount,
        deliveryCharges,

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
        deliveryType,
        coupon,
        setCoupon,

        clinics,
        setClinics,

        clinicId,
        setClinicId,

        pinCode,
        setPinCode,

        clearCartInfo,

        diagnosticClinic,
        setDiagnosticClinic,
        diagnosticSlot,
        setDiagnosticSlot,
      }}
    >
      {props.children}
    </DiagnosticsCartContext.Provider>
  );
};

export const useDiagnosticsCart = () =>
  useContext<DiagnosticsCartContextProps>(DiagnosticsCartContext);
