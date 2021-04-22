import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useApolloClient } from 'react-apollo-hooks';
import { SAVE_MEDICINE_ORDER_OMS_V2 } from '@aph/mobile-patients/src/graphql/profiles';
import {
  saveMedicineOrderV2,
  saveMedicineOrderV2Variables,
  saveMedicineOrderV2_saveMedicineOrderV2_orders,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderV2';
import {
  BOOKINGSOURCE,
  DEVICE_TYPE,
  PLAN_PURCHASE_DETAILS_PHARMA,
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import DeviceInfo from 'react-native-device-info';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';

export const useInitiatePharmaOrder = (hcOrder: boolean) => {
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

  const saveOrder = (orderInfo: saveMedicineOrderV2Variables) =>
    client.mutate<saveMedicineOrderV2, saveMedicineOrderV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_OMS_V2,
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

  const OrderInfo: saveMedicineOrderV2Variables = {
    medicineOrderInput: {
      patientId: currentPatient?.id || '',
      medicineDeliveryType: deliveryType!,
      estimatedAmount,
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
      appVersion: DeviceInfo.getVersion(),
      coupon: coupon ? coupon.coupon : '',
      patientAddressId: deliveryAddressId,
      prescriptionImageUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      prismPrescriptionFileId: [
        ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
        ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      ].join(','),
      customerComment: '',
      subscriptionDetails: circleSubscriptionId
        ? { userSubscriptionId: circleSubscriptionId }
        : null,
      planPurchaseDetails: !!circleMembershipCharges ? planPurchaseDetails : null,
      healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
      shipments: shipments,
    },
  };

  const initiateOrder = async () => {
    try {
      const response = await saveOrder(OrderInfo);
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
