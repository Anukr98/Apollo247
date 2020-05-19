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
  CheckedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_MEDICINE_ORDER_OMS,
  SAVE_MEDICINE_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartOMSItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  CODCity,
  BOOKINGSOURCE,
  DEVICETYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import {
  aphConsole,
  g,
  handleGraphQlError,
  postWebEngageEvent,
  formatAddress,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Slider } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';

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
  textStyle1: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    textAlign: 'justify',
    paddingTop: 27,
  },
  textStyle2: {
    ...theme.viewStyles.text('M', 13, '#02475b'),
    textAlign: 'justify',
  },
  textStyle3: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    marginBottom: 5,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
  },
  separatorStyle: {
    marginTop: 19,
    marginBottom: 20,
    backgroundColor: '#02475b',
    opacity: 0.1,
  },
});

export interface CheckoutSceneProps
  extends NavigationScreenProps<{
    deliveryTime: string;
    isChennaiOrder: boolean;
  }> {}

export const CheckoutScene: React.FC<CheckoutSceneProps> = (props) => {
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const isChennaiOrder = props.navigation.getParam('isChennaiOrder');
  const { currentPatient } = useAllCurrentPatients();
  const [isOneApolloPayment, setOneApolloPayment] = useState(false);
  const [oneApolloCredits, setOneApolloCredits] = useState(0);
  const [isCashOnDelivery, setCashOnDelivery] = useState(isChennaiOrder ? true : false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(g(currentPatient, 'emailAddress') || '');
  const [emailIdCheckbox, setEmailIdCheckbox] = useState<boolean>(
    g(currentPatient, 'emailAddress') ? false : true
  );
  const [agreementCheckbox, setAgreementCheckbox] = useState<boolean>(false);

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
    productDiscount,
    cartTotal,
    addresses,
    stores,
    coupon,
  } = useShoppingCart();

  const MAX_SLIDER_VALUE = grandTotal;
  const client = useApolloClient();

  useEffect(() => {
    if (email) {
      setEmailIdCheckbox(false);
    } else {
      setEmailIdCheckbox(true);
    }
  }, [emailIdCheckbox, email]);

  const getPrepaidCheckoutCompletedEventAttributes = (orderAutoId: string) => {
    try {
      const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
      const store = storeId && stores.find((item) => item.storeid == storeId);
      const shippingInformation = addr ? formatAddress(addr) : store ? store.address : '';
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = {
        'Order ID': orderAutoId,
        'Order Type': 'Cart',
        'Prescription Required': uploadPrescriptionRequired,
        'Prescription Added': !!(physicalPrescriptions.length || ePrescriptions.length),
        'Shipping information': shippingInformation, // (Home/Store address)
        'Total items in cart': cartItems.length,
        'Grand Total': cartTotal + deliveryCharges,
        'Total Discount %': coupon ? Number(((couponDiscount / cartTotal) * 100).toFixed(2)) : 0,
        'Discount Amount': couponDiscount,
        'Delivery charge': deliveryCharges,
        'Net after discount': grandTotal,
        'Payment status': 1,
        'Payment Type': 'Prepaid',
        'Service Area': 'Pharmacy',
      };
      return eventAttributes;
    } catch (error) {
      return {};
    }
  };

  const postwebEngageCheckoutCompletedEvent = (orderAutoId: string) => {
    const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
    const store = storeId && stores.find((item) => item.storeid == storeId);
    const shippingInformation = addr ? formatAddress(addr) : store ? store.address : '';
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'Order ID': orderAutoId,
      'Order Type': 'Cart',
      'Prescription Required': uploadPrescriptionRequired,
      'Prescription Added': !!(physicalPrescriptions.length || ePrescriptions.length),
      'Shipping information': shippingInformation, // (Home/Store address)
      'Total items in cart': cartItems.length,
      'Grand Total': cartTotal + deliveryCharges,
      'Total Discount %': coupon
        ? Number((((couponDiscount + productDiscount) / cartTotal) * 100).toFixed(2))
        : 0,
      'Discount Amount': couponDiscount + productDiscount,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Payment status': 1,
      'Payment Type': isCashOnDelivery ? 'COD' : 'Prepaid',
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);

    try {
      // const eventFirebaseAttributes: FirebaseEvents[FirebaseEventName.IN_APP_PURCHASE] = {
      //   type: 'Pharmacy',
      // };
      // postFirebaseEvent(FirebaseEventName.IN_APP_PURCHASE, eventFirebaseAttributes);
    } catch (error) {}
  };

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
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
        // orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: grandTotal,
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
        // Values for chennai COD order
        email: isChennaiOrder && email ? email.trim() : null,
        CODCity: isChennaiOrder ? CODCity.CHENNAI : null,
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
          try {
            postwebEngageCheckoutCompletedEvent(`${orderAutoId}`);
          } catch (error) {
            console.log(error);
          }

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
    const checkoutEventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${orderAutoId}`),
    };
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orderId,
      orderAutoId,
      token,
      amount: grandTotal,
      deliveryTime,
      checkoutEventAttributes,
    });
  };

  const initiateOrder = async () => {
    setShowSpinner(true);

    const orderInfo: saveMedicineOrderOMSVariables = {
      medicineCartOMSInput: {
        coupon: coupon ? coupon.code : null,
        couponDiscount: coupon ? couponDiscount : null,
        productDiscount: productDiscount || null,
        quoteId: null,
        patientId: (currentPatient && currentPatient.id) || '',
        shopId: storeId || null,
        patientAddressId: deliveryAddressId,
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
        items: cartItems.map((item) => {
          const discountedPrice = (coupon && item.couponPrice) || item.specialPrice || item.price; // since couponPrice & specialPrice can be undefined
          return {
            medicineSKU: item.id,
            medicineName: item.name,
            quantity: item.quantity,
            mrp: item.price,
            price: discountedPrice,
            itemValue: item.price * item.quantity, // (multiply MRP with quantity)
            itemDiscount: item.price * item.quantity - discountedPrice * item.quantity, // (diff of (MRP - discountedPrice) * quantity)
            isPrescriptionNeeded: item.prescriptionRequired ? 1 : 0,
            mou: Number(item.mou),
            isMedicine: item.isMedicine ? '1' : '0',
          } as MedicineCartOMSItem;
        }),
        bookingSource: BOOKINGSOURCE.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      },
    };

    console.log(JSON.stringify(orderInfo));

    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PAYMENT_INITIATED] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PAYMENT_INITIATED, eventAttributes);

    saveOrder(orderInfo)
      .then(({ data }) => {
        const { orderId, orderAutoId, errorCode, errorMessage } =
          g(data, 'saveMedicineOrderOMS')! || {};
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

  const renderChennaiOrderForm = () => {
    return (
      <>
        <Text style={styles.textStyle1}>
          {`Dear ${g(currentPatient, 'firstName') ||
            ''},\n\nSUPERB!\n\nYour order request is in process\n`}
        </Text>
        <Text style={styles.textStyle2}>
          {'Just one more step. New Regulation in your region requires your email id.\n'}
        </Text>
        <Text style={styles.textStyle3}>{'Your email id please'}</Text>
        <TextInputComponent
          value={`${email}`}
          onChangeText={(email) => setEmail(email)}
          placeholder={'name@email.com'}
          inputStyle={styles.inputStyle}
        />
        <TouchableOpacity
          onPress={() => setEmailIdCheckbox(!emailIdCheckbox)}
          activeOpacity={1}
          style={styles.checkboxViewStyle}
        >
          {emailIdCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {
              'Check this box if you don’t have an Email Id & want us to share your order details over SMS.'
            }
          </Text>
        </TouchableOpacity>
        <Spearator style={styles.separatorStyle} />
        <TouchableOpacity
          onPress={() => setAgreementCheckbox(!agreementCheckbox)}
          activeOpacity={1}
          style={[styles.checkboxViewStyle, { marginTop: 0 }]}
        >
          {agreementCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {'I agree to share my medicine requirements with Apollo Pharmacy for home delivery.'}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const onPressChennaiOrderPayButton = () => {
    if (!(email === '' || (email && isSatisfyingEmailRegex(email.trim())))) {
      showAphAlert!({ title: 'Uh oh.. :(', description: 'Enter valid email' });
    } else {
      try {
        CommonLogEvent(AppRoutes.CheckoutScene, `SUBMIT TO CONFIRM ORDER`);
      } catch (error) {
        CommonBugFender('CheckoutScene_renderPayButton_try', error);
      }
      initiateOrder();
    }
  };

  const renderChennaiOrderPayButton = () => {
    const isPayDisabled = !agreementCheckbox;
    return (
      <StickyBottomComponent
        style={[styles.stickyBottomComponentStyle, { paddingHorizontal: 0, paddingTop: 25 }]}
      >
        <Button
          style={{ width: '100%' }}
          title={`SUBMIT TO CONFIRM ORDER`}
          onPress={onPressChennaiOrderPayButton}
          disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const renderChennaiOrderFormAndPayButton = () => {
    const keyboardVerticalOffset =
      Platform.OS === 'android' ? { keyboardVerticalOffset: 110 } : { keyboardVerticalOffset: 30 };

    return (
      <View style={{ ...theme.viewStyles.card(16, 20, 10, '#fff'), flex: 1 }}>
        {/* <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} {...keyboardVerticalOffset}> */}
        <ScrollView contentContainerStyle={{ flex: 1 }} bounces={false}>
          {renderChennaiOrderForm()}
          {renderChennaiOrderPayButton()}
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {/* {renderOneApolloAndHealthCreditsCard()} */}
        {isChennaiOrder ? (
          renderChennaiOrderFormAndPayButton()
        ) : (
          <>
            {renderPaymentModesCard()}
            {renderPayButton()}
          </>
        )}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
