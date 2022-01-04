import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  Animated,
  Platform,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  TextInput,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
const paymentProcessing =
  '@aph/mobile-patients/src/components/PaymentGateway/AnimationFiles/paymentProcessing.json';
const paymentSuccess =
  '@aph/mobile-patients/src/components/PaymentGateway/AnimationFiles/paymentSuccess.json';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GET_PAYMENT_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface PaymentAnimationsProps {
  paymentId: string;
  paymentStatus: string;
  onPaymentFailure: () => void;
  onPaymentSuccess: () => void;
  onTimeOut: () => void;
}

export const PaymentAnimations: React.FC<PaymentAnimationsProps> = (props) => {
  const { paymentStatus, onPaymentFailure, onPaymentSuccess, paymentId, onTimeOut } = props;
  const timerTime = AppConfig.Configuration.Payment_Processing_Timer;
  const [remainingTime, setremainingTime] = useState(timerTime);
  const client = useApolloClient();

  useEffect(() => {
    refetchPaymentStatus(remainingTime);
  }, [remainingTime]);

  const fetchPaymentStatus = () => {
    return client.mutate({
      mutation: GET_PAYMENT_STATUS,
      variables: { order_id: paymentId },
      fetchPolicy: 'no-cache',
    });
  };

  const refetchPaymentStatus = async (remainingTime: any) => {
    if ((timerTime - remainingTime < 10 && remainingTime % 3 == 0) || remainingTime % 5 == 0) {
      const res = await fetchPaymentStatus();
      const { data } = res;
      switch (data?.getOrderInternal?.payment_status) {
        case 'TXN_SUCCESS':
          onPaymentSuccess();
          break;
        case 'TXN_FAILURE':
          onPaymentFailure();
          break;
      }
    }
  };

  const onTimerComplete = async () => {
    const res = await fetchPaymentStatus();
    const { data } = res;
    switch (data?.getOrderInternal?.payment_status) {
      case 'PENDING':
        onTimeOut();
        break;
      case 'TXN_SUCCESS':
        onPaymentSuccess();
        break;
      case 'TXN_FAILURE':
        onPaymentFailure();
        break;
    }
  };

  const RenderTimer = () => {
    return (
      <View style={{}}>
        <CountdownCircleTimer
          onComplete={() => {
            onTimerComplete();
          }}
          isPlaying
          duration={timerTime}
          colors="#F89B2D"
          size={102}
          strokeWidth={7}
        >
          {({ remainingTime }) => {
            setremainingTime(remainingTime);
            return (
              <Animated.Text style={{ color: '#01475B', ...theme.fonts.IBMPlexSansSemiBold(18) }}>
                00:{remainingTime > 9 ? remainingTime : '0' + remainingTime}
              </Animated.Text>
            );
          }}
        </CountdownCircleTimer>
      </View>
    );
  };

  const renderProcessing = () => {
    return (
      <View style={styles.textCont}>
        {RenderTimer()}
        <Text style={styles.processing}>{'Please Wait'}</Text>
        <Text style={styles.note}>{'We are checking your payment status'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {paymentStatus == 'success' ? renderProcessing() : renderProcessing()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  processing: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 15,
  },
  note: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 18,
    color: '#01475B',
    marginTop: 6,
    textAlign: 'center',
  },
  textCont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 35,
  },
});
