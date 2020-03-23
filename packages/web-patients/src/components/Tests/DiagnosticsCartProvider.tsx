import { getCoupons_getCoupons_coupons } from 'graphql/types/getCoupons';
import {
  DiscountType,
  MEDICINE_DELIVERY_TYPE,
  TEST_COLLECTION_TYPE,
} from 'graphql/types/globalTypes';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GetPatientAddressList_getPatientAddressList_addressList } from 'graphql/types/GetPatientAddressList';

export interface DiagnosticsCartItem {
  id: string;
  itemId: string;
  name: string;
  mou: number; // package of how many tests (eg. 10)
  price: number;
  thumbnail: string | null;
  specialPrice?: number;
  collectionMethod: TEST_COLLECTION_TYPE | null; // Home or Clinic (most probably `H` will not be an option)
}

export interface DiagnosticSlot {
  employeeSlotId: number;
  diagnosticBranchCode: string;
  diagnosticEmployeeCode: string;
  slotStartTime: string;
  slotEndTime: string;
  city: string;
  date: number; // timestamp
}

export interface DiagnosticsCartContextProps {
  forPatientId: string;
  setPatientId: ((id: string) => void) | null;

  diagnosticsCartItems: DiagnosticsCartItem[];
  setDiagnosticsCartItems: ((items: DiagnosticsCartItem[]) => void) | null;
  addCartItem: ((item: DiagnosticsCartItem) => void) | null;
  addMultipleCartItems: ((items: DiagnosticsCartItem[]) => void) | null;
  removeCartItem:
    | ((id: DiagnosticsCartItem['id'], itemId: DiagnosticsCartItem['itemId']) => void)
    | null;
  updateCartItem:
    | ((itemUpdates: Partial<DiagnosticsCartItem> & { id: DiagnosticsCartItem['id'] }) => void)
    | null;

  cartTotal: number;
  couponDiscount: number;
  //   deliveryCharges: number;
  grandTotal: number;

  // addAddress: ((address: SavePatientAddress_savePatientAddress_patientAddress) => void) | null;
  deliveryAddressId: string;
  setDeliveryAddressId: ((id: string) => void) | null;
  deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[];
  setDeliveryAddresses:
    | ((deliveryAddresses: GetPatientAddressList_getPatientAddressList_addressList[]) => void)
    | null;

  pinCode: string;
  setPinCode: ((pinCode: string) => void) | null;

  coupon: getCoupons_getCoupons_coupons | null;
  setCoupon: ((id: getCoupons_getCoupons_coupons) => void) | null;

  deliveryType: MEDICINE_DELIVERY_TYPE | null;
  clearCartInfo: (() => void) | null;

  diagnosticSlot: DiagnosticSlot | null;
  setDiagnosticSlot: ((item: DiagnosticSlot | null) => void) | null;
}

export const DiagnosticsCartContext = createContext<DiagnosticsCartContextProps>({
  forPatientId: '',
  setPatientId: null,

  diagnosticsCartItems: [],
  setDiagnosticsCartItems: null,
  addCartItem: null,
  addMultipleCartItems: null,
  removeCartItem: null,
  updateCartItem: null,
  cartTotal: 0,
  couponDiscount: 0,
  grandTotal: 0,

  coupon: null,
  setCoupon: null,

  deliveryAddressId: '',
  setDeliveryAddressId: null,
  deliveryAddresses: [],
  setDeliveryAddresses: null,
  //   deliveryCharges: 0,
  // addAddress: null,
  deliveryType: null,

  pinCode: '',
  setPinCode: null,

  clearCartInfo: null,
  setDiagnosticSlot: null,
  diagnosticSlot: null,
});

export const DiagnosticsCartProvider: React.FC = (props) => {
  // const { currentPatient } = useAllCurrentPatients();
  const id = ''; //(currentPatient && currentPatient.id) || '';

  const [forPatientId, setPatientId] = useState<string>('');

  const [diagnosticsCartItems, setDiagnosticsCartItems] = useState<
    DiagnosticsCartContextProps['diagnosticsCartItems']
  >(
    localStorage.getItem('diagnosticsCartItems')
      ? JSON.parse(localStorage.getItem('diagnosticsCartItems') || '')
      : []
  );
  const [couponDiscount, setCouponDiscount] = useState<
    DiagnosticsCartContextProps['couponDiscount']
  >(0);

  const [coupon, setCoupon] = useState<DiagnosticsCartContextProps['coupon']>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<
    GetPatientAddressList_getPatientAddressList_addressList[]
  >([]);
  const [pinCode, setPinCode] = useState<string>('');

  const [deliveryAddressId, _setDeliveryAddressId] = useState<
    DiagnosticsCartContextProps['deliveryAddressId']
  >('');

  const [deliveryType, setDeliveryType] = useState<DiagnosticsCartContextProps['deliveryType']>(
    null
  );
  const [isCartUpdated, setIsCartUpdated] = useState<boolean>(false);

  const addCartItem: DiagnosticsCartContextProps['addCartItem'] = (itemToAdd) => {
    if (diagnosticsCartItems.find((item) => item.id === itemToAdd.id)) {
      return;
    }
    const newCartItems = [itemToAdd, ...diagnosticsCartItems];
    setDiagnosticsCartItems(newCartItems);
    setIsCartUpdated(true);
  };

  const addMultipleCartItems: DiagnosticsCartContextProps['addMultipleCartItems'] = (
    itemsToAdd
  ) => {
    // If tried to add same items(by id) which already exists in the cart, it will update with new values.
    const existingFilteredCartItems = diagnosticsCartItems.filter(
      (item) => !itemsToAdd.find((val) => val.id == item.id)
    );
    const newCartItems = [
      ...existingFilteredCartItems,
      ...itemsToAdd.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i),
    ];
    setDiagnosticsCartItems(newCartItems);
  };

  const removeCartItem: DiagnosticsCartContextProps['removeCartItem'] = (id, itemId) => {
    const newCartItems = diagnosticsCartItems.filter(
      (item) => item.id !== id && item.itemId !== itemId
    );
    setDiagnosticsCartItems(newCartItems);
  };
  const updateCartItem: DiagnosticsCartContextProps['updateCartItem'] = (itemUpdates) => {
    const foundIndex = diagnosticsCartItems.findIndex((item) => item.id == itemUpdates.id);
    if (foundIndex !== -1) {
      diagnosticsCartItems[foundIndex] = { ...diagnosticsCartItems[foundIndex], ...itemUpdates };
      setDiagnosticsCartItems([...diagnosticsCartItems]);
    }
  };

  const cartTotal: DiagnosticsCartContextProps['cartTotal'] = parseFloat(
    diagnosticsCartItems
      .reduce((currTotal, currItem) => currTotal + (currItem.specialPrice || currItem.price), 0)
      .toFixed(2)
  );

  //   const deliveryCharges =
  //     deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
  //       ? 0
  //       : cartTotal > 0 && cartTotal < AppConfig.Configuration.MIN_CART_VALUE_FOR_FREE_DELIVERY
  //       ? AppConfig.Configuration.DIASGNOS_DELIVERY_CHARGES
  //       : 0;

  const grandTotal = parseFloat((cartTotal + 0 - couponDiscount).toFixed(2));

  const setDeliveryAddressId = (id: DiagnosticsCartContextProps['deliveryAddressId']) => {
    setDeliveryType(MEDICINE_DELIVERY_TYPE.HOME_DELIVERY);
    _setDeliveryAddressId(id);
  };

  const clearCartInfo = () => {
    setDiagnosticsCartItems([]);
    setDeliveryAddressId('');
    setPinCode('');
    setCoupon(null);
    // setClinics([]);
  };

  const [diagnosticSlot, setDiagnosticSlot] = useState<
    DiagnosticsCartContextProps['diagnosticSlot']
  >(null);

  useEffect(() => {
    if (isCartUpdated) {
      const items = JSON.stringify(diagnosticsCartItems);
      localStorage.setItem('diagnosticsCartItems', items);
      setIsCartUpdated(false);
    }
  }, [diagnosticsCartItems, isCartUpdated]);

  useEffect(() => {
    // updating coupon discount here on update in cart or new coupon code applied
    const minimumOrderAmount = coupon && coupon.minimumOrderAmount;
    if (!coupon || (minimumOrderAmount && cartTotal < minimumOrderAmount)) {
      setCoupon(null);
      setCouponDiscount(0);
    } else {
      let discountAmount = 0;
      if (coupon.discountType == DiscountType.PERCENT) {
        discountAmount = parseFloat(((coupon.discount / 100) * cartTotal).toFixed(2));
      } else {
        discountAmount = parseFloat((cartTotal - coupon.discount).toFixed(2));
      }
      setCouponDiscount(discountAmount);
    }
  }, [cartTotal, coupon]);

  return (
    <DiagnosticsCartContext.Provider
      value={{
        forPatientId,
        setPatientId,

        diagnosticsCartItems,
        setDiagnosticsCartItems,
        addCartItem,
        addMultipleCartItems,
        removeCartItem,
        updateCartItem,
        cartTotal,
        grandTotal,
        couponDiscount,
        deliveryAddresses,
        setDeliveryAddresses,
        // addAddress,
        deliveryAddressId,
        setDeliveryAddressId,
        deliveryType,
        coupon,
        setCoupon,
        pinCode,
        setPinCode,
        clearCartInfo,
        diagnosticSlot,
        setDiagnosticSlot,
      }}
    >
      {props.children}
    </DiagnosticsCartContext.Provider>
  );
};

const useDiagnosticsContext = () => useContext<DiagnosticsCartContextProps>(DiagnosticsCartContext);

export const useDiagnosticsCart = () => ({
  diagnosticsCartItems: useDiagnosticsContext().diagnosticsCartItems,
  setDiagnosticsCartItems: useDiagnosticsContext().setDiagnosticsCartItems,
  addCartItem: useDiagnosticsContext().addCartItem,
  removeCartItem: useDiagnosticsContext().removeCartItem,
  addMultipleCartItems: useDiagnosticsContext().addMultipleCartItems,
  updateCartItem: useDiagnosticsContext().updateCartItem,
  cartTotal: useDiagnosticsContext().cartTotal,
  grandTotal: useDiagnosticsContext().grandTotal,
  setDeliveryAddresses: useDiagnosticsContext().setDeliveryAddresses,
  deliveryAddresses: useDiagnosticsContext().deliveryAddresses,
  deliveryAddressId: useDiagnosticsContext().deliveryAddressId,
  setDeliveryAddressId: useDiagnosticsContext().setDeliveryAddressId,
  diagnosticSlot: useDiagnosticsContext().diagnosticSlot,
  setDiagnosticSlot: useDiagnosticsContext().setDiagnosticSlot,
});
