import React, { useState, createContext, useContext } from 'react';

export interface MedicineCartItem {
  id: string;
  name: string;
  description: string;
  forPatientId: string;
  quantity: number;
  price: number;
  subscribed: boolean;
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
  const [cartItems, setCartItems] = useState<MedicineCartContextProps['cartItems']>([]);

  const addCartItem: MedicineCartContextProps['addCartItem'] = (itemToAdd) =>
    setCartItems([...cartItems, itemToAdd]);

  const removeCartItem: MedicineCartContextProps['removeCartItem'] = (id) =>
    setCartItems(cartItems.filter((item) => item.id !== id));

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
});
