import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  NativeModules,
  BackHandler,
  FlatList,
  View,
  ScrollView,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Bank } from '@aph/mobile-patients/src/components/PaymentGateway/Components/Bank';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CREATE_ORDER,
  INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { InitiateNetBankingTxn } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  initiateDiagonsticHCOrderPaymentVariables,
  initiateDiagonsticHCOrderPayment,
} from '@aph/mobile-patients/src/graphql/types/initiateDiagonsticHCOrderPayment';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

export interface OtherBanksProps extends NavigationScreenProps {}

export const OtherBanks: React.FC<OtherBanksProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const amount = props.navigation.getParam('amount');
  const banks = props.navigation.getParam('banks');
  const orderId = props.navigation.getParam('orderId');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);

  const onPressBank = (bank: any) => setSelectedBank(bank);

  const initiateOrderPayment = async () => {
    // Api is called to update the order status from Quote to Payment Pending
    const input: initiateDiagonsticHCOrderPaymentVariables = {
      diagnosticInitiateOrderPaymentInput: { orderId: orderId },
    };
    const res = await client.mutate<
      initiateDiagonsticHCOrderPayment,
      initiateDiagonsticHCOrderPaymentVariables
    >({
      mutation: INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
      variables: input,
      fetchPolicy: 'no-cache',
    });
  };

  const createJusPayOrder = (paymentMode: 'PREPAID' | 'COD') => {
    const orderInput = {
      payment_order_id: paymentId,
      payment_mode: paymentMode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.returnUrl,
    };
    return client.mutate({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  async function onPressPay(bank: any) {
    setisTxnProcessing(true);
    try {
      initiateOrderPayment();
      const response = await createJusPayOrder('PREPAID');
      const { data } = response;
      const { createOrder } = data;
      InitiateNetBankingTxn(
        currentPatient?.id,
        createOrder?.juspay?.client_auth_token,
        paymentId,
        bank?.paymentMethod
      );
      props.navigation.goBack();
    } catch (e) {
      setisTxnProcessing(false);
      props.navigation.goBack();
    }
  }

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={`AMOUNT TO PAY : ₹ ${amount}`}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderBanksHeading = () => {
    return <Text style={styles.select}>Select A Bank</Text>;
  };

  const renderBanksList = () => {
    return (
      <FlatList
        data={banks}
        renderItem={(item) => (
          <Bank bank={item?.item} onPressBank={onPressBank} selectedBank={selectedBank} />
        )}
      />
    );
  };

  const renderPaySecurely = () => {
    return selectedBank ? (
      <View style={styles.buttonContainer}>
        <Button title={'PAY SECURELY'} onPress={() => onPressPay(selectedBank)} />
      </View>
    ) : null;
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.listContainer}>
          {renderBanksHeading()}
          {renderBanksList()}
        </ScrollView>
        {renderPaySecurely()}
        {isTxnProcessing && <Spinner />}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  select: {
    marginTop: 30,
    marginBottom: 15,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 21,
    color: '#00B38E',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
});
