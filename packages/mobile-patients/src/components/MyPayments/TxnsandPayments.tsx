import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  terminateSDK,
  createHyperServiceObject,
  initiateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

export interface TxnsandPaymentsProps extends NavigationScreenProps {}

export const TxnsandPayments: React.FC<TxnsandPaymentsProps> = (props) => {
  const patientId = props.navigation.getParam('patientId');
  const fromNotification = props.navigation.getParam('fromNotification');
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const { cusId, isfetchingId } = useGetJuspayId();
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.pharmaMerchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {}
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'Transactions and Payments'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderCards = () => {
    return (
      <View>
        <View style={{ marginTop: 16 }}>
          <ListCard
            title={'My Transactions'}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MyPaymentsScreen, {
                patientId: patientId,
                fromNotification: fromNotification,
              })
            }
            titleStyle={styles.titleStyle}
          />
        </View>
        <View style={{ marginTop: 16 }}>
          <ListCard
            title={'Manage Payments'}
            onPress={() =>
              props.navigation.navigate(AppRoutes.ManagePayments, { customerId: cusId })
            }
            titleStyle={styles.titleStyle}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderCards()}
        {!hyperSdkInitialized && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    borderBottomWidth: 0,
  },
  titleStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    color: '#01475B',
    letterSpacing: 0.5,
  },
});
