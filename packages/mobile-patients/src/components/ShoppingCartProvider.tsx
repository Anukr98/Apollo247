import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, AsyncStorage } from 'react-native';
import { MEDICINE_DELIVERY_TYPE, DiscountType } from '../graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '../graphql/types/savePatientAddress';
import { getCoupons_getCoupons_coupons } from '../graphql/types/getCoupons';
import { AppConfig } from '../strings/AppConfig';

export interface ShoppingCartItem {
  id: string;
  name: string;
  mou: string; // pack of how many units (eg. 10 tablets)
  quantity: number;
  price: number;
  prescriptionRequired: boolean;
}

export interface PhysicalPrescription {
  title: string;
  path: string;
  base64: string;
}
type addressType = {
  id?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  landmark?: string | null;
  createdDate?: any | null;
  updatedDate?: any | null;
};

export interface ShoppingCartContextProps {
  cartItems: ShoppingCartItem[];
  addCartItem: ((item: ShoppingCartItem) => void) | null;
  removeCartItem: ((itemId: ShoppingCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<ShoppingCartItem> & { id: ShoppingCartItem['id'] }) => void)
    | null;
  cartTotal: number;
  cartTotalOfPharmaProducts: number;
  couponDiscount: number;
  deliveryCharges: number;
  grandTotal: number;
  uploadPrescriptionRequired: boolean;

  addPhysicalPrescription: ((item: PhysicalPrescription) => void) | null;
  setPhysicalPrescriptions: ((items: PhysicalPrescription[]) => void) | null;
  updatePhysicalPrescription:
    | ((
        itemUpdates: Partial<PhysicalPrescription> & { title: PhysicalPrescription['title'] }
      ) => void)
    | null;
  removePhysicalPrescription: ((title: string) => void) | null;
  physicalPrescriptions: PhysicalPrescription[];

  addresses: addressType[];
  setAddresses: ((addresses: addressType[]) => void) | null;
  addAddress: ((address: addressType) => void) | null;
  deliveryAddressId: string;
  setDeliveryAddressId: ((id: string) => void) | null;

  storeId: string;
  setStoreId: ((id: string) => void) | null;

  coupon: getCoupons_getCoupons_coupons | null;
  setCoupon: ((id: getCoupons_getCoupons_coupons) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearCartInfo: (() => void) | null;
}

export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  cartItems: [],
  addCartItem: null,
  removeCartItem: null,
  updateCartItem: null,
  cartTotal: 0,
  cartTotalOfPharmaProducts: 0,
  couponDiscount: 0,
  deliveryCharges: 0,
  grandTotal: 0,
  uploadPrescriptionRequired: false,
  setPhysicalPrescriptions: null,
  addPhysicalPrescription: null,
  updatePhysicalPrescription: null,
  removePhysicalPrescription: null,
  physicalPrescriptions: [],

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

export const ShoppingCartProvider: React.FC = (props) => {
  const [cartItems, setCartItems] = useState<ShoppingCartContextProps['cartItems']>([]);
  const [couponDiscount, setCouponDiscount] = useState<ShoppingCartContextProps['couponDiscount']>(
    0
  );
  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    ShoppingCartContextProps['deliveryAddressId']
  >('');
  const [storeId, _setStoreId] = useState<ShoppingCartContextProps['storeId']>('');
  const [coupon, setCoupon] = useState<ShoppingCartContextProps['coupon']>(null);
  const [deliveryType, setDeliveryType] = useState<ShoppingCartContextProps['deliveryType']>(null);

  const [physicalPrescriptions, setPhysicalPrescriptions] = useState<
    ShoppingCartContextProps['physicalPrescriptions']
  >([]);

  const saveCartItems = (cartItems: ShoppingCartItem[]) => {
    AsyncStorage.setItem('cartItems', JSON.stringify(cartItems)).catch(() => {
      Alert.alert('Error', 'Failed to save cart items in local storage.');
    });
  };

  const addCartItem: ShoppingCartContextProps['addCartItem'] = (itemToAdd) => {
    const newCartItems = [...cartItems, itemToAdd];
    saveCartItems(newCartItems);
    setCartItems(newCartItems);
  };

  const removeCartItem: ShoppingCartContextProps['removeCartItem'] = (id) => {
    const newCartItems = cartItems.filter((item) => item.id !== id);
    saveCartItems(newCartItems);
    setCartItems(newCartItems);
  };
  const updateCartItem: ShoppingCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      saveCartItems([...cartItems]);
      setCartItems([...cartItems]);
    }
  };

  const cartTotal: ShoppingCartContextProps['cartTotal'] = parseFloat(
    cartItems
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const cartTotalOfPharmaProducts: ShoppingCartContextProps['cartTotalOfPharmaProducts'] = parseFloat(
    cartItems
      .filter((currItem) => currItem.prescriptionRequired == true)
      .reduce((currTotal, currItem) => currTotal + currItem.quantity * currItem.price, 0)
      .toFixed(2)
  );

  const deliveryCharges =
    cartTotal > 0 && cartTotal < AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY
      ? AppConfig.Configuration.DELIVERY_CHARGES
      : 0;

  const grandTotal = parseFloat((cartTotal + deliveryCharges - couponDiscount).toFixed(2));

  const uploadPrescriptionRequired = cartItems.findIndex((item) => item.prescriptionRequired) != -1;

  const addAddress = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setAddresses([address, ...addresses]);
  };

  const setStoreId = (id: ShoppingCartContextProps['storeId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.STORE_PICKUP);
    _setStoreId(id);
    _setDeliveryAddressId('');
  };

  const setDeliveryAddressId = (id: ShoppingCartContextProps['deliveryAddressId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.HOME_DELIVERY);
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

  const clearCartInfo = () => {
    AsyncStorage.setItem('cartItems', '').catch(() => {
      Alert.alert('Alert', 'Failed to clear cart items from local storage.');
    });
    setPhysicalPrescriptions([]);
    setCartItems([]);
    setDeliveryAddressId('');
    setStoreId('');
    setCoupon(null);
  };

  useEffect(() => {
    const updateCartItemsFromStorage = async () => {
      try {
        const cartItemsFromStorage = await AsyncStorage.getItem('cartItems');
        setCartItems(JSON.parse(cartItemsFromStorage || 'null') || []);
      } catch (error) {
        Alert.alert('Alert', 'Failed to get cart items from local storage.');
      }
    };
    updateCartItemsFromStorage();
  }, []);

  useEffect(() => {
    // updating coupon discount here on update in cart or new coupon code applied
    const minimumOrderAmount = coupon && coupon.minimumOrderAmount;
    if (!coupon || (minimumOrderAmount && cartTotalOfPharmaProducts < minimumOrderAmount)) {
      setCoupon(null);
      setCouponDiscount(0);
    } else {
      let discountAmount = 0;
      if (coupon.discountType == DiscountType.PERCENT) {
        discountAmount = parseFloat(
          ((coupon.discount / 100) * cartTotalOfPharmaProducts).toFixed(2)
        );
      } else {
        discountAmount = parseFloat((cartTotalOfPharmaProducts - coupon.discount).toFixed(2));
      }
      setCouponDiscount(discountAmount);
    }
  }, [cartTotalOfPharmaProducts, coupon]);

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addCartItem,
        removeCartItem,
        updateCartItem,
        cartTotal,
        cartTotalOfPharmaProducts,
        grandTotal,
        couponDiscount,
        deliveryCharges,
        uploadPrescriptionRequired,

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

        storeId,
        setStoreId,

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
