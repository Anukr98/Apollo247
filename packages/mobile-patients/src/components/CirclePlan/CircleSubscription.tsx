import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { PaymentOptions } from '@aph/mobile-patients/src/components/ui/PaymentOptions';
import { CircleTotalBill } from '@aph/mobile-patients/src/components/ui/CircleTotalBill';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface CirclePaymentProps extends NavigationScreenProps {
  action?: string;
  selectedPlan?: any;
}
export const CircleSubscription: React.FC<CirclePaymentProps> = (props) => {
  const action = props.navigation.getParam('action');
  const from = props.navigation.getParam('from');
  const selectedPlan = props.navigation.getParam('selectedPlan');
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          if (action === 'PAY') {
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            );
            // props.navigation.navigate('TESTS');
          } else {
            props.navigation.goBack();
          }
        },
      },
    ]);
    return true;
  };

  const renderPaymentOptions = () => (
    <PaymentOptions
      navigation={props.navigation}
      from={from}
      selectedPlan={selectedPlan}
      comingFrom={'circlePlanPurchase'}
    />
  );

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

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView>
          {renderCircleBill()}
          {renderPaymentOptions()}
        </ScrollView>
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
