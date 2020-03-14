import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_DIAGNOSTIC_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import {
  DiagnosticLineItem,
  DiagnosticOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SaveDiagnosticOrder,
  SaveDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveDiagnosticOrder';
import {
  g,
  postWebEngageEvent,
  formatAddress,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Linking,
} from 'react-native';
// import { Slider } from 'react-native-elements';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

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

export const TestsCheckoutScene: React.FC<CheckoutSceneProps> = (props) => {
  const [isCashOnDelivery, setCashOnDelivery] = useState(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isOneApolloPayment, setOneApolloPayment] = useState(false);
  const [oneApolloCredits, setOneApolloCredits] = useState(0);
  // const [showOrderPopup, setShowOrderPopup] = useState<boolean>(false);
  // const [orderInfo, setOrderInfo] = useState({
  //   pickupStoreName: '',
  //   pickupStoreAddress: '',
  //   orderId: '',
  //   displayId: '',
  // });
  // const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    deliveryAddressId,
    grandTotal,
    cartItems,
    clearCartInfo,
    physicalPrescriptions,
    ePrescriptions,
    diagnosticSlot,
    diagnosticClinic,
    addresses,
    clinics,
    clinicId,
    uploadPrescriptionRequired,
    cartTotal,
    deliveryCharges,
    couponDiscount,
    coupon,
  } = useDiagnosticsCart();
  const { locationForDiagnostics } = useAppCommonData();
  const client = useApolloClient();
  const MAX_SLIDER_VALUE = grandTotal;

  const getHomeVisitTime = () => {
    return '';
    if (g(diagnosticSlot, 'date') && g(diagnosticSlot, 'slotStartTime')) {
      const _date = moment(g(diagnosticSlot, 'date')).format('D MMM YYYY');
      const _time = moment(g(diagnosticSlot, 'slotStartTime')!.trim(), 'hh:mm').format('hh:mm A');
      return `${_date}, ${_time}`;
    } else {
      return '';
    }
  };

  const homeVisitTime = getHomeVisitTime();

  const saveOrder = (orderInfo: DiagnosticOrderInput) =>
    client.mutate<SaveDiagnosticOrder, SaveDiagnosticOrderVariables>({
      mutation: SAVE_DIAGNOSTIC_ORDER,
      variables: { diagnosticOrderInput: orderInfo },
    });

  const redirectToPaymentGateway = (orderId: string, displayId: string) => {
    props.navigation.navigate(AppRoutes.TestPayment, {
      orderId,
      displayId,
      price: grandTotal,
    });
  };

  const postwebEngageCheckoutCompletedEvent = (orderAutoId: string) => {
    const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
    const store = clinicId && clinics.find((item) => item.CentreCode == clinicId);
    const shippingInformation = addr
      ? formatAddress(addr)
      : store
      ? `${store.CentreName}\n${store.Locality},${store.City},${store.State}`
      : '';
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
      'Payment Type': isCashOnDelivery ? 'COD' : 'Prepaid',
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
  };

  const initiateOrder = async () => {
    setShowSpinner(true);
    const { CentreCode, CentreName, City, State, Locality } = diagnosticClinic || {};
    const {
      slotStartTime,
      slotEndTime,
      employeeSlotId,
      date,
      diagnosticEmployeeCode,
      // city, // ignore city for now from this and take from "locationForDiagnostics" context
      diagnosticBranchCode,
    } = diagnosticSlot || {};

    const slotTimings = (slotStartTime && slotEndTime
      ? `${slotStartTime}-${slotEndTime}`
      : ''
    ).replace(' ', '');
    console.log(physicalPrescriptions, 'physical prescriptions');

    const orderInfo: DiagnosticOrderInput = {
      // <- for home collection order
      diagnosticBranchCode: CentreCode ? '' : diagnosticBranchCode!,
      diagnosticEmployeeCode: diagnosticEmployeeCode || '',
      employeeSlotId: employeeSlotId! || 0,
      slotTimings: slotTimings,
      patientAddressId: deliveryAddressId!,
      // for home collection order ->
      // <- for clinic order
      centerName: CentreName || '',
      centerCode: CentreCode || '',
      centerCity: City || '',
      centerState: State || '',
      centerLocality: Locality || '',
      // for clinic order ->
      city: (locationForDiagnostics || {}).city!,
      state: (locationForDiagnostics || {}).state!,
      stateId: `${(locationForDiagnostics || {}).stateId!}`,
      cityId: `${(locationForDiagnostics || {}).cityId!}`,
      diagnosticDate: moment(date).format('YYYY-MM-DD'),
      prescriptionUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      paymentType: isCashOnDelivery
        ? DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD
        : DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT,
      // prismPrescriptionFileId: [
      //   ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
      //   ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
      // ].join(','),
      totalPrice: grandTotal,
      patientId: (currentPatient && currentPatient.id) || '',
      items: cartItems.map(
        (item) =>
          ({
            itemId: typeof item.id == 'string' ? parseInt(item.id) : item.id,
            price: (item.specialPrice as number) || item.price,
            quantity: 1,
          } as DiagnosticLineItem)
      ),
    };

    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PAYMENT_INITIATED] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      'Service Area': 'Diagnostic',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PAYMENT_INITIATED, eventAttributes);

    console.log(JSON.stringify({ diagnosticOrderInput: orderInfo }));
    console.log('orderInfo\n', { diagnosticOrderInput: orderInfo });
    saveOrder(orderInfo)
      .then(({ data }) => {
        console.log('SaveDiagnosticOrder API\n', { data });
        const { orderId, displayId, errorCode, errorMessage } =
          g(data, 'SaveDiagnosticOrder')! || {};
        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            unDismissable: true,
            title: `Uh oh.. :(`,
            description: `We're sorry :(  There's been a problem with your booking. Please book again.`,
            // description: `Order failed, ${errorMessage}.`,
          });
        } else {
          // Order-Success
          if (!isCashOnDelivery) {
            // PG order, redirect to web page
            redirectToPaymentGateway(orderId!, displayId!);
            return;
          }
          // COD order, show popup here & clear cart info
          postwebEngageCheckoutCompletedEvent(`${displayId}`); // Make sure to add this event in test payment as well when enabled
          clearCartInfo!();
          handleOrderSuccess(orderId!, displayId!);
        }
      })
      .catch((error) => {
        CommonBugFender('TestsCheckoutScene_saveOrder', error);
        console.log('SaveDiagnosticOrder API Error\n', { error });
        showAphAlert!({
          unDismissable: true,
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `We're sorry :(  There's been a problem with your booking. Please book again.`,
        });
      })
      .finally(() => {
        setShowSpinner(false);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'CHECKOUT'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.TestsCheckoutScene, 'Go back clicked');
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

  /*
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
*/
  const renderPaymentModesCard = () => {
    const payUsingPaytmOption = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          CommonLogEvent(AppRoutes.TestsCheckoutScene, 'Pay online');
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
          CommonLogEvent(AppRoutes.TestsCheckoutScene, 'Cash on delivery');
          setCashOnDelivery(true);
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
        {/* Uncomment below line and set `isCashOnDelivery` initial state as false to show online payment option. */}
        {/* {payUsingPaytmOption} */}
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
            : 'Select payment mode',
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
          title={`PAY : RS. ${grandTotal.toFixed(2)}`}
          onPress={() => {
            try {
              CommonLogEvent(AppRoutes.TestsCheckoutScene, `PAY RS. ${grandTotal.toFixed(2)}`);
            } catch (error) {
              CommonBugFender('TestsCheckoutScene_renderPayButton_try', error);
            }
            initiateOrder();
          }}
          // disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.TestOrderDetails, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderId: orderId,
    });
  };

  const handleOrderSuccess = (orderId: string, displayId: string) => {
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
      description: 'Your order has been placed successfully.',
      children: (
        <View>
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
              <TestsIcon />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 16,
                  ...theme.fonts.IBMPlexSansMedium(17),
                  lineHeight: 24,
                  color: '#01475b',
                }}
              >
                Tests
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
                {`#${displayId}`}
              </Text>
            </View>
            {!!homeVisitTime && (
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
                    {`Home Visit On: ${homeVisitTime}`}
                  </Text>
                </View>
              </>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: '#02475b',
                opacity: 0.1,
                marginBottom: 7.5,
                marginTop: 15.5,
              }}
            />
            <View style={styles.popupButtonStyle}>
              {/* <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigateToOrderDetails(true, orderId)}
              >
                <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'flex-end' }}
                onPress={() => navigateToOrderDetails(true, orderId)}
              >
                <Text style={styles.popupButtonTextStyle}>VIEW ORDER SUMMARY</Text>
              </TouchableOpacity>
            </View>
          </View>
          {renderDiagnosticHelpText()}
        </View>
      ),
    });
  };

  const renderDiagnosticHelpText = () => {
    const textMediumStyle = theme.viewStyles.text('M', 14, '#02475b', 1, 22);
    const textBoldStyle = theme.viewStyles.text('B', 14, '#02475b', 1, 22);
    const PhoneNumberTextStyle = theme.viewStyles.text('M', 14, '#fc9916', 1, 22);
    const ontapNumber = (number: string) => {
      Linking.openURL(`tel:${number}`)
        .then(() => {})
        .catch((e) => {
          CommonBugFender('TestsCheckoutScene_Linking_mobile', e);
        });
    };

    return (
      <Text style={{ margin: 20, marginTop: 0 }}>
        <Text style={textMediumStyle}>{'For '}</Text>
        <Text style={textBoldStyle}>{'Test Orders,'}</Text>
        <Text style={textMediumStyle}>
          {' to know the Order Status / Reschedule / Cancel, please call — \n'}
        </Text>
        <Text onPress={() => ontapNumber('040 44442424')} style={PhoneNumberTextStyle}>
          {'040 44442424'}
        </Text>
        <Text style={textMediumStyle}>{' / '}</Text>
        <Text onPress={() => ontapNumber('040 33442424')} style={PhoneNumberTextStyle}>
          {'040 33442424'}
        </Text>
      </Text>
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
