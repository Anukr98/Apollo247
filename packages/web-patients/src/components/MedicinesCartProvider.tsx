/** Acknowledgement: This work is based on the POC done by Kabir Sarin :) **/

import React, { useState, createContext, useContext, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _uniq from 'lodash/uniq';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import axios from 'axios';
import { checkSkuAvailability } from 'helpers/MedicineApiCalls';

export interface MedicineCartItem {
  url_key: string;
  description: string;
  id: number;
  arrSku?: any[];
  arrId?: any[];
  image: string[] | null;
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
  MaxOrderQty: number;
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

export interface PharmaAddressDetails {
  city: string;
  pincode: string;
  state: string;
  country: string;
  lat: string;
  lng: string;
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
  addCartItems: ((item: Array<MedicineCartItem>) => void) | null;
  removeCartItemSku: ((sku: MedicineCartItem['sku']) => void) | null;
  removeCartItems: ((itemId: MedicineCartItem['arrSku']) => void) | null;
  removeFreeCartItems: (() => void) | null;
  updateCartItem:
    | ((itemUpdates: Partial<MedicineCartItem> & { id: MedicineCartItem['id'] }) => void)
    | null;
  updateCartItemPrice:
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
  medicineAddress: string;
  setMedicineAddress: ((medicineAddress: string) => void) | null;
  setPharmaAddressDetails: ((pharmaAddressDetails: PharmaAddressDetails) => void) | null;
  pharmaAddressDetails: PharmaAddressDetails;
  headerPincodeError: string | null;
  setHeaderPincodeError: ((headerPincodeError: string | null) => void) | null;
  prescriptionOptionSelected: string | null;
  setPrescriptionOptionSelected: ((prescriptionOptionSelected: string) => void) | null;
  durationDays: number | null;
  setDurationDays: (durationDays: number | null) => void | null;
  prescriptionDuration: string | null;
  setPrescriptionDuration: ((prescriptionDuration: string) => void) | null;
  updateEprescriptions: ((ePrescriptionData: EPrescription[] | null) => void) | null;
}

export const MedicinesCartContext = createContext<MedicineCartContextProps>({
  itemsStr: null,
  cartItems: [],
  setCartItems: null,
  addCartItem: null,
  addCartItems: null,
  removeCartItemSku: null,
  removeCartItems: null,
  removeFreeCartItems: null,
  updateCartItem: null,
  updateCartItemPrice: null,
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
  medicineAddress: null,
  setMedicineAddress: null,
  setPharmaAddressDetails: null,
  pharmaAddressDetails: null,
  headerPincodeError: null,
  setHeaderPincodeError: null,
  prescriptionOptionSelected: null,
  setPrescriptionOptionSelected: null,
  durationDays: null,
  setDurationDays: null,
  prescriptionDuration: null,
  setPrescriptionDuration: null,
  updateEprescriptions: null,
});

export enum CartTypes {
  PHARMA = 'PHARMA',
  FMCG = 'FMCG',
  BOTH = 'BOTH',
}

export const MedicinesCartProvider: React.FC = (props) => {
  const [couponCode, setCouponCode] = React.useState<string>(
    localStorage.getItem('pharmaCoupon') || ''
  );
  const defPresObject = {
    name: '',
    imageUrl: '',
    fileType: '',
    baseFormat: '',
  };
  const pharmaDefObject = {
    city: '',
    pincode: localStorage.getItem('pharmaPincode') || '',
    state: '',
    country: '',
    lat: '',
    lng: '',
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
  const [medicineAddress, setMedicineAddress] = useState<
    MedicineCartContextProps['medicineAddress']
  >(localStorage.getItem('pharmaAddress'));
  const [pharmaAddressDetails, setPharmaAddressDetails] = useState<PharmaAddressDetails>(
    pharmaDefObject
  );
  const [headerPincodeError, setHeaderPincodeError] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<number | null>(30);
  const [prescriptionOptionSelected, setPrescriptionOptionSelected] = useState<string | null>(null);
  const [prescriptionDuration, setPrescriptionDuration] = useState<string | null>('prescription');

  useEffect(() => {
    if (medicineAddress) {
      localStorage.setItem('pharmaAddress', medicineAddress);
    }
  }, [medicineAddress]);

  useEffect(() => {
    if (pharmaAddressDetails && pharmaAddressDetails.pincode) {
      localStorage.setItem('pharmaPincode', pharmaAddressDetails.pincode);
    }
  }, [pharmaAddressDetails]);

  useEffect(() => {
    if (isCartUpdated) {
      const items = JSON.stringify(cartItems);
      if (currentPatient && currentPatient.id) {
        localStorage.setItem(`${currentPatient.id}`, items);
        localStorage.removeItem('cartItems');
      } else {
        localStorage.setItem('cartItems', items);
      }
      if (cartItems.length === 0) {
        removePharmaCoupon();
      }
      setItemsStr(items);
      setIsCartUpdated(false);
    }
  }, [cartItems, isCartUpdated]);

  useEffect(() => {
    const existCouponCode = localStorage.getItem('pharmaCoupon');
    if (couponCode.length > 0 && couponCode !== existCouponCode) {
      localStorage.setItem('pharmaCoupon', couponCode);
    } else if (couponCode.length === 0) {
      removePharmaCoupon();
    }
  }, [couponCode]);

  const removePharmaCoupon = () => {
    const existCouponCode = localStorage.getItem('pharmaCoupon');
    existCouponCode && existCouponCode.length > 0 && localStorage.removeItem('pharmaCoupon');
    couponCode.length > 0 && setCouponCode('');
  };

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
    if (pharmaAddressDetails && pharmaAddressDetails.pincode) {
      checkSkuAvailability(itemToAdd.sku, pharmaAddressDetails.pincode)
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.response &&
            res.data.response.length > 0 &&
            res.data.response[0].exist
          ) {
            setCartItems([...cartItems, itemToAdd]);
            setIsCartUpdated(true);
          } else {
            window.location.href = clientRoutes.medicineDetails(itemToAdd.url_key);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setCartItems([...cartItems, itemToAdd]);
      setIsCartUpdated(true);
    }
  };

  const addCartItems = (itemsToAdd: Array<any>) => {
    if (itemsToAdd && Array.isArray(itemsToAdd) && itemsToAdd.length) {
      setCartItems([...cartItems].concat(itemsToAdd));
      setIsCartUpdated(true);
    }
  };

  const removeCartItemSku: MedicineCartContextProps['removeCartItemSku'] = (sku: string) => {
    setCartItems(cartItems.filter((item) => item.sku !== sku));
    setIsCartUpdated(true);
  };

  const removeCartItems: MedicineCartContextProps['removeCartItems'] = (arrSku) => {
    const items = cartItems.filter((item) => !arrSku.includes(item.sku));
    setCartItems(items);
    setIsCartUpdated(true);
  };

  const removeFreeCartItems: any = () => {
    const items = cartItems.filter((item) => item.price !== 0);
    setCartItems(items);
    setIsCartUpdated(true);
  };

  const updateCartItem: MedicineCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.sku == itemUpdates.sku);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates && itemUpdates.quantity) {
        cartItems[foundIndex].quantity = cartItems[foundIndex].quantity + itemUpdates.quantity;
      }
      setCartItems([...cartItems]);
      setIsCartUpdated(true);
    }
  };

  /* The function below should be deleted when
   updateCartItem is modified to update the cart as 
    per the passed input and its usages are corrected everywhere
  */
  const updateCartItemPrice: MedicineCartContextProps['updateCartItemPrice'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.sku == itemUpdates.sku);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates && itemUpdates.price) {
        cartItems[foundIndex].price = itemUpdates.price;
        cartItems[foundIndex].special_price = itemUpdates.special_price;
        cartItems[foundIndex].is_in_stock = itemUpdates.is_in_stock;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateItemShippingStatus = (itemUpdates: any) => {
    const foundIndex = cartItems.findIndex((item) => item.sku == itemUpdates.sku);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates) {
        cartItems[foundIndex].isShippable = itemUpdates.isShippable;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateCartItemQty: MedicineCartContextProps['updateCartItemQty'] = (itemUpdates) => {
    const foundIndex = cartItems.findIndex((item) => item.sku == itemUpdates.sku);
    if (foundIndex !== -1) {
      if (cartItems && itemUpdates) {
        cartItems[foundIndex].quantity = itemUpdates.quantity;
        setCartItems([...cartItems]);
        setIsCartUpdated(true);
      }
    }
  };

  const updateEprescriptions: MedicineCartContextProps['updateEprescriptions'] = (
    eprescriptionsToAdd
  ) => {
    const updatedEprescriptionData = _uniq([...ePrescriptionData, ...eprescriptionsToAdd]);
    setEPrescriptionData(updatedEprescriptionData);
    setUploadedEPrescription(true);
  };

  const addMultipleCartItems: MedicineCartContextProps['addMultipleCartItems'] = (itemsToAdd) => {
    const existingCartItems = cartItems;
    const newCartItems = cartItems;
    itemsToAdd.forEach((item: MedicineCartItem) => {
      const foundIdx = existingCartItems.findIndex((existingItem) => existingItem.sku === item.sku);
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
  };

  const changeCartTatStatus = (status: boolean) => {
    setCartTat(status);
  };

  return (
    <MedicinesCartContext.Provider
      value={{
        updateEprescriptions,
        medicineCartType,
        cartItems,
        setCartItems,
        itemsStr,
        addCartItem,
        addCartItems,
        removeCartItemSku,
        removeCartItems,
        removeFreeCartItems,
        updateCartItem,
        updateCartItemPrice,
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
        medicineAddress,
        setMedicineAddress,
        pharmaAddressDetails,
        setPharmaAddressDetails,
        setHeaderPincodeError,
        headerPincodeError,
        setDurationDays,
        durationDays,
        setPrescriptionOptionSelected,
        prescriptionOptionSelected,
        prescriptionDuration,
        setPrescriptionDuration,
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
  addCartItems: useShoppingCartContext().addCartItems,
  removeCartItemSku: useShoppingCartContext().removeCartItemSku,
  removeCartItems: useShoppingCartContext().removeCartItems,
  removeFreeCartItems: useShoppingCartContext().removeFreeCartItems,
  updateCartItem: useShoppingCartContext().updateCartItem,

  updateCartItemPrice: useShoppingCartContext().updateCartItemPrice,
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
  medicineAddress: useShoppingCartContext().medicineAddress,
  setMedicineAddress: useShoppingCartContext().setMedicineAddress,
  pharmaAddressDetails: useShoppingCartContext().pharmaAddressDetails,
  setPharmaAddressDetails: useShoppingCartContext().setPharmaAddressDetails,
  setHeaderPincodeError: useShoppingCartContext().setHeaderPincodeError,
  headerPincodeError: useShoppingCartContext().headerPincodeError,
  setDurationDays: useShoppingCartContext().setDurationDays,
  durationDays: useShoppingCartContext().durationDays,
  setPrescriptionOptionSelected: useShoppingCartContext().setPrescriptionOptionSelected,
  prescriptionOptionSelected: useShoppingCartContext().prescriptionOptionSelected,
  prescriptionDuration: useShoppingCartContext().prescriptionDuration,
  setPrescriptionDuration: useShoppingCartContext().setPrescriptionDuration,
  updateEprescriptions: useShoppingCartContext().updateEprescriptions,
});
