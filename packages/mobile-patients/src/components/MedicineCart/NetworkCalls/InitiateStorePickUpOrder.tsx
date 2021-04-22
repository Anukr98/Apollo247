import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import DeviceInfo from 'react-native-device-info';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import { SAVE_MEDICINE_ORDER_OMS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartOMSItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  CODCity,
  BOOKINGSOURCE,
  DEVICE_TYPE,
  ONE_APOLLO_STORE_CODE,
  PLAN_PURCHASE_DETAILS_PHARMA,
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';

export const useInitiateStorePickUpOrder = (
  tatType: any,
  storeDistance: number,
  deliveryTime: any
) => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const {
    deliveryAddressId,
    storeId,
    showPrescriptionAtStore,
    grandTotal,
    deliveryCharges,
    packagingCharges,
    cartItems,
    deliveryType,
    physicalPrescriptions,
    ePrescriptions,
    uploadPrescriptionRequired,
    couponDiscount,
    productDiscount,
    cartTotal,
    addresses,
    stores,
    coupon,
    pinCode,
    circleMembershipCharges,
    circleSubPlanId,
    cartTotalCashback,
    circleSubscriptionId,
    isCircleSubscription,
    isFreeDelivery,
    setIsCircleSubscription,
    setDefaultCirclePlan,
    setCirclePlanSelected,
    setCircleMembershipCharges,
    defaultCirclePlan,
    circlePlanSelected,
    pharmacyCircleAttributes,
    shipments,
    orders,
    setIsFreeDelivery,
  } = useShoppingCart();
  const [response, setResponse] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: orderInfo,
    });

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const estimatedAmount = !!circleMembershipCharges
    ? getFormattedAmount(grandTotal - circleMembershipCharges)
    : getFormattedAmount(grandTotal);

  const planPurchaseDetails: PLAN_PURCHASE_DETAILS_PHARMA = {
    TYPE: PLAN.CARE_PLAN,
    PlanAmount: circleMembershipCharges || 0,
    planId: Circle.CIRCLEPlan,
    subPlanId: circleSubPlanId || '',
  };

  const selectedStore = storeId && stores.find((item) => item.storeid == storeId);
  const { storename, address, workinghrs, phone, city, state, state_id } = selectedStore || {};

  const orderInfo: saveMedicineOrderOMSVariables = {
    medicineCartOMSInput: {
      tatType: tatType,
      storeDistanceKm: Number(storeDistance?.toFixed(3)) || 0,
      coupon: coupon ? coupon.coupon : '',
      couponDiscount: coupon ? getFormattedAmount(couponDiscount) : 0,
      productDiscount: getFormattedAmount(productDiscount) || 0,
      quoteId: null,
      patientId: (currentPatient && currentPatient.id) || '',
      shopId: storeId,
      shopAddress: selectedStore
        ? {
            storename,
            address,
            workinghrs,
            phone,
            city,
            state,
            zipcode: pinCode,
            stateCode: state_id,
          }
        : null,
      showPrescriptionAtStore: storeId ? showPrescriptionAtStore : false,
      patientAddressId: deliveryAddressId,
      medicineDeliveryType: deliveryType!,
      devliveryCharges: deliveryCharges,
      packagingCharges: packagingCharges,
      estimatedAmount,
      prescriptionImageUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      prismPrescriptionFileId: [
        ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
        ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      ].join(','),
      orderTat:
        deliveryAddressId &&
        moment(deliveryTime, AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT).isValid()
          ? deliveryTime
          : '',
      items: cartItems.map((item) => {
        const discountedPrice = getFormattedAmount(
          coupon && item.couponPrice == 0
            ? 0
            : (coupon && item.couponPrice) || item.specialPrice || item.price
        ); // since couponPrice & specialPrice can be undefined
        return {
          medicineSKU: item.id,
          medicineName: item.name,
          quantity: item.quantity,
          mrp: getFormattedAmount(item.price),
          price: discountedPrice,
          specialPrice: Number(item.specialPrice || item.price),
          itemValue: getFormattedAmount(item.price * item.quantity), // (multiply MRP with quantity)
          itemDiscount: getFormattedAmount(
            item.price * item.quantity - discountedPrice * item.quantity
          ), // (diff of (MRP - discountedPrice) * quantity)
          isPrescriptionNeeded: item.prescriptionRequired ? 1 : 0,
          mou: Number(item.mou),
          isMedicine: item.isMedicine ? '1' : '0',
          couponFree: item?.isFreeCouponProduct ? 1 : 0,
        } as MedicineCartOMSItem;
      }),
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
      // healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
      subscriptionDetails: circleSubscriptionId
        ? { userSubscriptionId: circleSubscriptionId }
        : null,
      planPurchaseDetails: !!circleMembershipCharges ? planPurchaseDetails : null,
      totalCashBack: !coupon?.coupon && isCircleSubscription ? Number(cartTotalCashback) || 0 : 0,
      appVersion: DeviceInfo.getVersion(),
      savedDeliveryCharge:
        !!isFreeDelivery || isCircleSubscription ? 0 : AppConfig.Configuration.DELIVERY_CHARGES,
    },
  };
  const initiateOrder = async () => {
    try {
      const response = await saveOrder(orderInfo);
      setResponse(response);
      setLoading(false);
    } catch (error) {
      setError(true);
    }
  };

  useEffect(() => {
    initiateOrder();
  }, []);

  return { response, loading, error };
};
