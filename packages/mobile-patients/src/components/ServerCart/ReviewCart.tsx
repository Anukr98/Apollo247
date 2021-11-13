import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  Text,
  Platform,
} from 'react-native';
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
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import {
  g,
  formatAddress,
  getShipmentPrice,
  getCheckoutCompletedEventAttributes,
  getCleverTapCheckoutCompletedEventAttributes,
  isCartPriceWithInSpecifiedRange,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { GetTatResponse247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  uploadPrescriptionClickedEvent,
  postTatResponseFailureEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  UPLOAD_DOCUMENT,
  SAVE_MEDICINE_ORDER_OMS_V2,
  CREATE_INTERNAL_ORDER,
  SAVE_ORDER_WITH_SUBSCRIPTION,
  SAVE_MEDICINE_ORDER_V3,
} from '@aph/mobile-patients/src/graphql/profiles';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { postPhamracyCartAddressSelectedSuccess } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import {
  MedicineOrderShipmentInput,
  PrescriptionType,
  OrderVerticals,
  OrderCreate,
  one_apollo_store_code,
  PaymentStatus,
  MEDICINE_ORDER_TYPE,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  SaveMedicineOrderV3Input,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  isSDKInitialised,
  terminateSDK,
  createHyperServiceObject,
  initiateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { WhatsAppStatus } from '@aph/mobile-patients/src/components/ui/WhatsAppStatus';
import { CartTotalSection } from '@aph/mobile-patients/src/components/ServerCart/Components/CartTotalSection';
import { ReviewTatCard } from '@aph/mobile-patients/src/components/ServerCart/Components/ReviewTatCard';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { ReviewShipments } from '@aph/mobile-patients/src/components/ServerCart/Components/ReviewShipments';
import { ServerCartTatBottomContainer } from '@aph/mobile-patients/src/components/ServerCart/Components/ServerCartTatBottomContainer';
import DeviceInfo from 'react-native-device-info';
import { CartPrescriptions } from '@aph/mobile-patients/src/components/ServerCart/Components/CartPrescriptions';

export interface ReviewCartProps extends NavigationScreenProps {}

export const ReviewCart: React.FC<ReviewCartProps> = (props) => {
  const {
    addresses,
    deliveryAddressId,
    uploadPrescriptionRequired,
    prescriptionType,
    deliveryTime,
    pinCode,

    serverCartItems,
    noOfShipments,
    serverCartAmount,
  } = useShoppingCart();
  const client = useApolloClient();
  const { setauthToken, pharmacyUserTypeAttribute } = useAppCommonData();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [appState, setappState] = useState<string>('');
  const shoppingCart = useShoppingCart();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);

  const { fetchReviewCart } = useServerCart();

  useEffect(() => {
    hasUnserviceableproduct();
    fetchReviewCart();
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setappState(nextAppState);
  };

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.pharmaMerchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  function hasUnserviceableproduct() {
    const unserviceableItems = serverCartItems.filter((item) => !item?.isShippable) || [];
    unserviceableItems?.length && props.navigation.goBack();
  }

  async function onPressProceedtoPay() {
    setloading(true);
    // let splitOrderDetails: any = {};
    // if (orders?.length > 1) {
    //   orders?.forEach((order: any, index: number) => {
    //     splitOrderDetails['Shipment_' + (index + 1) + '_Value'] =
    //       getShipmentPrice(order?.items, cartItems) +
    //       (order?.deliveryCharge || 0) +
    //       (order?.packingCharges || 0);
    //     splitOrderDetails['Shipment_' + (index + 1) + '_Items'] = order?.items?.length;
    //   });
    // }
    // postwebEngageProceedToPayEvent(
    //   shoppingCart,
    //   false,
    //   deliveryTime,
    //   pharmacyCircleAttributes!,
    //   pharmacyUserTypeAttribute!,
    //   JSON.stringify(cartItems),
    //   orders?.length > 1,
    //   splitOrderDetails
    // );
    initiateOrder();
  }

  const getOrderDetails = (
    orders: any,
    transactionId: string,
    saveMedicineOrderV3Variables: SaveMedicineOrderV3Input
  ) => {
    const orderDetails = {
      displayId: transactionId,
      orders: orders,
      orderInfo: saveMedicineOrderV3Variables,
      deliveryTime: deliveryTime,
      isStorePickup: false,
    };
    return orderDetails;
  };

  const initiateOrder = async () => {
    try {
      const saveMedicineOrderV3Variables: SaveMedicineOrderV3Input = {
        patientId: currentPatient?.id,
        cartType: MEDICINE_ORDER_TYPE.CART_ORDER,
        medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
        bookingSource: BOOKING_SOURCE.MOBILE,
        deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
        appVersion: DeviceInfo.getVersion(),
        customerComment: '',
        showPrescriptionAtStore: false,
      };
      console.log(
        'calling saveMedicineOrderV3 ======= ',
        JSON.stringify(saveMedicineOrderV3Variables)
      );
      client
        .mutate({
          mutation: SAVE_MEDICINE_ORDER_V3,
          variables: { medicineOrderInput: saveMedicineOrderV3Variables },
          fetchPolicy: 'no-cache',
        })
        .then((result) => {
          console.log('V3 ==== ', JSON.stringify(result));
          const orderResponse = result?.data?.saveMedicineOrderV3;
          if (orderResponse?.errorMessage) {
            throw orderResponse?.errorMessage;
          }
          if (orderResponse?.data) {
            const orderData = orderResponse?.data;
            console.log('orderResponse?.data >>>>>>>>> ', JSON.stringify(orderData));
            const {
              transactionId,
              orders,
              isSubstitution,
              substitutionTime,
              substitutionMessage,
              isCodEligible,
              codMessage,
              paymentOrderId,
            } = orderData;
            if (transactionId) {
              props.navigation.navigate(AppRoutes.PaymentMethods, {
                paymentId: paymentOrderId,
                amount: serverCartAmount?.estimatedAmount,
                orderDetails: getOrderDetails(orders, transactionId, saveMedicineOrderV3Variables),
                businessLine: 'pharma',
                customerId: cusId,
                checkoutEventAttributes: getCheckoutCompletedEventAttributes(
                  shoppingCart,
                  paymentOrderId,
                  pharmacyUserTypeAttribute
                ),
                cleverTapCheckoutEventAttributes: getCleverTapCheckoutCompletedEventAttributes(
                  shoppingCart,
                  paymentOrderId,
                  pharmacyUserTypeAttribute,
                  orders
                ),
                disableCOD: !isCodEligible,
                paymentCodMessage: codMessage,
              });
            }
          }
        })
        .catch((error) => {
          console.log('V# ERROR ===== ', error);
          // return error;
        })
        .finally(() => {
          setloading(false);
          console.log('V# HERE!!! ===== ');
        });
      // const response = await saveMedicineOrderV3(saveMedicineOrderV3Variables);
      // console.log('saveMedicineOrderV3 response ======= ', JSON.stringify(response));
      // const { paymentOrderId, orders, transactionId, isCodEligible, codMessage } = response || {};

      // if (paymentOrderId) {
      //   props.navigation.navigate(AppRoutes.PaymentMethods, {
      //     paymentId: paymentOrderId,
      //     amount: serverCartAmount?.estimatedAmount,
      //     orderDetails: getOrderDetails(orders, transactionId, saveMedicineOrderV3Variables),
      //     businessLine: 'pharma',
      //     customerId: cusId,
      //     checkoutEventAttributes: getCheckoutCompletedEventAttributes(
      //       shoppingCart,
      //       paymentOrderId,
      //       pharmacyUserTypeAttribute
      //     ),
      //     cleverTapCheckoutEventAttributes: getCleverTapCheckoutCompletedEventAttributes(
      //       shoppingCart,
      //       paymentOrderId,
      //       pharmacyUserTypeAttribute,
      //       orders
      //     ),
      //     disableCOD: !isCodEligible,
      //     paymentCodMessage: codMessage,
      //   });
      // }
      // const { orders, transactionId, errorCode, isCodEligible, errorMessage, codMessage } =
      //   response?.data?.saveMedicineOrderV2 || {};
      // if (errorCode == 400 && errorMessage) {
      //   setloading(false);
      //   renderAlert(errorMessage);
      //   return;
      // }
      // const subscriptionId = response?.data?.CreateUserSubscription?.response?._id;
      // const data = {}; // await createOrderInternal(orders, subscriptionId);
      // if (data?.data?.createOrderInternal?.success) {
      //   const paymentId = data?.data?.createOrderInternal?.payment_order_id!;
      //   props.navigation.navigate(AppRoutes.PaymentMethods, {
      //     paymentId: paymentId,
      //     amount: grandTotal,
      //     orderDetails: getOrderDetails(orders, transactionId),
      //     businessLine: 'pharma',
      //     customerId: cusId,
      //     checkoutEventAttributes: getCheckoutCompletedEventAttributes(
      //       shoppingCart,
      //       paymentId,
      //       pharmacyUserTypeAttribute
      //     ),
      //     cleverTapCheckoutEventAttributes: getCleverTapCheckoutCompletedEventAttributes(
      //       shoppingCart,
      //       paymentId,
      //       pharmacyUserTypeAttribute,
      //       orders
      //     ),
      //     disableCOD: !isCodEligible,
      //     paymentCodMessage: codMessage,
      //   });
      // }
      // setloading(false);
      setauthToken?.('');
    } catch (error) {
      setloading(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
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
        title={'REVIEW ORDER'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.ServerCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return <SelectedAddress orderType={'Delivery'} showChangeAddress={false} />;
  };

  const renderAmountSection = () => {
    return (
      <View>
        <View style={styles.amountHeader}>
          <Text style={styles.amountHeaderText}>ORDER SUMMARY</Text>
        </View>
        <CartTotalSection />
      </View>
    );
  };

  const renderTatCard = () => {
    return noOfShipments > 1 ? null : (
      <ReviewTatCard style={{ marginTop: 10 }} deliveryDate={serverCartItems?.[0]?.tat} />
    );
  };

  const renderCartItems = () => {
    return <ReviewShipments setloading={setloading} />;
  };

  const renderPrescriptions = () => {
    return (
      <CartPrescriptions
        onPressUploadMore={() => {
          shoppingCart.setPrescriptionType(null);
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }}
        showSelectedOption
        isPrescriptionChangeDisabled={true}
        actionType={'selection'}
      />
    );
  };

  const renderButton = () => {
    return (
      <ServerCartTatBottomContainer
        screen={'summary'}
        navigation={props.navigation}
        onPressProceedtoPay={() => {
          onPressProceedtoPay();
        }}
      />
    );
  };

  const renderWhatsAppUpdates = () => {
    return (
      <View>
        <WhatsAppStatus
          onPress={() => {
            whatsAppUpdate ? setWhatsAppUpdate(false) : setWhatsAppUpdate(true);
          }}
          isSelected={whatsAppUpdate}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderAddress()}
          {renderAmountSection()}
          {uploadPrescriptionRequired &&
            prescriptionType !== PrescriptionType.UPLOADED &&
            renderPrescriptions()}
          {renderTatCard()}
          {renderCartItems()}
          {uploadPrescriptionRequired &&
            prescriptionType === PrescriptionType.UPLOADED &&
            renderPrescriptions()}
          {renderWhatsAppUpdates()}
        </ScrollView>
        {renderButton()}
        {loading && <Spinner />}
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
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
