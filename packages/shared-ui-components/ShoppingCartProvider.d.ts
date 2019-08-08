import React from 'react';
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
    updateCartItem: ((itemUpdates: Partial<ShoppingCartItem> & {
        id: ShoppingCartItem['id'];
    }) => void) | null;
    cartTotal: number;
}
export declare const ShoppingCartContext: React.Context<ShoppingCartContextProps>;
export declare const ShoppingCartProvider: React.FC;
export declare const useShoppingCart: () => {
    cartItems: ShoppingCartItem[];
    addCartItem: (item: ShoppingCartItem) => void;
    removeCartItem: (itemId: string) => void;
    updateCartItem: (itemUpdates: Partial<ShoppingCartItem> & {
        id: string;
    }) => void;
    cartTotal: number;
};
