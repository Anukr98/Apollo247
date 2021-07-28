import { Platform } from 'react-native';
import {
  BOOKINGSOURCE,
  DEVICE_TYPE,
  PLAN_PURCHASE_DETAILS_PHARMA,
  PLAN,
  PaymentStatus,
  one_apollo_store_code,
  PrescriptionType,
  MedicineCartOMSItem,
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
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';

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
    couponDiscount,
    productDiscount,
    stores,
    coupon,
    pinCode,
    circleMembershipCharges,
    circleSubPlanId,
    cartTotalCashback,
    circleSubscriptionId,
    isCircleSubscription,
    isFreeDelivery,
    circlePlanSelected,
    shipments,
    prescriptionType,
    consultProfile,
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

  const appointmentIds = ePrescriptions
    ?.filter((item) => !!item?.appointmentId)
    ?.map((item) => item?.appointmentId);

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
      appointmentId: appointmentIds?.length ? appointmentIds.join(',') : '',
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

  const selectedStore = storeId && stores.find((item) => item.storeid == storeId);
  const { storename, address, workinghrs, phone, city, state, state_id } = selectedStore || {};

  const pickUpOrderInfo: saveMedicineOrderOMSVariables = {
    medicineCartOMSInput: {
      tatType: undefined,
      storeDistanceKm: 0,
      coupon: coupon ? coupon.coupon : '',
      couponDiscount: coupon ? getFormattedAmount(couponDiscount) : 0,
      productDiscount: getFormattedAmount(productDiscount) || 0,
      quoteId: null,
      patientId:
        (prescriptionType === PrescriptionType.CONSULT && consultProfile?.id) ||
        currentPatient?.id ||
        '',
      shopId: storeId || null,
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
      prescriptionType,
      prescriptionImageUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      prismPrescriptionFileId: [
        ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
        ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      ].join(','),
      orderTat: '',
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
      appointmentId: appointmentIds?.length ? appointmentIds.join(',') : '',
    },
  };

  return { OrderInfo, SubscriptionInfo, pickUpOrderInfo };
};
