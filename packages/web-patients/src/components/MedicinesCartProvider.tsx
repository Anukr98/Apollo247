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

export interface MedicineCartContextProps {
  cartItems: MedicineCartItem[];
  addCartItem: ((item: MedicineCartItem) => void) | null;
  removeCartItem: ((itemId: MedicineCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<MedicineCartItem> & { id: MedicineCartItem['id'] }) => void)
    | null;
  cartTotal: number;
}

export const MedicinesCartContext = createContext<MedicineCartContextProps>({
  cartItems: [],
  addCartItem: null,
  removeCartItem: null,
  updateCartItem: null,
  cartTotal: 0,
});

export const MedicinesCartProvider: React.FC = (props) => {
  const [cartItems, setCartItems] = useState<MedicineCartContextProps['cartItems']>(
    localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems') || '') : []
  );

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // const newQuoteId = () => {
  //   let quoteId = '';
  //   axios
  //     .post(quoteUrl)
  //     .then((data) => {
  //       if (data.data.quote_id) {
  //         localStorage.setItem('quoteId', data.data.quote_id);
  //         quoteId = data.data.quote_id;
  //       }
  //     })
  //     .catch((err) => {
  //       alert(err);
  //     });
  //   return quoteId;
  // };

  // const getQuoteId = () => {
  //   if (localStorage.getItem('quoteId')) return localStorage.getItem('quoteId');
  //   else return newQuoteId();
  // };

  // const getCartId = () => {
  //   return 0;
  // };

  const addCartItem: MedicineCartContextProps['addCartItem'] = (itemToAdd) => {
    setCartItems([...cartItems, itemToAdd]);
  };

  const removeCartItem: MedicineCartContextProps['removeCartItem'] = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateCartItem: MedicineCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      setCartItems([...cartItems]);
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
        addCartItem,
        removeCartItem,
        updateCartItem,
        cartTotal,
        // getQuoteId,
        // getCartId,
      }}
    >
      {props.children}
    </MedicinesCartContext.Provider>
  );
};

const useShoppingCartContext = () => useContext<MedicineCartContextProps>(MedicinesCartContext);

export const useShoppingCart = () => ({
  cartItems: useShoppingCartContext().cartItems,
  addCartItem: useShoppingCartContext().addCartItem!,
  removeCartItem: useShoppingCartContext().removeCartItem!,
  updateCartItem: useShoppingCartContext().updateCartItem!,
  cartTotal: useShoppingCartContext().cartTotal,
  // quoteId: useShoppingCartContext().getQuoteId,
  // cartId: useShoppingCartContext().getCartId,
});
