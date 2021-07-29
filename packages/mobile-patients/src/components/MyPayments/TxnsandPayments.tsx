import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export interface TxnsandPaymentsProps extends NavigationScreenProps {}

export const TxnsandPayments: React.FC<TxnsandPaymentsProps> = (props) => {
  const patientId = props.navigation.getParam('patientId');
  const fromNotification = props.navigation.getParam('fromNotification');

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
            onPress={() => props.navigation.navigate(AppRoutes.ManagePayments)}
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
