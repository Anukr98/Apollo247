import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getHealthCredits,
  persistHealthCredits,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { PaymentOptions } from '@aph/mobile-patients/src/components/ui/PaymentOptions';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CircleButtomButtonComponent } from '@aph/mobile-patients/src/components/CirclePlan/Components/CircleButtonButton';
import { CircleTotalBill } from '@aph/mobile-patients/src/components/ui/CircleTotalBill';
import { useApolloClient } from 'react-apollo-hooks';
import { OneApolloHCOptionComponent } from '@aph/mobile-patients/src/components/CirclePlan/Components/OneApolloHCOption';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { GET_ONEAPOLLO_USER } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const { width, height } = Dimensions.get('window');

interface CirclePaymentOptionsProps extends NavigationScreenProps {
  from: string;
  selectedPlan: string;
  screenName: string;
}
export const CirclePaymentOptions: React.FC<CirclePaymentOptionsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { healthCredits, setHealthCredits } = useAppCommonData();
  const {
    subscriptionHCUsed,
    setSubscriptionHCUsed,
    circlePlanSelected,
    defaultCirclePlan,
    subscriptionCoupon,
    subscriptionBillTotal,
    setSubscriptionBillTotal,
  } = useShoppingCart();
  const client = useApolloClient();
  const { from, selectedPlan, screenName } = props;
  const [isOneApolloSelected, setIsOneApolloSelected] = useState<boolean>(false);
  const discount = Number(subscriptionCoupon?.discount) || 0;

  const planSellingPrice = selectedPlan
    ? selectedPlan?.currentSellingPrice
    : defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;

  useEffect(() => {
    fetchHealthCredits();
    setSubscriptionBillTotal?.(planSellingPrice - discount);
  }, []);

  const fetchHealthCredits = async () => {
    var cachedHealthCredit: any = await getHealthCredits();
    if (cachedHealthCredit != null) {
      setHealthCredits?.(cachedHealthCredit.healthCredit);
      return; // no need to call api
    }
    try {
      const res = await client.query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: g(currentPatient, 'id'),
        },
        fetchPolicy: 'no-cache',
      });
      const credits = res?.data?.getOneApolloUser?.availableHC;
      setHealthCredits?.(credits);
      persistHealthCredits(credits);
    } catch (error) {
      CommonBugFender('MyMembership_fetchCircleSavings', error);
    }
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'PAYMENT'}
        onPressLeftIcon={() => {
          setSubscriptionHCUsed?.(0);
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderCircleBill = () => <CircleTotalBill selectedPlan={selectedPlan} from={'payment'} />;

  const renderPaymentOptions = () => {
    return (
      <PaymentOptions
        navigation={props.navigation}
        from={from}
        selectedPlan={selectedPlan}
        comingFrom={'circlePlanPurchase'}
        screenName={screenName}
      />
    );
  };

  const renderOneApolloOption = () => (
    <OneApolloHCOptionComponent
      healthCredits={healthCredits}
      oneApolloSelected={isOneApolloSelected}
      onSelectOneApollo={onSelectOneApollo}
    />
  );

  const onSelectOneApollo = () => {
    if (isOneApolloSelected) {
      setIsOneApolloSelected(false);
      setSubscriptionHCUsed?.(0);
      setSubscriptionBillTotal?.(planSellingPrice - discount);
    } else {
      setIsOneApolloSelected(true);
      if (healthCredits >= planSellingPrice - discount) {
        setSubscriptionHCUsed?.(planSellingPrice - discount);
        setSubscriptionBillTotal?.(0);
      } else {
        setSubscriptionHCUsed?.(healthCredits);
        setSubscriptionBillTotal?.(planSellingPrice - discount - healthCredits);
      }
    }
  };

  console.log('subscriptionBillTotal >>>> ', subscriptionBillTotal);
  const renderBottomButton = () => {
    return <CircleButtomButtonComponent onButtonPress={() => {}} buttonText={`PAY`} />;
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView style={{ paddingBottom: 70 }}>
          {renderCircleBill()}
          {!!healthCredits && renderOneApolloOption()}
          {!!subscriptionBillTotal && renderPaymentOptions()}
        </ScrollView>
        {!subscriptionBillTotal && renderBottomButton()}
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
