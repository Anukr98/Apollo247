import React, { useEffect } from 'react';
import { StyleSheet, Text, BackHandler, View, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { CircleLogo, OrderPlacedCheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import moment from 'moment';
import {
  formatTestSlotWithBuffer,
  postWebEngageEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface OrderStatusProps extends NavigationScreenProps {}

export const OrderStatus: React.FC<OrderStatusProps> = (props) => {
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const isCOD = props.navigation.getParam('isCOD');
  const { currentPatient } = useAllCurrentPatients();
  const pickupDate = moment(orderDetails?.diagnosticDate!).format('DD MMM');
  const pickupYear = moment(orderDetails?.diagnosticDate!).format('YYYY');
  const pickupTime = orderDetails && formatTestSlotWithBuffer(orderDetails?.slotTime!);
  const orderCartSaving = orderDetails?.cartSaving!;
  const orderCircleSaving = orderDetails?.circleSaving!;
  const showCartSaving = orderCartSaving > 0 && orderDetails?.cartHasAll;
  const { isDiagnosticCircleSubscription, clearDiagnoticCartInfo } = useDiagnosticsCart();
  const { circleSubscriptionId } = useShoppingCart();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const savings = isDiagnosticCircleSubscription
    ? Number(orderCartSaving) + Number(orderCircleSaving)
    : orderCartSaving;
  const couldBeSaved =
    !isDiagnosticCircleSubscription && orderCircleSaving > 0 && orderCircleSaving > orderCartSaving;
  console.log('orderDetails >>>', orderDetails);
  const navigateToHome = () => {
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
  };

  useEffect(() => {
    clearDiagnoticCartInfo?.();
    postwebEngageCheckoutCompletedEvent();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const postwebEngageCheckoutCompletedEvent = () => {
    let attributes = {
      ...eventAttributes,
      'Circle discount': circleSubscriptionId && orderCircleSaving ? orderCircleSaving : 0,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, attributes);
  };

  const handleBack = () => {
    navigateToHome();
    return true;
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    setLoading!(false);
    props.navigation.navigate(AppRoutes.TestOrderDetailsSummary, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderId: orderId,
      comingFrom: AppRoutes.TestsCart,
    });
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.name}>{`Hi, ${currentPatient?.firstName || ''} :)`}</Text>
        <TouchableOpacity onPress={() => navigateToOrderDetails(true, orderDetails?.orderId!)}>
          <Text style={styles.orderSummary}>VIEW ORDER SUMMARY</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrderPlacedMsg = () => {
    return (
      <View style={styles.orderPlaced}>
        <OrderPlacedCheckedIcon style={styles.placedIcon} />
        <Text style={styles.orderPlacedText}>Your order has been placed successfully.</Text>
      </View>
    );
  };

  const renderBookingInfo = () => {
    return (
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingIdText}>
          Your Booking ID is
          <Text style={styles.bookingNumberText}> #{orderDetails?.displayId!}</Text>
        </Text>
        <Spearator style={styles.horizontalSeparator} />
        <View style={styles.pickUpInfo}>
          {!!pickupDate && !!pickupYear && (
            <View>
              <Text style={styles.placeholderText}>PICKUP DATE</Text>
              <Text style={styles.date}>
                {pickupDate}, {pickupYear}
              </Text>
            </View>
          )}
          {!!pickupTime && (
            <View>
              <Text style={styles.placeholderText}>PICKUP TIME</Text>
              <Text style={styles.date}>{pickupTime}</Text>
            </View>
          )}
        </View>
        <View style={{ marginHorizontal: 20 }}>
          <Text style={styles.placeholderText}>BOOKING DATE/TIME</Text>
          <Text style={styles.date}>
            {moment().format('DD MMM')}, {moment().format('YYYY')} | {moment().format('hh:mm A')}
          </Text>
        </View>
      </View>
    );
  };

  const renderAmount = () => {
    return (
      <Text style={styles.savedTxt}>
        {isCOD ? 'Amount to be paid via cash' : 'Total amount paid'} :{' '}
        <Text style={styles.amount}>₹ {orderDetails?.amount}</Text>
      </Text>
    );
  };

  const renderCartSavings = () => {
    return (
      <View style={styles.totalSavingOuterView}>
        {renderAmount()}
        {!!savings && (
          <Text style={{ ...styles.savedTxt, marginTop: 8 }}>
            You {''}
            <Text style={styles.savedAmt}>saved ₹ {savings}</Text>
            {''} on your purchase.
          </Text>
        )}
        {((isDiagnosticCircleSubscription && orderCircleSaving > 0) ||
          !!showCartSaving ||
          couldBeSaved) && <Spearator style={{ marginVertical: 10 }} />}
        {isDiagnosticCircleSubscription && orderCircleSaving > 0 && (
          <>
            <View style={styles.circleSaving}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CircleLogo style={styles.circleLogo} />
                <View>
                  <Text style={styles.cartSavings}>Membership Discount</Text>
                </View>
              </View>
              <Text style={styles.cartSavings}>₹ {orderCircleSaving}</Text>
            </View>
          </>
        )}
        {!!showCartSaving! && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={styles.cartSavings}>Cart Saving</Text>
              <Text style={styles.cartSavings}>₹ {orderCartSaving}</Text>
            </View>
          </>
        )}
        {couldBeSavings()}
      </View>
    );
  };

  const couldBeSavings = () => {
    return (
      couldBeSaved && (
        <View style={styles.couldBeSavings}>
          <Text style={styles.savedTxt}>
            You could have <Text style={styles.savedAmt}>saved extra ₹{orderCircleSaving}</Text>{' '}
            with
          </Text>
          <CircleLogo style={{ ...styles.circleLogo, marginLeft: 4 }} />
        </View>
      )
    );
  };

  const backToHome = () => {
    return (
      <View>
        <Spearator style={styles.separator} />
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigateToHome()}>
          <Text style={styles.homeScreen}>GO TO HOMESCREEN</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
        <>
          {renderHeader()}
          {renderOrderPlacedMsg()}
          {renderBookingInfo()}
          {renderCartSavings()}
          {backToHome()}
        </>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    ...theme.fonts.IBMPlexSansSemiBold(24),
    lineHeight: 31,
    color: '#02475B',
  },
  orderSummary: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 19,
    color: '#FC9916',
  },
  orderPlaced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  scrollViewOuterView: {
    flexDirection: 'row',
    marginTop: '10%',
    width: '70%',
    height: 90,
  },
  orderPlacedText: {
    flexWrap: 'wrap',
    textAlign: 'left',
    alignSelf: 'center',
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    color: '#0087BA',
  },
  placedIcon: {
    marginRight: 15,
    height: 40,
    width: 40,
  },
  bookingInfo: {
    marginVertical: 20,
    backgroundColor: '#F7F8F5',
    borderRadius: 5,
    paddingVertical: 16,
  },
  bookingIdText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    paddingBottom: 16,
    paddingHorizontal: 15,
  },
  bookingNumberText: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    marginHorizontal: 4,
  },
  horizontalSeparator: {
    borderWidth: 1,
    color: '#000000',
    opacity: 0.1,
    width: '100%',
  },
  date: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    color: '#01475B',
    marginTop: 4,
  },
  pickUpInfo: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 16,
    letterSpacing: 1,
  },
  contentText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
  },
  totalSavingOuterView: {
    marginVertical: 10,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    borderRadius: 5,
    padding: 16,
    paddingVertical: 10,
    borderStyle: 'dashed',
  },
  savedTxt: {
    color: '#02475B',
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
  },
  savedAmt: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  amount: {
    ...theme.fonts.IBMPlexSansBold(12),
    color: '#02475B',
  },
  cartSavings: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(11),
    lineHeight: 16,
    alignSelf: 'flex-end',
  },
  circleLogo: {
    height: 20,
    width: 34,
    resizeMode: 'contain',
    marginRight: 4,
  },
  circleSaving: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  couldBeSavings: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  separator: {
    borderColor: 'rgba(2,71,91,0.4)',
    marginTop: 50,
    borderBottomWidth: 1,
  },
  homeScreen: {
    ...theme.viewStyles.text('B', 16, '#FC9916'),
    marginVertical: 20,
  },
});
