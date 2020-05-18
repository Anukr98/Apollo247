/** Acknowledgement: This work is based on the POC done by Kabir Sarin :) **/

import React, { useState, createContext, useContext, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _uniq from 'lodash/uniq';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients } from 'hooks/authHooks';

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
  isShippable: boolean;
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

export interface PrescriptionFormat {
  name: string | null;
  imageUrl: string | null;
  fileType: string;
  baseFormat: string;
}

export interface EPrescription {
  id: string;
  uploadedUrl: string;
  forPatient: string;
  date: string;
  medicines: string;
  doctorName: string;
  prismPrescriptionFileId: string;
}

export interface MedicineCartContextProps {
  itemsStr: string | null;
  cartItems: MedicineCartItem[];
  setCartItems: ((cartItems: MedicineCartItem[]) => void) | null;
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
  storeAddressId: string;
  setStoreAddressId: ((deliveryAddressId: string) => void) | null;
  deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[];
  setDeliveryAddresses:
    | ((deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[]) => void)
    | null;
  clearCartInfo: (() => void) | null;
  addMultipleCartItems: ((items: MedicineCartItem[]) => void) | null;
  prescriptions: PrescriptionFormat[] | null;
  setPrescriptions: ((prescriptions: PrescriptionFormat[] | null) => void) | null;
  setPrescriptionUploaded: ((prescriptionUploaded: PrescriptionFormat | null) => void) | null;
  prescriptionUploaded: PrescriptionFormat | null;
  ePrescriptionData: EPrescription[] | null;
  setEPrescriptionData: ((ePrescriptionData: EPrescription[] | null) => void) | null;
  uploadedEPrescription: boolean | null;
  setUploadedEPrescription: ((uploadedEPrescription: boolean | null) => void) | null;
  medicineCartType: string | null;
  updateItemShippingStatus: ((item: any) => void) | null;
  cartTat: boolean | null;
  changeCartTatStatus: ((status: boolean) => void) | null;
  setCouponCode: ((couponCode: string) => void) | null;
  couponCode: string;
}

export const MedicinesCartContext = createContext<MedicineCartContextProps>({
  itemsStr: null,
  cartItems: [],
  setCartItems: null,
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
  setStoreAddressId: null,
  storeAddressId: '',
  deliveryAddresses: [],
  setDeliveryAddresses: null,
  clearCartInfo: null,
  addMultipleCartItems: null,
  prescriptions: null,
  setPrescriptions: null,
  ePrescriptionData: null,
  setEPrescriptionData: null,
  prescriptionUploaded: null,
  setPrescriptionUploaded: null,
  uploadedEPrescription: null,
  setUploadedEPrescription: null,
  medicineCartType: '',
  updateItemShippingStatus: null,
  cartTat: false,
  changeCartTatStatus: null,
  couponCode: null,
  setCouponCode: null,
});

enum CartTypes {
  PHARMA = 'PHARMA',
  FMCG = 'FMCG',
  BOTH = 'BOTH',
}

export const MedicinesCartProvider: React.FC = (props) => {
  const [couponCode, setCouponCode] = React.useState<string>('');
  const defPresObject = {
    name: '',
    imageUrl: '',
    fileType: '',
    baseFormat: '',
  };
  const { currentPatient } = useAllCurrentPatients();

  const [storePickupPincode, setStorePickupPincode] = useState<
    MedicineCartContextProps['storePickupPincode']
  >(null);

  const [cartTat, setCartTat] = useState<boolean>(false);

  const [stores, setStores] = useState<MedicineCartContextProps['stores']>([]);
  const [deliveryAddressId, setDeliveryAddressId] = useState<
    MedicineCartContextProps['deliveryAddressId']
  >('');

  const [storeAddressId, setStoreAddressId] = useState<MedicineCartContextProps['storeAddressId']>(
    ''
  );

  const [deliveryAddresses, setDeliveryAddresses] = useState<
    MedicineCartContextProps['deliveryAddresses']
  >([]);

  const [prescriptions, setPrescriptions] = React.useState<
    MedicineCartContextProps['prescriptions']
  >(
    localStorage.getItem('prescriptions')
      ? JSON.parse(localStorage.getItem('prescriptions') || '')
      : []
  );
  const [prescriptionUploaded, setPrescriptionUploaded] = React.useState<PrescriptionFormat | null>(
    defPresObject
  );

  const [ePrescriptionData, setEPrescriptionData] = React.useState<
    MedicineCartContextProps['ePrescriptionData']
  >(
    localStorage.getItem('ePrescriptionData')
      ? JSON.parse(localStorage.getItem('ePrescriptionData') || '')
      : []
  );
  const [uploadedEPrescription, setUploadedEPrescription] = React.useState<boolean | null>(false);
  const [cartItems, setCartItems] = useState<MedicineCartContextProps['cartItems']>(
    localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems') || '') : []
  );
  const [isCartUpdated, setIsCartUpdated] = useState<boolean>(false);

  const [itemsStr, setItemsStr] = useState<MedicineCartContextProps['itemsStr']>(
    JSON.stringify(cartItems || {})
  );
  useEffect(() => {
    if (isCartUpdated) {
      const items = JSON.stringify(cartItems);
      if (currentPatient && currentPatient.id) {
        localStorage.setItem(`${currentPatient.id}`, items);
        localStorage.removeItem('cartItems');
      } else {
        localStorage.setItem('cartItems', items);
      }
      setItemsStr(items);
      setIsCartUpdated(false);
    }
  }, [cartItems, isCartUpdated]);

  useEffect(() => {
    if (currentPatient && currentPatient.id && currentPatient.id.length > 0) {
      const storageCartItems = localStorage.getItem(`${currentPatient.id}`);
      setCartItems(storageCartItems ? JSON.parse(storageCartItems || '') : []);
    }
  }, [currentPatient]);

  useEffect(() => {
    if (prescriptionUploaded && prescriptionUploaded.name !== '') {
      if (prescriptions) {
        const finalPrescriptions = [...prescriptions, prescriptionUploaded];
        localStorage.setItem('prescriptions', JSON.stringify(finalPrescriptions));
        setPrescriptions && setPrescriptions(finalPrescriptions);
        setPrescriptionUploaded(defPresObject);
      }
    }
    if (ePrescriptionData && uploadedEPrescription) {
      localStorage.setItem('ePrescriptionData', JSON.stringify(ePrescriptionData));
      setUploadedEPrescription(false);
    }
  }, [prescriptionUploaded, ePrescriptionData, uploadedEPrescription]);

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
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = cartItems[foundIndex].quantity + itemUpdates.quantity;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateItemShippingStatus = (itemUpdates: any) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates) {
        cartItems[foundIndex].isShippable = itemUpdates.isShippable;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateCartItemQty: MedicineCartContextProps['updateCartItemQty'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates) {
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

  const cartTotal: MedicineCartContextProps['cartTotal'] = parseFloat(
    cartItems
      .reduce(
        (currTotal, currItem) =>
          currTotal + currItem.quantity * (Number(currItem.special_price) || currItem.price),
        0
      )
      .toFixed(2)
  );

  const checkCartType = () => {
    let cartTypes: string[] = [];
    if (!_isEmpty(cartItems)) {
      cartItems.map((item) => {
        cartTypes.push(item.type_id);
      });
      const finalCartTypeArr = _uniq(cartTypes);
      if (finalCartTypeArr.length > 1) return CartTypes.BOTH;
      if (finalCartTypeArr[0].toLowerCase() === 'pharma') return CartTypes.PHARMA;
      else return CartTypes.FMCG;
    }
    return CartTypes.PHARMA;
  };

  const medicineCartType = checkCartType();

  const clearCartInfo = () => {
    localStorage.setItem('prescriptions', JSON.stringify([]));
    localStorage.setItem('ePrescriptionData', JSON.stringify([]));
    setDeliveryAddressId('');
    setStoreAddressId('');
    setStores([]);
    setDeliveryAddresses([]);
    setStorePickupPincode('');
    setPrescriptions([]);
    setEPrescriptionData([]);
    setCouponCode('');
    // setCartItems([]);
  };

  const changeCartTatStatus = (status: boolean) => {
    setCartTat(status);
  };

  return (
    <MedicinesCartContext.Provider
      value={{
        medicineCartType,
        cartItems,
        setCartItems,
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
        setStoreAddressId,
        storeAddressId,
        deliveryAddresses,
        setDeliveryAddresses,
        clearCartInfo,
        addMultipleCartItems,
        prescriptions,
        setPrescriptions,
        prescriptionUploaded,
        setPrescriptionUploaded,
        ePrescriptionData,
        setEPrescriptionData,
        uploadedEPrescription,
        setUploadedEPrescription,
        updateItemShippingStatus,
        cartTat,
        changeCartTatStatus,
        setCouponCode,
        couponCode,
      }}
    >
      {props.children}
    </MedicinesCartContext.Provider>
  );
};

const useShoppingCartContext = () => useContext<MedicineCartContextProps>(MedicinesCartContext);

export const useShoppingCart = () => ({
  cartItems: useShoppingCartContext().cartItems,
  setCartItems: useShoppingCartContext().setCartItems,
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
  setStoreAddressId: useShoppingCartContext().setStoreAddressId,
  storeAddressId: useShoppingCartContext().storeAddressId,
  deliveryAddresses: useShoppingCartContext().deliveryAddresses,
  setDeliveryAddresses: useShoppingCartContext().setDeliveryAddresses,
  clearCartInfo: useShoppingCartContext().clearCartInfo,
  addMultipleCartItems: useShoppingCartContext().addMultipleCartItems,
  prescriptions: useShoppingCartContext().prescriptions,
  setPrescriptions: useShoppingCartContext().setPrescriptions,
  prescriptionUploaded: useShoppingCartContext().prescriptionUploaded,
  setPrescriptionUploaded: useShoppingCartContext().setPrescriptionUploaded,
  setEPrescriptionData: useShoppingCartContext().setEPrescriptionData,
  ePrescriptionData: useShoppingCartContext().ePrescriptionData,
  uploadedEPrescription: useShoppingCartContext().uploadedEPrescription,
  setUploadedEPrescription: useShoppingCartContext().setUploadedEPrescription,
  medicineCartType: useShoppingCartContext().medicineCartType,
  updateItemShippingStatus: useShoppingCartContext().updateItemShippingStatus,
  cartTat: useShoppingCartContext().cartTat,
  changeCartTatStatus: useShoppingCartContext().changeCartTatStatus,
  setCouponCode: useShoppingCartContext().setCouponCode,
  couponCode: useShoppingCartContext().couponCode,
});
