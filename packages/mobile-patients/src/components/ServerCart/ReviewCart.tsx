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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { SAVE_MEDICINE_ORDER_V3 } from '@aph/mobile-patients/src/graphql/profiles';
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

export interface ReviewCartProps extends NavigationScreenProps {}

export const ReviewCart: React.FC<ReviewCartProps> = (props) => {
  const {
    uploadPrescriptionRequired,
    prescriptionType,
    deliveryTime,

    serverCartItems,
    noOfShipments,
    serverCartAmount,
    shipmentArray,
    pharmacyCircleAttributes,
    serverCartLoading,
    serverCartErrorMessage,
    setServerCartErrorMessage,
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
  const [userAgent, setUserAgent] = useState<string>('');

  const { fetchReviewCart } = useServerCart();

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
      hideAphAlert?.();
      showAphAlert!({
        unDismissable: true,
        title: 'Hey',
        description: serverCartErrorMessage,
        titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'OKAY',
            type: 'orange-link',
            onPress: () => {
              setServerCartErrorMessage?.('');
              hideAphAlert?.();
            },
          },
        ],
      });
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
    let splitOrderDetails: any = {};
    if (noOfShipments > 1) {
      shipmentArray?.forEach((order: ShipmentArray, index: number) => {
        splitOrderDetails['Shipment_' + (index + 1) + '_Value'] = order.estimatedAmount;
        splitOrderDetails['Shipment_' + (index + 1) + '_Items'] = order?.items?.length;
      });
    }
    postwebEngageProceedToPayEvent(
      shoppingCart,
      false,
      deliveryTime,
      pharmacyCircleAttributes!,
      pharmacyUserTypeAttribute!,
      JSON.stringify(serverCartItems),
      noOfShipments > 1,
      splitOrderDetails
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
        patientId: currentPatient?.id,
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
          {/* {uploadPrescriptionRequired &&
            prescriptionType !== PrescriptionType.UPLOADED &&
            renderPrescriptions()} */}
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
