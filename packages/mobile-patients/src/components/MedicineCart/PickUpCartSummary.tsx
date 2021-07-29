import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { PickUpProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/PickUpProceedBar';
import { postwebEngageProceedToPayEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  UPLOAD_DOCUMENT,
  SAVE_MEDICINE_ORDER_OMS,
  CREATE_INTERNAL_ORDER,
  SAVE_PICKUP_ORDER_WITH_SUBSCRIPTION,
} from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { useGetOrderInfo } from '@aph/mobile-patients/src/components/MedicineCart/Hooks/useGetOrderInfo';
import { OrderVerticals, OrderCreate } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { getCheckoutCompletedEventAttributes } from '@aph/mobile-patients/src//helpers/helperFunctions';

export interface PickUpCartSummaryProps extends NavigationScreenProps {}

export const PickUpCartSummary: React.FC<PickUpCartSummaryProps> = (props) => {
  const {
    setShowPrescriptionAtStore,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    ePrescriptions,
    stores: storesFromContext,
    setPhysicalPrescriptions,
    pharmacyCircleAttributes,
    circleSubscriptionId,
    circlePlanSelected,
    grandTotal,
    circleMembershipCharges,
  } = useShoppingCart();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>(false);
  const shoppingCart = useShoppingCart();
  const { pharmacyUserTypeAttribute, setauthToken } = useAppCommonData();
  const { pickUpOrderInfo, SubscriptionInfo } = useGetOrderInfo();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));
  const estimatedAmount = !!circleMembershipCharges
    ? getFormattedAmount(grandTotal - circleMembershipCharges)
    : getFormattedAmount(grandTotal);

  useEffect(() => {
    onFinishUpload();
  }, [isPhysicalUploadComplete]);

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.pharmaMerchantId;
      terminateSDK();
      setTimeout(() => createHyperServiceObject(), 1400);
      setTimeout(() => (initiateSDK(cusId, cusId, merchantId), setHyperSdkInitialized(true)), 1500);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const saveOrder = () =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: pickUpOrderInfo,
    });

  const saveOrderWithSubscription = () => {
    const orderSubscriptionInput = {
      ...pickUpOrderInfo,
      ...SubscriptionInfo,
    };
    return client.mutate({
      mutation: SAVE_PICKUP_ORDER_WITH_SUBSCRIPTION,
      variables: orderSubscriptionInput,
      fetchPolicy: 'no-cache',
    });
  };

  const createOrderInternal = (orderAutoId: any, subscriptionId?: string) => {
    const pharmaOrder = [
      {
        order_id: JSON.stringify(orderAutoId),
        amount: estimatedAmount,
        patient_id: currentPatient?.id,
      },
    ];
    const orders: OrderVerticals = { pharma: pharmaOrder };
    if (subscriptionId) {
      orders['subscription'] = [
        {
          order_id: subscriptionId,
          amount: Number(circlePlanSelected?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ];
    }
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: grandTotal,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const onFinishUpload = () => {
    if (isPhysicalUploadComplete) {
      setloading!(false);
      setisPhysicalUploadComplete(false);
      onPressProceedtoPay();
    }
  };

  const multiplePhysicalPrescriptionUpload = (prescriptions = physicalPrescriptions) => {
    return Promise.all(
      prescriptions.map((item) =>
        client.mutate<uploadDocument>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            UploadDocumentInput: {
              base64FileInput: item.base64,
              category: 'HealthChecks',
              fileType: item.fileType == 'jpg' ? 'JPEG' : item.fileType.toUpperCase(),
              patientId: currentPatient && currentPatient!.id,
            },
          },
        })
      )
    );
  };

  async function uploadPhysicalPrescriptons() {
    const prescriptions = physicalPrescriptions;
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    if (unUploadedPres.length > 0) {
      try {
        setloading!(true);
        const data = await multiplePhysicalPrescriptionUpload(unUploadedPres);
        const uploadUrls = data.map((item) =>
          item.data!.uploadDocument.status
            ? {
                fileId: item.data!.uploadDocument.fileId!,
                url: item.data!.uploadDocument.filePath!,
              }
            : null
        );
        const newuploadedPrescriptions = unUploadedPres.map(
          (item, index) =>
            ({
              ...item,
              uploadedUrl: uploadUrls![index]!.url,
              prismPrescriptionFileId: uploadUrls![index]!.fileId,
            } as PhysicalPrescription)
        );
        setPhysicalPrescriptions && setPhysicalPrescriptions([...newuploadedPrescriptions]);
        setisPhysicalUploadComplete(true);
      } catch (error) {
        CommonBugFender('PickUpCartSummary_physicalPrescriptionUpload', error);
        setloading!(false);
        renderAlert('Error occurred while uploading prescriptions.');
      }
    } else {
      onPressProceedtoPay();
    }
  }

  function onPressProceedtoPay() {
    // props.navigation.navigate(AppRoutes.CheckoutSceneNew, { isStorePickup: true });
    initiateOrder();
    postwebEngageProceedToPayEvent(
      shoppingCart,
      false,
      '',
      pharmacyCircleAttributes!,
      pharmacyUserTypeAttribute!
    );
  }

  const initiateOrder = async () => {
    setloading(true);
    try {
      const response =
        !circleSubscriptionId && circlePlanSelected
          ? await saveOrderWithSubscription()
          : await saveOrder();
      const { orderId, orderAutoId, errorCode } = response?.data?.saveMedicineOrderOMS;
      const subscriptionId = response?.data?.CreateUserSubscription?.response?._id;
      const data = await createOrderInternal(orderAutoId, subscriptionId);
      const orders = [{ id: orderId, orderAutoId: orderAutoId, estimatedAmount: estimatedAmount }];
      if (data?.data?.createOrderInternal?.success) {
        setauthToken?.('');
        const paymentId = data?.data?.createOrderInternal?.payment_order_id!;
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: paymentId,
          amount: grandTotal,
          orderDetails: getOrderDetails(orders),
          businessLine: 'pharma',
          customerId: cusId,
          checkoutEventAttributes: getCheckoutCompletedEventAttributes(
            shoppingCart,
            paymentId,
            pharmacyUserTypeAttribute
          ),
        });
      }
      setloading(false);
    } catch (error) {
      setloading(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
  };

  const getOrderDetails = (orders: any) => {
    const orderDetails = {
      orders: orders,
      orderInfo: pickUpOrderInfo,
      // deliveryTime: deliveryTime,
      isStorePickup: true,
    };
    return orderDetails;
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'ORDER SUMMARY'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.PickUpCartSummary, 'Go back to Slect store');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return (
      <SelectedAddress
        orderType={'StorePickUp'}
        onPressChange={() => props.navigation.goBack()}
        showChangeAddress={true}
      />
    );
  };

  const renderCartItems = () => {
    return <CartItemsList screen={'summary'} />;
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
        type={'Cart'}
      />
    );
  };

  const renderPrescriptions = () => {
    return <Prescriptions onPressUploadMore={() => setshowPopUp(true)} />;
  };

  const renderButton = () => {
    return (
      <PickUpProceedBar
        onPressProceedtoPay={() => {
          physicalPrescriptions?.length > 0 ? uploadPhysicalPrescriptons() : onPressProceedtoPay();
        }}
        onPressUploadPrescription={() => {
          setshowPopUp(true);
          setShowPrescriptionAtStore!(false);
        }}
      />
    );
  };

  function getPaddingBottom() {
    return uploadPrescriptionRequired &&
      !(physicalPrescriptions.length > 0 || ePrescriptions.length > 0)
      ? 200
      : 100;
  }
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: getPaddingBottom() }}>
          {renderHeader()}
          {renderAddress()}
          {renderCartItems()}
          {uploadPrescriptionRequired && renderPrescriptions()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderButton()}
        {(loading || !hyperSdkInitialized) && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  prescriptionMsgCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#F7F8F5',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  buttonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    marginVertical: 9,
  },
});
