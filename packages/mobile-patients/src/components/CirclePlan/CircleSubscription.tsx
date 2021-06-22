import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { CircleTotalBill } from '@aph/mobile-patients/src/components/ui/CircleTotalBill';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  CircleEventSource,
  g,
  getCircleNoSubscriptionText,
  getUserType,
  navigateToHome,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CircleButtomButtonComponent } from '@aph/mobile-patients/src/components/CirclePlan/Components/CircleButtonButton';

interface CirclePaymentProps extends NavigationScreenProps {
  action?: string;
  selectedPlan?: any;
  from?: string;
  screenName?: string;
  circleEventSource?: CircleEventSource;
}
export const CircleSubscription: React.FC<CirclePaymentProps> = (props) => {
  const action = props.navigation.getParam('action');
  const screenName = props.navigation.getParam('screenName');
  const from = props?.navigation?.state?.params?.from;
  const selectedPlan = props.navigation.getParam('selectedPlan');
  const circleEventSource = props.navigation.getParam('circleEventSource');
  const { circlePlanSelected, setSubscriptionCoupon } = useShoppingCart();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    fireCirclePaymentPageViewedEvent();
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const fireCirclePaymentPageViewedEvent = () => {
    const circleData = circlePlanSelected || selectedPlan;
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE] = {
      navigation_source: circleEventSource,
      circle_end_date: getCircleNoSubscriptionText(),
      circle_start_date: getCircleNoSubscriptionText(),
      circle_planid: circleData?.subPlanId,
      customer_id: currentPatient?.id,
      duration_in_month: circleData?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circleData?.currentSellingPrice,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
    setTimeout(
      () =>
        postCleverTapEvent(
          CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE,
          cleverTapEventAttributes
        ),
      1000
    );
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          setSubscriptionCoupon?.(null);
          if (action === 'PAY') {
            navigateToHome(props.navigation);
          } else {
            props.navigation.goBack();
          }
        },
      },
    ]);
    return true;
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'PAYMENT'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderCircleBill = () => <CircleTotalBill selectedPlan={selectedPlan} />;

  const onApplyCouponClick = () => {
    props.navigation.navigate(AppRoutes.ViewCoupons, { movedFrom: 'subscription' });
  };

  const renderCouponSection = () => (
    <Coupon
      onPressApplyCoupon={() => onApplyCouponClick()}
      onPressRemove={() => {
        setSubscriptionCoupon?.(null);
      }}
      movedFrom={'subscription'}
    />
  );

  const renderBottomButton = () => {
    return (
      <CircleButtomButtonComponent
        onButtonPress={() => {
          props.navigation.navigate(AppRoutes.CirclePaymentOptions, {
            from,
            selectedPlan,
            comingFrom: 'circlePlanPurchase',
            screenName,
          });
        }}
        buttonText={`PROCEED TO PAY`}
      />
    );
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView>
          {renderCircleBill()}
          {renderCouponSection()}
        </ScrollView>
        {renderBottomButton()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
