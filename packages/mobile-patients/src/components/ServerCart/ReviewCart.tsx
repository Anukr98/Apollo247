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
  ShipmentArray,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  getCheckoutCompletedEventAttributes,
  getCleverTapCheckoutCompletedEventAttributes,
  getShipmentAndTatInfo,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { GET_ORDER_INFO, SAVE_MEDICINE_ORDER_V3 } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  PrescriptionType,
  MEDICINE_ORDER_TYPE,
  MEDICINE_DELIVERY_TYPE,
  BOOKING_SOURCE,
  DEVICE_TYPE,
  SaveMedicineOrderV3Input,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
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
import { postwebEngageProceedToPayEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import AsyncStorage from '@react-native-community/async-storage';
import { reviewCartPageViewClevertapEvent } from '@aph/mobile-patients/src/components/ServerCart/ServerCartHelperFunctions';

export interface ReviewCartProps extends NavigationScreenProps {}

export const ReviewCart: React.FC<ReviewCartProps> = (props) => {
  const {
    deliveryTime,
    serverCartItems,
    noOfShipments,
    serverCartAmount,
    shipmentArray,
    pharmacyCircleAttributes,
    serverCartLoading,
    serverCartErrorMessage,
    setServerCartErrorMessage,
    isCircleCart,
    cartPrescriptionType,
    cartSubscriptionDetails,
    cartCoupon,
    cartLocationDetails,
    consultProfile,
    cartPrescriptions,
  } = useShoppingCart();
  const client = useApolloClient();
  const { setauthToken, pharmacyUserTypeAttribute, pharmacyUserType } = useAppCommonData();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [appState, setappState] = useState<string>('');
  const shoppingCart = useShoppingCart();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);
  const [userAgent, setUserAgent] = useState<string>('');

  const { fetchReviewCart } = useServerCart();

  useEffect(() => {
    props.navigation.addListener('didFocus', () => {
      const isPrescriptionCartItem = serverCartItems?.findIndex(
        (item) => item?.isPrescriptionRequired == '1'
      );
      const shipmentInfo = getShipmentAndTatInfo(shipmentArray);
      reviewCartPageViewClevertapEvent(
        cartLocationDetails?.pincode,
        serverCartAmount?.isDeliveryFree ? 0 : serverCartAmount?.deliveryCharges,
        serverCartAmount?.cartTotal,
        isPrescriptionCartItem >= 0,
        cartCoupon?.coupon && cartCoupon?.valid ? cartCoupon?.coupon : '',
        isCircleCart,
        isPrescriptionCartItem >= 0 ? cartPrescriptionType : '',
        pharmacyUserType,
        currentPatient?.mobileNumber,
        shipmentInfo,
        cartSubscriptionDetails?.currentSellingPrice
      );
    });
  }, []);

  useEffect(() => {
    hasUnserviceableproduct();
    fetchReviewCart();
    AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
      setUserAgent(userAgent || '');
    });
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

  useEffect(() => {
    if (serverCartErrorMessage) {
      props.navigation.goBack();
    }
  }, [serverCartErrorMessage]);

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
    const unserviceableItems = serverCartItems?.filter((item) => !item?.isShippable) || [];
    unserviceableItems?.length && props.navigation.goBack();
  }

  async function onPressProceedtoPay() {
    setloading(true);
    const shipmentInfo = getShipmentAndTatInfo(shipmentArray);
    postwebEngageProceedToPayEvent(
      shoppingCart,
      false,
      deliveryTime,
      pharmacyCircleAttributes!,
      pharmacyUserTypeAttribute!,
      shipmentInfo,
      JSON.stringify(serverCartItems),
      noOfShipments > 1
    );
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
        patientId:
          cartPrescriptionType === PrescriptionType.CONSULT && consultProfile?.id
            ? consultProfile?.id
            : currentPatient?.id,
        cartType: MEDICINE_ORDER_TYPE.CART_ORDER,
        medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
        bookingSource: BOOKING_SOURCE.MOBILE,
        deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
        appVersion: DeviceInfo.getVersion(),
        customerComment: '',
        showPrescriptionAtStore: false,
      };
      client
        .mutate({
          mutation: SAVE_MEDICINE_ORDER_V3,
          variables: { medicineOrderInput: saveMedicineOrderV3Variables },
          fetchPolicy: 'no-cache',
          context: {
            headers: {
              'User-Agent': userAgent,
            },
          },
        })
        .then((result) => {
          const orderResponse = result?.data?.saveMedicineOrderV3;
          if (orderResponse?.errorMessage) {
            throw orderResponse?.errorMessage;
          }
          if (orderResponse?.data) {
            const orderData = orderResponse?.data;
            const { transactionId, orders, isCodEligible, codMessage, paymentOrderId } = orderData;
            const newCartTotal = orders.reduce(
              (currTotal, currItem) => currTotal + currItem.estimatedAmount,
              0
            );
            if (transactionId) {
              // get order internal api is called to get exact total amount
              // which contains circle membership charges also
              client
                .query({
                  query: GET_ORDER_INFO,
                  variables: { order_id: paymentOrderId },
                  fetchPolicy: 'no-cache',
                })
                .then((response) => {
                  if (!!response?.data?.getOrderInternal?.total_amount) {
                    props.navigation.navigate(AppRoutes.PaymentMethods, {
                      paymentId: paymentOrderId,
                      amount: response?.data?.getOrderInternal?.total_amount,
                      orderDetails: getOrderDetails(
                        orders,
                        transactionId,
                        saveMedicineOrderV3Variables
                      ),
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
                })
                .catch((error) => {
                  // if get order internal api fails we will send newCartTotal as amount
                  // new cart total does not contain circle membership charges
                  props.navigation.navigate(AppRoutes.PaymentMethods, {
                    paymentId: paymentOrderId,
                    amount: Number(newCartTotal?.toFixed(2)),
                    orderDetails: getOrderDetails(
                      orders,
                      transactionId,
                      saveMedicineOrderV3Variables
                    ),
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
                });
            }
            setauthToken?.('');
          }
        })
        .catch((error) => {
          renderAlert(error);
        })
        .finally(() => {
          setloading(false);
        });
    } catch (error) {
      setloading(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
  };

  const renderAlert = (message: string, redirectToUploadPrescription?: boolean) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
      unDismissable: true,
      onPressOk: () => {
        if (redirectToUploadPrescription) {
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }
        hideAphAlert?.();
      },
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'REVIEW ORDER'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.ReviewCart, 'Go back to add items');
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
    return <ReviewShipments />;
  };

  const renderPrescriptions = () => {
    return (
      <CartPrescriptions
        showSelectedOption={true}
        isPrescriptionChangeDisabled={true}
        actionType={'selection'}
        onPressUploadMore={() => {
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }}
      />
    );
  };

  const renderButton = () => {
    return (
      <ServerCartTatBottomContainer
        screen={'summary'}
        navigation={props.navigation}
        onPressProceedtoPay={() => {
          if (cartPrescriptionType === PrescriptionType.UPLOADED && cartPrescriptions?.length < 1) {
            renderAlert(string.medicine_cart.itemsWithRx, true);
            return;
          }
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
        <ScrollView
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {renderAddress()}
          {renderAmountSection()}
          {renderTatCard()}
          {renderCartItems()}
          {renderPrescriptions()}
          {renderWhatsAppUpdates()}
        </ScrollView>
        {renderButton()}
        {(loading || serverCartLoading) && <Spinner />}
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
