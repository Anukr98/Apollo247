import { getCoupons_getCoupons_coupons } from '@aph/mobile-patients/src/graphql/types/getCoupons';
import {
  DiscountType,
  MEDICINE_DELIVERY_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Store } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, AsyncStorage } from 'react-native';
import { useAllCurrentPatients } from '../hooks/authHooks';
import { EPrescription, PhysicalPrescription } from './ShoppingCartProvider';

export interface DiagnosticsCartItem {
  id: string;
  name: string;
  mou: string; // pack of how many units (eg. 10 tablets)
  price: number;
  thumbnail: string | null;
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

  ePrescriptions: EPrescription[];
  addEPrescription: ((item: EPrescription) => void) | null;
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

  deliveryAddressId: string;
  setDeliveryAddressId: ((id: string) => void) | null;
  clinicId: string;
  setClinicId: ((id: string) => void) | null;

  clinics: Store[];
  setClinics: ((store: Store[]) => void) | null;

  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;

  coupon: getCoupons_getCoupons_coupons | null;
  setCoupon: ((id: getCoupons_getCoupons_coupons) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearCartInfo: (() => void) | null;
}

export const ShoppingCartContext = createContext<DiagnosticsCartContextProps>({
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

  ePrescriptions: [],
  addEPrescription: null,
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
  clinicId: '',
  setClinicId: null,
  deliveryType: null,

  pinCode: '',
  setPinCode: null,

  clearCartInfo: null,
});

const showGenericAlert = (message: string) => {
  Alert.alert('Alert', message);
};

export const ShoppingCartProvider: React.FC = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const id = (currentPatient && currentPatient.id) || '';
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

  const [clinics, setClinics] = useState<Store[]>([]);
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

  const addMultipleCartItems: DiagnosticsCartContextProps['addMultipleCartItems'] = (items) => {
    // TODO
    // if (cartItems.find((item) => item.id == itemToAdd.id)) {
    //   return;
    // }
    // const newCartItems = [itemToAdd, ...cartItems];
    // setCartItems(newCartItems);
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
    cartItems.reduce((currTotal, currItem) => currTotal + currItem.price, 0).toFixed(2)
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
    _setDeliveryAddressId('');
  };

  const setDeliveryAddressId = (id: DiagnosticsCartContextProps['deliveryAddressId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.HOME_DELIVERY);
    _setDeliveryAddressId(id);
    _setClinicId('');
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
      physicalPrescriptions[foundIndex] = { ...physicalPrescriptions[foundIndex], ...itemUpdates };
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
    <ShoppingCartContext.Provider
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

        ePrescriptions,
        addEPrescription,
        removeEPrescription,
        setEPrescriptions,

        physicalPrescriptions,
        setPhysicalPrescriptions,
        addPhysicalPrescription,
        updatePhysicalPrescription,
        removePhysicalPrescription,

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
      }}
    >
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

export const useDiagnosticsCart = () =>
  useContext<DiagnosticsCartContextProps>(ShoppingCartContext);
