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
  updateItem:
    | ((itemUpdates: Partial<ShoppingCartItem> & { id: ShoppingCartItem['id'] }) => void)
    | null;
  total: number;
}
export const ShoppingCartContext = createContext<ShoppingCartContextProps>({
  items: [],
  addItem: null,
  removeItem: null,
  updateItem: null,
  total: 0,
});

export const ShoppingCartProvider: React.FC = (props) => {
  const [items, setItems] = useState<ShoppingCartContextProps['items']>([]);

  const addItem: ShoppingCartContextProps['addItem'] = (itemToAdd) =>
    setItems([...items, itemToAdd]);

  const removeItem: ShoppingCartContextProps['removeItem'] = (id) =>
    setItems(items.filter((item) => item.id !== id));

  const updateItem: ShoppingCartContextProps['updateItem'] = (itemUpdates) => {
    const foundIndex = items.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      items[foundIndex] = { ...items[foundIndex], ...itemUpdates };
      setItems([...items]);
    }
  };

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
        updateItem,
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
  updateItem: useShoppingCartContext().updateItem!,
  total: useShoppingCartContext().total,
});
