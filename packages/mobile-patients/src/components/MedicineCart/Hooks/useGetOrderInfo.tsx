import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  BOOKINGSOURCE,
  DEVICE_TYPE,
  PLAN_PURCHASE_DETAILS_PHARMA,
  PLAN,
  PaymentStatus,
  one_apollo_store_code,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import DeviceInfo from 'react-native-device-info';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import {
  saveMedicineOrderV2,
  saveMedicineOrderV2Variables,
  saveMedicineOrderV2_saveMedicineOrderV2_orders,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderV2';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export const useGetOrderInfo = () => {
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
      // healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
      shipments: shipments,
    },
  };

  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;

  const SubscriptionInfo = {
    userSubscription: {
      mobile_number: currentPatient?.mobileNumber,
      plan_id: planId,
      sub_plan_id: circlePlanSelected?.subPlanId,
      storeCode,
      FirstName: currentPatient?.firstName,
      LastName: currentPatient?.lastName,
      payment_reference: {
        amount_paid: Number(circlePlanSelected?.currentSellingPrice),
        payment_status: PaymentStatus.PENDING,
        purchase_via_HC: false,
        HC_used: 0,
      },
      transaction_date_time: new Date().toISOString(),
    },
  };

  return { OrderInfo, SubscriptionInfo };
};
