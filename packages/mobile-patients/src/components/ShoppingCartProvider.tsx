import { MEDICINE_DELIVERY_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Store } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import {
  validatePharmaCoupon_validatePharmaCoupon,
  validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice,
} from '@aph/mobile-patients/src/graphql/types/validatePharmaCoupon';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface ShoppingCartItem {
  id: string;
  name: string;
  mou: string; // pack of how many units (eg. 10 tablets)
  quantity: number;
  price: number;
  prescriptionRequired: boolean;
  thumbnail: string | null;
  specialPrice?: number;
  couponPrice?: number;
  isInStock: boolean;
  unserviceable?: boolean;
  isMedicine: boolean;
}

export interface PhysicalPrescription {
  title: string;
  fileType: string;
  // path: string;
  base64: string;
  uploadedUrl?: string;
  prismPrescriptionFileId?: string;
}

export interface EPrescription {
  id: string;
  uploadedUrl: string;
  // forPatientId?: string;
  forPatient: string;
  date: string;
  medicines: string;
  doctorName: string;
  prismPrescriptionFileId: string;
  message?: string;
  healthRecord?: boolean;
}

export interface PharmaCoupon extends validatePharmaCoupon_validatePharmaCoupon {
  code: string;
}

export type EPrescriptionDisableOption = 'CAMERA_AND_GALLERY' | 'E-PRESCRIPTION' | 'NONE';

export interface ShoppingCartContextProps {
  cartItems: ShoppingCartItem[];
  setCartItems: ((items: ShoppingCartItem[]) => void) | null;
  addCartItem: ((item: ShoppingCartItem) => void) | null;
  addMultipleCartItems: ((items: ShoppingCartItem[]) => void) | null;
  removeCartItem: ((itemId: ShoppingCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<ShoppingCartItem> & { id: ShoppingCartItem['id'] }) => void)
    | null;
  cartTotal: number;
  cartTotalOfRxProducts: number;
  couponDiscount: number;
  productDiscount: number;
  deliveryCharges: number;
  grandTotal: number;
  uploadPrescriptionRequired: boolean;

  stores: Store[];
  setStores: ((store: Store[]) => void) | null;

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

  storeId: string;
  setStoreId: ((id: string) => void) | null;
  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;

  coupon: PharmaCoupon | null;
  setCoupon: ((coupon: PharmaCoupon | null) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearCartInfo: (() => void) | null;
}

export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  cartItems: [],
  setCartItems: null,
  addCartItem: null,
  addMultipleCartItems: null,
  removeCartItem: null,
  updateCartItem: null,
  cartTotal: 0,
  cartTotalOfRxProducts: 0,
  couponDiscount: 0,
  productDiscount: 0,
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

  stores: [],
  setStores: null,
  pinCode: '',
  setPinCode: null,

  addresses: [],
  setAddresses: null,
  addAddress: null,

  coupon: null,
  setCoupon: null,

  deliveryAddressId: '',
  setDeliveryAddressId: null,
  storeId: '',
  setStoreId: null,
  deliveryType: null,
  clearCartInfo: null,
});

const AsyncStorageKeys = {
  cartItems: 'cartItems',
  ePrescriptions: 'ePrescriptions',
  physicalPrescriptions: 'physicalPrescriptions',
};

const showGenericAlert = (message: string) => {
  Alert.alert('Alert', message);
};

export const ShoppingCartProvider: React.FC = (props) => {
  const [cartItems, _setCartItems] = useState<ShoppingCartContextProps['cartItems']>([]);
  const [couponDiscount, setCouponDiscount] = useState<ShoppingCartContextProps['couponDiscount']>(
    0
  );
  const [productDiscount, setProductDiscount] = useState<
    ShoppingCartContextProps['productDiscount']
  >(0);
  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    ShoppingCartContextProps['deliveryAddressId']
  >('');
  const [storeId, _setStoreId] = useState<ShoppingCartContextProps['storeId']>('');
  const [coupon, setCoupon] = useState<ShoppingCartContextProps['coupon']>(null);
  const [deliveryType, setDeliveryType] = useState<ShoppingCartContextProps['deliveryType']>(null);

  const [physicalPrescriptions, _setPhysicalPrescriptions] = useState<
    ShoppingCartContextProps['physicalPrescriptions']
  >([]);

  const [ePrescriptions, _setEPrescriptions] = useState<ShoppingCartContextProps['ePrescriptions']>(
    []
  );

  const setEPrescriptions: ShoppingCartContextProps['setEPrescriptions'] = (items) => {
    _setEPrescriptions(items);
    AsyncStorage.setItem(AsyncStorageKeys.ePrescriptions, JSON.stringify(items)).catch(() => {
      showGenericAlert('Failed to save E-Prescriptions in local storage.');
    });
  };

  const setPhysicalPrescriptions: ShoppingCartContextProps['setPhysicalPrescriptions'] = (
    items
  ) => {
    AsyncStorage.setItem(AsyncStorageKeys.physicalPrescriptions, JSON.stringify(items)).catch(
      () => {
        showGenericAlert('Failed to save Physical Prescriptions in local storage.');
      }
    );
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
    // console.log('existingFilteredEPres\n', { existingFilteredEPres });
    const updatedEPres = [...existingFilteredEPres, ...itemsToAdd];
    // console.log('updatedEPres\n', { updatedEPres });
    setEPrescriptions(updatedEPres);
  };

  const setCartItems: ShoppingCartContextProps['setCartItems'] = (cartItems) => {
    _setCartItems(cartItems);
    AsyncStorage.setItem(AsyncStorageKeys.cartItems, JSON.stringify(cartItems)).catch(() => {
      showGenericAlert('Failed to save cart items in local storage.');
    });
  };

  const addCartItem: ShoppingCartContextProps['addCartItem'] = (itemToAdd) => {
    if (cartItems.find((item) => item.id == itemToAdd.id)) {
      return;
    }
    const newCartItems = [itemToAdd, ...cartItems];
    setCartItems(newCartItems);
  };

  const addMultipleCartItems: ShoppingCartContextProps['addMultipleCartItems'] = (itemsToAdd) => {
    // If tried to add same items (by id) which already exists in the cart, it will update with new values like quantity.
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

  const removeCartItem: ShoppingCartContextProps['removeCartItem'] = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(newCartItems);
  };
  const updateCartItem: ShoppingCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      setCartItems([...cartItems]);
    }
  };

  const cartTotal: ShoppingCartContextProps['cartTotal'] = parseFloat(
    cartItems
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const cartTotalOfRxProducts: ShoppingCartContextProps['cartTotalOfRxProducts'] = parseFloat(
    cartItems
      .filter((currItem) => currItem.prescriptionRequired == true)
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const deliveryCharges =
    !deliveryType || deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
      ? 0
      : deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY &&
        cartTotal > 0 &&
        cartTotal - couponDiscount < AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY
      ? AppConfig.Configuration.DELIVERY_CHARGES
      : 0;

  const grandTotal = parseFloat(
    (cartTotal + deliveryCharges - couponDiscount - productDiscount).toFixed(2)
  );

  const uploadPrescriptionRequired = cartItems.findIndex((item) => item.prescriptionRequired) != -1;

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
    setStoreId('');
    setPinCode('');
    setStores([]);
    setAddresses([]);
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
        CommonBugFender('ShoppingCartProvider_updateCartItemsFromStorage_try', error);
        showGenericAlert('Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  const getDiscountPrice = (
    cartItem: ShoppingCartItem,
    lineItems: validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice[]
  ) => {
    const foundItem = lineItems.find((item) => item.itemId == cartItem.id);
    return foundItem ? foundItem.discountedPrice : undefined;
  };

  useEffect(() => {
    // updating coupon discount here on update in cart or new coupon code applied

    if (cartTotal == 0) {
      setCouponDiscount(0);
      setProductDiscount(0);
      setCoupon(null);
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
      setCouponDiscount(g(coupon, 'discountedTotals', 'couponDiscount') || 0);
      setProductDiscount(g(coupon, 'discountedTotals', 'productDiscount') || 0);
      setCartItems(
        cartItems.map((item) => ({
          ...item,
          couponPrice: getDiscountPrice(
            item,
            coupon.pharmaLineItemsWithDiscountedPrice as validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice[]
          ),
        }))
      );
    } else {
      setCouponDiscount(0);
      setProductDiscount(productDiscount);
      setCartItems(cartItems.map((item) => ({ ...item, couponPrice: undefined })));
    }
  }, [cartTotal, coupon]);

  useEffect(() => {
    // updating prescription here on update in cart items
    if (cartTotalOfRxProducts == 0) {
      physicalPrescriptions.length > 0 && setPhysicalPrescriptions([]);
      ePrescriptions.length > 0 && setEPrescriptions([]);
    }
  }, [cartTotalOfRxProducts]);

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addCartItem,
        addMultipleCartItems,
        removeCartItem,
        updateCartItem,
        cartTotal, // MRP Total
        cartTotalOfRxProducts,
        grandTotal,
        couponDiscount,
        productDiscount,
        deliveryCharges,
        uploadPrescriptionRequired,

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

        stores,
        setStores,
        storeId,
        setStoreId,

        pinCode,
        setPinCode,

        coupon,
        setCoupon,

        deliveryType,
        clearCartInfo,
      }}
    >
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => useContext<ShoppingCartContextProps>(ShoppingCartContext);
