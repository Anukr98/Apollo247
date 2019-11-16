import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
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
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  MedicineCartItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  DiagnosticOrderInput,
  DiagnosticLineItem,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SaveMedicineOrder,
  SaveMedicineOrderVariables,
  SaveMedicineOrder_SaveMedicineOrder,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrder';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
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
} from 'react-native';
import { Slider } from 'react-native-elements';
import firebase from 'react-native-firebase';
import { NavigationScreenProps } from 'react-navigation';
import {
  SAVE_MEDICINE_ORDER,
  SAVE_MEDICINE_ORDER_PAYMENT,
  SAVE_DIAGNOSTIC_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { SaveMedicineOrderPaymentVariables } from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPayment';
import { handleGraphQlError, aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '../FunctionHelpers/DeviceHelper';
import {
  SaveDiagnosticOrder,
  SaveDiagnosticOrderVariables,
} from '../graphql/types/SaveDiagnosticOrder';
import moment from 'moment';

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
  const [isOneApolloPayment, setOneApolloPayment] = useState(false);
  const [oneApolloCredits, setOneApolloCredits] = useState(0);
  const [isCashOnDelivery, setCashOnDelivery] = useState(true);
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [orderInfo, setOrderInfo] = useState({
    pickupStoreName: '',
    pickupStoreAddress: '',
    orderId: '',
    orderAutoId: 0,
  });
  const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { showAphAlert } = useUIElements();
  const {
    deliveryAddressId,
    clinicId,
    grandTotal,
    deliveryCharges,
    cartItems,
    deliveryType,
    clearCartInfo,
    physicalPrescriptions,
    ePrescriptions,

    diagnosticSlot,
    diagnosticClinic,
  } = useDiagnosticsCart();

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const MAX_SLIDER_VALUE = grandTotal;
  const client = useApolloClient();

  const saveOrder = (orderInfo: DiagnosticOrderInput) =>
    client.mutate<SaveDiagnosticOrder, SaveDiagnosticOrderVariables>({
      mutation: SAVE_DIAGNOSTIC_ORDER,
      variables: { diagnosticOrderInput: orderInfo },
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentVariables) =>
    client.mutate<SaveMedicineOrder, SaveMedicineOrderPaymentVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  // const placeOrder = (orderId: string, orderAutoId: number) => {
  //   savePayment({
  //     medicinePaymentInput: {
  //       orderId: orderId,
  //       orderAutoId: orderAutoId,
  //       amountPaid: grandTotal,
  //       paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
  //       paymentStatus: 'success',
  //       responseCode: '',
  //       responseMessage: '',
  //     },
  //   })
  //     .then(({ data }) => {
  //       const { errorCode, errorMessage } = ((data &&
  //         data.SaveMedicineOrder &&
  //         data.SaveMedicineOrder) ||
  //         {}) as SaveMedicineOrder_SaveMedicineOrder;

  //       console.log({ errorCode, errorMessage });
  //       setShowSpinner(false);
  //       if (errorCode || errorMessage) {
  //         showAphAlert!({
  //           title: `Uh oh.. :(`,
  //           description: `Order failed, ${errorMessage}.`,
  //         });
  //         // Order-failed
  //       } else {
  //         // Order-Success
  //         // Show popup here & clear info
  //         clearCartInfo && clearCartInfo();
  //         setOrderInfo({
  //           orderId: orderId,
  //           orderAutoId: orderAutoId,
  //           pickupStoreAddress: '',
  //           pickupStoreName: '',
  //         });
  //         setShowOrderPopup(true);
  //       }
  //     })
  //     .catch((e) => {
  //       setShowSpinner(false);
  //       aphConsole.log({ e });
  //       showAphAlert!({
  //         title: `Uh oh.. :(`,
  //         description: `Something went wrong, unable to place order.`,
  //       });
  //     });
  // };

  const redirectToPaymentGateway = async (orderId: string, orderAutoId: number) => {
    const token = await firebase.auth().currentUser!.getIdToken();
    console.log({ token });
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orderId,
      orderAutoId,
      token,
      amount: grandTotal,
    });
  };

  const initiateOrder = async () => {
    const { CentreCode, CentreName, City, State, Locality } = diagnosticClinic || {};
    const { slotStartTime, slotEndTime, employeeSlotId, date, diagnosticEmployeeCode, city } =
      diagnosticSlot || {};
    setShowSpinner(true);
    const orderInfo: DiagnosticOrderInput = {
      // for home collection order
      diagnosticBranchCode: CentreCode ? 'HYD_HUB1' : '',
      diagnosticEmployeeCode: diagnosticEmployeeCode || '',
      employeeSlotId: employeeSlotId! || 0,
      slotTimings: slotStartTime && slotEndTime ? `${slotStartTime} - ${slotEndTime}` : '',
      diagnosticDate: moment(date).format('YYYY-MM-DD'),
      patientAddressId: deliveryAddressId!,
      city: city || '',
      // for clinic order
      centerName: CentreName || '',
      centerCode: CentreCode || '',
      centerCity: City || '',
      centerState: State || '',
      centerLocality: Locality || '',

      totalPrice: grandTotal,
      patientId: (currentPatient && currentPatient.id) || '',
      prescriptionUrl: [
        ...physicalPrescriptions.map((item) => item.uploadedUrl),
        ...ePrescriptions.map((item) => item.uploadedUrl),
      ].join(','),
      items: cartItems.map(
        (item) =>
          ({
            itemId: typeof item.id == 'string' ? parseInt(item.id) : item.id,
            price: (item.specialPrice as number) || item.price,
            quantity: 1,
          } as DiagnosticLineItem)
      ),
    };

    console.log(JSON.stringify(orderInfo));
    saveOrder(orderInfo)
      .then(({ data }) => {
        console.log('\nOrder-Success\n', { data });
        const { orderId, errorCode, errorMessage } =
          (data && data.SaveDiagnosticOrder && data.SaveDiagnosticOrder) || {};
        // if (isCashOnDelivery) {
        // only CashOnDelivery supported as of now
        setShowSpinner(false);
        if (errorCode || errorMessage) {
          showAphAlert!({
            title: `Uh oh.. :(`,
            description: `Order failed, ${errorMessage}.`,
          });
          // Order-failed
        } else {
          // Order-Success
          // Show popup here & clear info
          clearCartInfo && clearCartInfo();
          setOrderInfo({
            orderId: orderId,
            orderAutoId: orderId,
            pickupStoreAddress: '',
            pickupStoreName: '',
          });
          setShowOrderPopup(true);
        }
      })
      .catch((error) => {
        setShowSpinner(false);
        handleGraphQlError(error);
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
          CommonLogEvent(AppRoutes.TestsCheckoutScene, 'Pay online');
          setCashOnDelivery(!isCashOnDelivery);
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
          // setCashOnDelivery(!isCashOnDelivery);
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
              CommonLogEvent(AppRoutes.TestsCheckoutScene, `PAY RS. ${grandTotal.toFixed(2)}`);
            } catch (error) {}
            initiateOrder();
          }}
          // disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const renderOrderInfoPopup = () => {
    const navigateOnSuccess = (showOrderSummaryTab: boolean) => {
      props.navigation.navigate(AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        showOrderSummaryTab,
        orderAutoId: orderInfo.orderAutoId,
      });
    };

    if (showOrderPopup) {
      return (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={'Your order has been placed successfully.'}
        >
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
                {`#${orderInfo.orderAutoId}`}
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: '#02475b',
                opacity: 0.1,
                marginBottom: 7.5,
                marginTop: 15.5,
              }}
            />
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
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
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: '#02475b',
                opacity: 0.1,
                marginBottom: 15.5,
                marginTop: 7.5,
              }}
            /> */}
            <View style={styles.popupButtonStyle}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigateOnSuccess(true)}>
                <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'flex-end' }}
                onPress={() => navigateOnSuccess(false)}
              >
                <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {/* {renderOneApolloAndHealthCreditsCard()} */}
        {renderPaymentModesCard()}
        {renderPayButton()}
      </SafeAreaView>
      {renderOrderInfoPopup()}
      {showSpinner && <Spinner />}
    </View>
  );
};
