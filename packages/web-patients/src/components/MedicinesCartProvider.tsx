/** Acknowledgement: This work is based on the POC done by Kabir Sarin :) **/

import React, { useState, createContext, useContext, useEffect } from 'react';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';

// import axios from 'axios';
// const quoteUrl = 'http://api.apollopharmacy.in/apollo_api.php?type=guest_quote';

export interface MedicineCartItem {
  description: string;
  id: number;
  image: string | null;
  is_in_stock: boolean;
  is_prescription_required: '0' | '1';
  name: string;
  price: number;
  special_price: number | string;
  sku: string;
  small_image?: string | null;
  status: number;
  thumbnail: string | null;
  type_id: string;
  quantity: number;
  mou: string;
}

export interface StoreAddresses {
  address: string;
  city: string;
  message: string;
  phone: string;
  state: string;
  storeid: string;
  storename: string;
  workinghrs: string;
}

export interface MedicineCartContextProps {
  itemsStr: string | null;
  cartItems: MedicineCartItem[];
  addCartItem: ((item: MedicineCartItem) => void) | null;
  removeCartItem: ((itemId: MedicineCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<MedicineCartItem> & { id: MedicineCartItem['id'] }) => void)
    | null;
  updateCartItemQty: ((item: MedicineCartItem) => void) | null;
  cartTotal: number;
  storePickupPincode: string | null;
  setStorePickupPincode: ((storePickupPincode: string | null) => void) | null;
  stores: StoreAddresses[];
  setStores: ((stores: StoreAddresses[]) => void) | null;
  deliveryAddressId: string;
  setDeliveryAddressId: ((deliveryAddressId: string) => void) | null;
  deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[];
  setDeliveryAddresses:
    | ((deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[]) => void)
    | null;
  clearCartInfo: (() => void) | null;
  addMultipleCartItems: ((items: MedicineCartItem[]) => void) | null;
}

export const MedicinesCartContext = createContext<MedicineCartContextProps>({
  itemsStr: null,
  cartItems: [],
  addCartItem: null,
  removeCartItem: null,
  updateCartItem: null,
  updateCartItemQty: null,
  cartTotal: 0,
  storePickupPincode: null,
  setStorePickupPincode: null,
  stores: [],
  setStores: null,
  deliveryAddressId: '',
  setDeliveryAddressId: null,
  deliveryAddresses: [],
  setDeliveryAddresses: null,
  clearCartInfo: null,
  addMultipleCartItems: null,
});

export const MedicinesCartProvider: React.FC = (props) => {
  const [cartItems, setCartItems] = useState<MedicineCartContextProps['cartItems']>(
    localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems') || '') : []
  );
  const [isCartUpdated, setIsCartUpdated] = useState<boolean>(false);

  const [itemsStr, setItemsStr] = useState<MedicineCartContextProps['itemsStr']>(
    JSON.stringify(cartItems || {})
  );

  const [storePickupPincode, setStorePickupPincode] = useState<
    MedicineCartContextProps['storePickupPincode']
  >(null);

  const [stores, setStores] = useState<MedicineCartContextProps['stores']>([]);
  const [deliveryAddressId, setDeliveryAddressId] = useState<
    MedicineCartContextProps['deliveryAddressId']
  >('');

  const [deliveryAddresses, setDeliveryAddresses] = useState<
    MedicineCartContextProps['deliveryAddresses']
  >([]);

  useEffect(() => {
    if (isCartUpdated) {
      const items = JSON.stringify(cartItems);
      localStorage.setItem('cartItems', items);
      setItemsStr(items);
      setIsCartUpdated(false);
    }
  }, [cartItems, isCartUpdated]);

  const addCartItem: MedicineCartContextProps['addCartItem'] = (itemToAdd) => {
    setCartItems([...cartItems, itemToAdd]);
    setIsCartUpdated(true);
  };

  const removeCartItem: MedicineCartContextProps['removeCartItem'] = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    setIsCartUpdated(true);
  };

  const updateCartItem: MedicineCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      // cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = cartItems[foundIndex].quantity + itemUpdates.quantity;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateCartItemQty: MedicineCartContextProps['updateCartItemQty'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = itemUpdates.quantity;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const addMultipleCartItems: MedicineCartContextProps['addMultipleCartItems'] = (itemsToAdd) => {
    const existingCartItems = cartItems;
    const newCartItems = cartItems;
    itemsToAdd.forEach((item: MedicineCartItem) => {
      const foundIdx = existingCartItems.findIndex((existingItem) => existingItem.id === item.id);
      if (foundIdx >= 0) {
        newCartItems[foundIdx].quantity = newCartItems[foundIdx].quantity + item.quantity;
      } else {
        newCartItems.push(item);
      }
    });
    setCartItems(newCartItems);
    setIsCartUpdated(true);
  };

  const cartTotal: MedicineCartContextProps['cartTotal'] = cartItems.reduce(
    (currTotal, currItem) => currTotal + currItem.quantity * currItem.price,
    0
  );

  const clearCartInfo = () => {
    setCartItems([]);
    setDeliveryAddressId('');
    setStores([]);
    setDeliveryAddresses([]);
    setStorePickupPincode('');
  };

  return (
    <MedicinesCartContext.Provider
      value={{
        cartItems,
        itemsStr,
        addCartItem,
        removeCartItem,
        updateCartItem,
        updateCartItemQty,
        cartTotal,
        setStorePickupPincode,
        storePickupPincode,
        stores,
        setStores,
        deliveryAddressId,
        setDeliveryAddressId,
        deliveryAddresses,
        setDeliveryAddresses,
        clearCartInfo,
        addMultipleCartItems,
      }}
    >
      {props.children}
    </MedicinesCartContext.Provider>
  );
};

const useShoppingCartContext = () => useContext<MedicineCartContextProps>(MedicinesCartContext);

export const useShoppingCart = () => ({
  cartItems: useShoppingCartContext().cartItems,
  addCartItem: useShoppingCartContext().addCartItem,
  removeCartItem: useShoppingCartContext().removeCartItem,
  updateCartItem: useShoppingCartContext().updateCartItem,
  updateCartItemQty: useShoppingCartContext().updateCartItemQty,
  cartTotal: useShoppingCartContext().cartTotal,
  setStorePickupPincode: useShoppingCartContext().setStorePickupPincode,
  storePickupPincode: useShoppingCartContext().storePickupPincode,
  stores: useShoppingCartContext().stores,
  setStores: useShoppingCartContext().setStores,
  deliveryAddressId: useShoppingCartContext().deliveryAddressId,
  setDeliveryAddressId: useShoppingCartContext().setDeliveryAddressId,
  deliveryAddresses: useShoppingCartContext().deliveryAddresses,
  setDeliveryAddresses: useShoppingCartContext().setDeliveryAddresses,
  clearCartInfo: useShoppingCartContext().clearCartInfo,
  addMultipleCartItems: useShoppingCartContext().addMultipleCartItems,
});
