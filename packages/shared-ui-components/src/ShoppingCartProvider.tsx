import React, { useState, createContext, useContext } from 'react';

export interface ShoppingCartItem {
  id: string;
  name: string;
  description: string;
  forPatientId: string;
  quantity: number;
  price: number;
  subscribed: boolean;
}

export interface ShoppingCartContextProps {
  cartItems: ShoppingCartItem[];
  addCartItem: ((item: ShoppingCartItem) => void) | null;
  removeCartItem: ((itemId: ShoppingCartItem['id']) => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<ShoppingCartItem> & { id: ShoppingCartItem['id'] }) => void)
    | null;
  cartTotal: number;
}
export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  cartItems: [],
  addCartItem: null,
  removeCartItem: null,
  updateCartItem: null,
  cartTotal: 0,
});

export const ShoppingCartProvider: React.FC = (props) => {
  const [cartItems, setCartItems] = useState<ShoppingCartContextProps['cartItems']>([]);

  const addCartItem: ShoppingCartContextProps['addCartItem'] = (itemToAdd) =>
    setCartItems([...cartItems, itemToAdd]);

  const removeCartItem: ShoppingCartContextProps['removeCartItem'] = (id) =>
    setCartItems(cartItems.filter((item) => item.id !== id));

  const updateCartItem: ShoppingCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...itemUpdates };
      setCartItems([...cartItems]);
    }
  };

  const cartTotal: ShoppingCartContextProps['cartTotal'] = cartItems.reduce(
    (currTotal, currItem) => currTotal + currItem.quantity * currItem.price,
    0
  );

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addCartItem,
        removeCartItem,
        updateCartItem,
        cartTotal,
      }}
    >
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

const useShoppingCartContext = () => useContext<ShoppingCartContextProps>(ShoppingCartContext);

export const useShoppingCart = () => ({
  cartItems: useShoppingCartContext().cartItems,
  addCartItem: useShoppingCartContext().addCartItem!,
  removeCartItem: useShoppingCartContext().removeCartItem!,
  updateCartItem: useShoppingCartContext().updateCartItem!,
  cartTotal: useShoppingCartContext().cartTotal,
});
