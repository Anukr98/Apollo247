import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  BackHandler,
  ImageBackground,
  Text,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  Failure,
  Pending,
  PaymentSuccess,
  SavingsBlast,
  CircleLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
const windowWidth = Dimensions.get('window').width;

export interface PaymentStatusProps {
  status: string;
  amount: number;
  orderInfo: any;
  savings: number;
  PaymentMethod?: any;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = (props) => {
  const { status, amount, orderInfo, savings, PaymentMethod } = props;
  console.log('orderInfo >>', orderInfo);

  const renderStatusCard = () => {
    return (
      <ImageBackground
        source={require('@aph/mobile-patients/src/components/ui/icons/Status.webp')}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <PaymentSuccess style={styles.statusIconStyles} />
        <Text style={styles.status}>Payment Successful</Text>
        <Text style={styles.orderMsg}>{`Your order of ₹${amount} is placed`}</Text>
        {renderCircleSavings()}
        {renderAmountToPay()}
      </ImageBackground>
    );
  };

  const renderAmountToPay = () => {
    return orderInfo?.paymentMethod == 'COD' || PaymentMethod == 'COD' ? (
      <Text style={styles.toPay}>
        {`Amount to be paid via cash : `}
        <Text style={styles.cash}>₹{amount}</Text>
      </Text>
    ) : null;
  };

  const renderCircleSavings = () => {
    // const savings = orderInfo?.planPurchaseDetails?.totalCashBack;
    return savings ? (
      <View style={styles.circleSavings}>
        <CircleLogo style={styles.circleLogo} />
        <Text style={styles.savings}>
          You <Text style={styles.savingsAmt}>saved ₹{savings}</Text> on your purchase
        </Text>
        <SavingsBlast style={styles.savingsBlast} />
      </View>
    ) : null;
  };

  return <View>{renderStatusCard()}</View>;
};

const styles = StyleSheet.create({
  imageBackground: {
    width: windowWidth,
    height: 0.66 * windowWidth,
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  statusIconStyles: {
    height: 48,
    width: 48,
  },
  status: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 12,
  },
  orderMsg: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 4,
  },
  toPay: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#01475B',
    borderWidth: 1,
    paddingVertical: 8,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderColor: '#00B38E',
    borderStyle: 'dashed',
    width: windowWidth - 32,
    textAlign: 'center',
  },
  cash: {
    ...theme.fonts.IBMPlexSansBold(12),
  },
  savings: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#01475B',
    marginHorizontal: 4,
  },
  savingsAmt: {
    color: '#00B38E',
  },
  savingsBlast: {
    height: 20,
    width: 20,
  },
  circleLogo: {
    height: 20,
    width: 31,
  },
  circleSavings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
});
