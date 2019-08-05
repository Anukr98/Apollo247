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
  items: ShoppingCartItem[];
  addItem: ((item: ShoppingCartItem) => void) | null;
  removeItem: ((itemId: ShoppingCartItem['id']) => void) | null;
  total: number;
}

export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  items: [],
  addItem: null,
  removeItem: null,
  total: 0,
});

export const ShoppingCartProvider: React.FC = (props) => {
  const [items, setItems] = useState<ShoppingCartContextProps['items']>([]);
  const addItem: ShoppingCartContextProps['addItem'] = (itemToAdd) =>
    setItems([...items, itemToAdd]);
  const removeItem: ShoppingCartContextProps['removeItem'] = (id) =>
    setItems(items.filter((item) => item.id !== id));
  const total: ShoppingCartContextProps['total'] = items.reduce(
    (currTotal, currItem) => currTotal + currItem.quantity * currItem.price,
    0
  );
  return (
    <ShoppingCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        total,
      }}
    >
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

const useShoppingCartContext = () => useContext<ShoppingCartContextProps>(ShoppingCartContext);

export const useShoppingCart = () => ({
  items: useShoppingCartContext().items,
  addItem: useShoppingCartContext().addItem!,
  removeItem: useShoppingCartContext().removeItem!,
  total: useShoppingCartContext().total,
});
