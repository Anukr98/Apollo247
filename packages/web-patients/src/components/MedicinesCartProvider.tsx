/** Acknowledgement: This work is based on the POC done by Kabir Sarin :) **/

import React, { useState, createContext, useContext, useEffect } from 'react';

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
  deliveryAddress: any;
  setDeliveryAddress: any;
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
  deliveryAddress: [],
  setDeliveryAddress: null,
});

export const MedicinesCartProvider: React.FC = (props) => {
  const [cartItems, setCartItems] = useState<MedicineCartContextProps['cartItems']>(
    localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems') || '') : []
  );

  const [itemsStr, setItemsStr] = useState<MedicineCartContextProps['itemsStr']>(
    JSON.stringify(cartItems || {})
  );

  const [storePickupPincode, setStorePickupPincode] = useState<
    MedicineCartContextProps['storePickupPincode']
  >(null);

  const [stores, setStores] = useState<MedicineCartContextProps['stores']>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<
    MedicineCartContextProps['deliveryAddress']
  >([]);

  useEffect(() => {
    const items = JSON.stringify(cartItems);
    localStorage.setItem('cartItems', items);
    setItemsStr(items);
  }, [cartItems]);

  const addCartItem: MedicineCartContextProps['addCartItem'] = (itemToAdd) => {
    setCartItems([...cartItems, itemToAdd]);
  };

  const removeCartItem: MedicineCartContextProps['removeCartItem'] = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateCartItem: MedicineCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      // cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = cartItems[foundIndex].quantity + itemUpdates.quantity;
        setCartItems([...cartItems]);
      }
    }
  };

  const updateCartItemQty: MedicineCartContextProps['updateCartItemQty'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = itemUpdates.quantity;
        setCartItems([...cartItems]);
      }
    }
  };

  const cartTotal: MedicineCartContextProps['cartTotal'] = cartItems.reduce(
    (currTotal, currItem) => currTotal + currItem.quantity * currItem.price,
    0
  );

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
        deliveryAddress,
        setDeliveryAddress,
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
  deliveryAddress: useShoppingCartContext().deliveryAddress,
  setDeliveryAddress: useShoppingCartContext().setDeliveryAddress,
});
