import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { PaymentOptions } from '@aph/mobile-patients/src/components/ui/PaymentOptions';
import { CircleTotalBill } from '@aph/mobile-patients/src/components/ui/CircleTotalBill';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface CirclePaymentProps extends NavigationScreenProps {}
export const CircleSubscription: React.FC<CirclePaymentProps> = (props) => {
  const from = props.navigation.getParam('from');
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
          props.navigation.goBack();
        },
      },
    ]);
    return true;
  };

  const renderPaymentOptions = () => <PaymentOptions navigation={props.navigation} from={from} />;

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

  const renderCircleBill = () => <CircleTotalBill />;

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
