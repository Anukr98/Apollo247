import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Check,
  CheckUnselectedIcon,
  MedicineIcon,
  OneApollo,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_MEDICINE_ORDER,
  SAVE_MEDICINE_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SaveMedicineOrder,
  SaveMedicineOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrder';
import {
  aphConsole,
  g,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Slider } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import moment from 'moment';
import { WebEngageEvents } from '@aph/mobile-patients/src/helpers/webEngageEvents';

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
  },
  cardTitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 15,
    marginTop: 8,
  },
  verticalSeparator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    height: '100%',
    width: 1,
    marginRight: 15,
    marginLeft: 16,
  },
  paymentModeRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentModeTextStyle: {
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    marginLeft: 16,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  balanceAmountPayTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  balanceAmountViewStyle: {
    backgroundColor: '#f7f8f5',
    borderRadius: 5,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCreditsRowStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableHealthCreditsView: {
    flex: 1,
    height: '100%',
  },
  healthCreditsTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  healthCreditsAmountTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
  },
  sliderStyle: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  sliderThumbStyle: {
    height: 20,
    width: 20,
    shadowColor: 'rgba(0, 179, 142, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
  },
  sliderValuesViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
  },
});

export interface CheckoutSceneProps extends NavigationScreenProps {}

export const CheckoutScene: React.FC<CheckoutSceneProps> = (props) => {
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const [isOneApolloPayment, setOneApolloPayment] = useState(false);
  const [oneApolloCredits, setOneApolloCredits] = useState(0);
  const [isCashOnDelivery, setCashOnDelivery] = useState(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  // const [orderInfo, setOrderInfo] = useState({
  //   pickupStoreName: '',
  //   pickupStoreAddress: '',
  //   orderId: '',
  //   orderAutoId: 0,
  // });
  // const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    deliveryAddressId,
    storeId,
    grandTotal,
    deliveryCharges,
    cartItems,
    deliveryType,
    clearCartInfo,
    physicalPrescriptions,
    ePrescriptions,
    uploadPrescriptionRequired,
    couponDiscount,
    cartTotal,
    addresses,
    stores,
  } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();

  const MAX_SLIDER_VALUE = grandTotal;
  const client = useApolloClient();

  const postwebEngageCheckoutCompletedEvent = (orderAutoId: string) => {
    const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
    const store = storeId && stores.find((item) => item.storeid == storeId);
    const shippingInformation = addr
      ? [addr.addressLine1, addr.addressLine2].filter((val) => val).join(', ')
      : store
      ? store.address
      : '';
    const eventAttributes: WebEngageEvents['Checkout completed'] = {
      'Order ID': orderAutoId,
      'Order Type': 'Cart',
      'Prescription Required': uploadPrescriptionRequired,
      'Prescription Added': true,
      'Shipping information': shippingInformation, // (Home/Store address)
      'Total items in cart': cartItems.length,
      'Grand Total': cartTotal + deliveryCharges,
      'Total Discount %': cartTotal,
      'Discount Amount': couponDiscount,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Payment status': 0,
    };
    postWebEngageEvent('Checkout completed', eventAttributes);
  };

  const saveOrder = (orderInfo: SaveMedicineOrderVariables) =>
    client.mutate<SaveMedicineOrder, SaveMedicineOrderVariables>({
      mutation: SAVE_MEDICINE_ORDER,
      variables: orderInfo,
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentMqVariables) =>
    client.mutate<SaveMedicineOrderPaymentMq, SaveMedicineOrderPaymentMqVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  const placeOrder = (orderId: string, orderAutoId: number) => {
    console.log('placeOrder\t', { orderId, orderAutoId });
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: grandTotal,
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };
    console.log(JSON.stringify(paymentInfo));

    savePayment(paymentInfo)
      .then(({ data }) => {
        const { errorCode, errorMessage } = g(data, 'SaveMedicineOrderPaymentMq') || {};
        console.log({ data });
        console.log({ errorCode, errorMessage });
        setShowSpinner(false);
        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: `Your order failed due to some temporary issue :( Please submit the order again.`,
            // description: `Order failed, ${errorMessage}.`,
          });
        } else {
          // Order-Success, Show popup here & clear cart info
          postwebEngageCheckoutCompletedEvent(`${orderAutoId}`);

          clearCartInfo && clearCartInfo();
          // setOrderInfo({
          //   orderId: orderId!,
          //   orderAutoId: orderAutoId!,
          //   pickupStoreAddress: '',
          //   pickupStoreName: '',
          // });
          handleOrderSuccess(`${orderAutoId}`);
        }
      })
      .catch((e) => {
        CommonBugFender('CheckoutScene_savePayment', e);
        setShowSpinner(false);
        aphConsole.log({ e });
        showAphAlert!({
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `Your order failed due to some temporary issue :( Please submit the order again.`,
        });
      });
  };

  const redirectToPaymentGateway = async (orderId: string, orderAutoId: number) => {
    const token = await firebase.auth().currentUser!.getIdToken();
    console.log({ token });
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orderId,
      orderAutoId,
      token,
      amount: grandTotal,
      deliveryTime,
    });
  };

  const initiateOrder = async () => {
    setShowSpinner(true);
    console.log(
      'ePrescriptions',
      ePrescriptions,
      [...ePrescriptions.map((item) => item.prismPrescriptionFileId)].join(',')
    );

    const orderInfo: SaveMedicineOrderVariables = {
      MedicineCartInput: {
        quoteId: null,
        patientId: (currentPatient && currentPatient.id) || '',
        shopId: storeId || null,
        patientAddressId: deliveryAddressId!,
        medicineDeliveryType: deliveryType!,
        devliveryCharges: deliveryCharges,
        estimatedAmount: grandTotal,
        prescriptionImageUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        prismPrescriptionFileId: [
          ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
          ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
        ].join(','),
        orderTat: deliveryAddressId && moment(deliveryTime).isValid ? deliveryTime : '',
        items: cartItems.map(
          (item) =>
            ({
              medicineSKU: item.id,
              price: item.price,
              medicineName: item.name,
              quantity: item.quantity,
              mrp: item.price,
              // isPrescriptionNeeded: item.prescriptionRequired,
              prescriptionImageUrl: null,
              mou: parseInt(item.mou),
              isMedicine: null,
            } as MedicineCartItem)
        ),
      },
    };

    console.log(JSON.stringify(orderInfo));

    const eventAttributes: WebEngageEvents['Payment Initiated'] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
    };
    postWebEngageEvent('Payment Initiated', eventAttributes);

    saveOrder(orderInfo)
      .then(({ data }) => {
        const { orderId, orderAutoId, errorCode, errorMessage } =
          g(data, 'SaveMedicineOrder')! || {};
        console.log({ orderAutoId, orderId, errorCode, errorMessage });

        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Uh oh.. :(`,
            description: `Order failed, ${errorMessage}.`,
          });
          return;
        }

        if (isCashOnDelivery) {
          console.log('isCashOnDelivery\t', { orderId, orderAutoId });

          placeOrder(orderId, orderAutoId);
        } else {
          console.log('Redirect To Payment Gateway');
          redirectToPaymentGateway(orderId, orderAutoId)
            .catch((e) => {
              CommonBugFender('CheckoutScene_redirectToPaymentGateway', e);
            })
            .finally(() => {
              setShowSpinner(false);
            });
        }
      })
      .catch((error) => {
        CommonBugFender('CheckoutScene_saveOrder', error);
        setShowSpinner(false);
        handleGraphQlError(error);
      });
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderAutoId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.OrderDetailsScene, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderAutoId: orderAutoId,
    });
  };

  const handleOrderSuccess = (orderAutoId: string) => {
    console.log('handleOrderSuccess\n', { orderAutoId });
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    showAphAlert!({
      // unDismissable: true,
      title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
      description:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      children: (
        <View
          style={{
            margin: 20,
            marginTop: 16,
            padding: 16,
            backgroundColor: '#f7f8f5',
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <MedicineIcon />
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(17),
                lineHeight: 24,
                color: '#01475b',
              }}
            >
              Medicines
            </Text>
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(14),
                lineHeight: 24,
                color: '#01475b',
                textAlign: 'right',
              }}
            >
              {`#${orderAutoId}`}
            </Text>
          </View>
          {moment(deliveryTime).isValid() && (
            <>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#02475b',
                  opacity: 0.1,
                  marginBottom: 7.5,
                  marginTop: 15.5,
                }}
              />
              <View>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                  }}
                >
                  {deliveryTime &&
                    `Delivery By: ${moment(deliveryTime).format('D MMM YYYY  | hh:mm A')}`}
                </Text>
              </View>
            </>
          )}
          {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 7.5
              }}
            >
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 24,
                  color: '#01475b',
                }}
              >
                Remind me to take medicines
              </Text>
              <TouchableOpacity style={{}} onPress={() => setIsRemindMeChecked(!isRemindMeChecked)}>
                {isRemindMeChecked ? <CheckedIcon /> : <UnCheck />}
              </TouchableOpacity>
            </View> */}
          <View
            style={{
              height: 1,
              backgroundColor: '#02475b',
              opacity: 0.1,
              marginBottom: 15.5,
              marginTop: 7.5,
            }}
          />
          <View style={styles.popupButtonStyle}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigateToOrderDetails(true, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'flex-end' }}
              onPress={() => navigateToOrderDetails(false, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'CHECKOUT'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.CheckoutScene, 'Go back clicked');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderHeadingAndCard = (
    title: string,
    view: Element,
    cardStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <View style={{ margin: 20 }}>
        <Text style={styles.cardTitleStyle}>{title}</Text>
        <View style={styles.separator} />
        <View style={[styles.cardStyle, cardStyle]}>{view}</View>
      </View>
    );
  };

  const renderOneApollo = (
    <View style={styles.healthCreditsRowStyle}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ marginRight: 16 }}
        onPress={() => setOneApolloPayment(!isOneApolloPayment)}
      >
        {isOneApolloPayment ? <Check /> : <CheckUnselectedIcon />}
      </TouchableOpacity>
      <OneApollo />
    </View>
  );

  const renderAvailableHealthCredits = (
    <View style={[styles.healthCreditsRowStyle, styles.availableHealthCreditsView]}>
      <View style={styles.verticalSeparator} />
      <View style={{ flex: 1 }}>
        <Text style={styles.healthCreditsTextStyle}>{'Available Health Credits'}</Text>
        <Text style={styles.healthCreditsAmountTextStyle}>{'2000'}</Text>
      </View>
    </View>
  );

  const renderOneApolloAndHealthCreditsCard = () => {
    const oneApolloCheckBoxAndCredits = (
      <View style={[styles.healthCreditsRowStyle, { paddingHorizontal: 16 }]}>
        {renderOneApollo}
        {renderAvailableHealthCredits}
      </View>
    );

    const balanceAmountToPay = (
      <View style={[styles.balanceAmountViewStyle, { marginHorizontal: 16 }]}>
        <Text style={styles.balanceAmountPayTextStyle}>{'Balance amount to pay'}</Text>
        <Text style={[styles.balanceAmountPayTextStyle, theme.fonts.IBMPlexSansSemiBold(14)]}>
          {`Rs. ${
            MAX_SLIDER_VALUE - oneApolloCredits > -1 ? MAX_SLIDER_VALUE - oneApolloCredits : 0
          }`}
        </Text>
      </View>
    );

    const slider = (
      <Slider
        value={oneApolloCredits}
        thumbStyle={styles.sliderThumbStyle}
        maximumValue={MAX_SLIDER_VALUE}
        step={1}
        onValueChange={(val) => setOneApolloCredits(val)}
        thumbTintColor={'#00b38e'}
        minimumTrackTintColor={'rgba(0, 135, 186, 1)'}
        maximumTrackTintColor={'rgba(0, 135, 186, 0.1)'}
      />
    );

    const sliderValues = (
      <View style={styles.sliderValuesViewStyle}>
        <Text style={[styles.sliderValueStyle, oneApolloCredits == 0 ? { opacity: 1 } : {}]}>
          {'0'}
        </Text>
        {!!(oneApolloCredits > 0 && oneApolloCredits < MAX_SLIDER_VALUE) && (
          <Text style={[styles.sliderValueStyle, { opacity: 1 }]}>
            {oneApolloCredits ? oneApolloCredits : null}
          </Text>
        )}
        <Text
          style={[
            styles.sliderValueStyle,
            oneApolloCredits == MAX_SLIDER_VALUE ? { opacity: 1 } : {},
          ]}
        >
          {MAX_SLIDER_VALUE}
        </Text>
      </View>
    );

    const healthCreditsSliderAndValues = (
      <View style={styles.sliderStyle}>
        {slider}
        {sliderValues}
      </View>
    );

    const content = (
      <View>
        {oneApolloCheckBoxAndCredits}
        {isOneApolloPayment ? (
          <>
            {healthCreditsSliderAndValues}
            <View style={[styles.separator, { marginTop: 3.5 }]} />
            {balanceAmountToPay}
          </>
        ) : null}
      </View>
    );

    return renderHeadingAndCard(
      'Would you like to use Apollo Health Credits for this payment?',
      content,
      { paddingHorizontal: 0 }
    );
  };

  const renderPaymentModesCard = () => {
    const payUsingPaytmOption = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          CommonLogEvent(AppRoutes.CheckoutScene, 'Pay online');
          setCashOnDelivery(false);
        }}
      >
        <View style={[styles.paymentModeRowStyle, { marginBottom: 16 }]}>
          {isCashOnDelivery ? <RadioButtonUnselectedIcon /> : <RadioButtonIcon />}
          <Text style={styles.paymentModeTextStyle}>
            Pay Online Using Debit/Credit Card/Net Banking
          </Text>
        </View>
      </TouchableOpacity>
    );

    const cashOnDeliveryOption = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          CommonLogEvent(AppRoutes.CheckoutScene, 'Cash on delivery');
          setCashOnDelivery(true);
        }}
      >
        <View style={[styles.paymentModeRowStyle]}>
          {!isCashOnDelivery ? <RadioButtonUnselectedIcon /> : <RadioButtonIcon />}
          <Text style={styles.paymentModeTextStyle}>Cash On Delivery</Text>
        </View>
      </TouchableOpacity>
    );

    const content = (
      <View>
        {payUsingPaytmOption}
        {cashOnDeliveryOption}
      </View>
    );

    return (
      <View
        style={isOneApolloPayment && !(MAX_SLIDER_VALUE - oneApolloCredits) ? { opacity: 0.3 } : {}}
        pointerEvents={
          isOneApolloPayment && !(MAX_SLIDER_VALUE - oneApolloCredits) ? 'none' : 'auto'
        }
      >
        {renderHeadingAndCard(
          isOneApolloPayment
            ? 'How would you prefer to pay the balace amount ?'
            : 'Pick a payment mode',
          content
        )}
      </View>
    );
  };

  const renderPayButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '66.66%' }}
          title={`PAY RS. ${grandTotal.toFixed(2)}`}
          onPress={() => {
            try {
              CommonLogEvent(AppRoutes.CheckoutScene, `PAY RS. ${grandTotal.toFixed(2)}`);
            } catch (error) {
              CommonBugFender('CheckoutScene_renderPayButton_try', error);
            }
            initiateOrder();
          }}
          // disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {/* {renderOneApolloAndHealthCreditsCard()} */}
        {renderPaymentModesCard()}
        {renderPayButton()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
