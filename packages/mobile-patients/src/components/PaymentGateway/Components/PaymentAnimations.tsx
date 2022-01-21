import React, { useEffect, useState, useRef } from 'react';
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
import Animation from 'lottie-react-native';
const paymentProcessing =
  '@aph/mobile-patients/src/components/PaymentGateway/AnimationFiles/Animation_1/paymentProcessing.json';
const paymentSuccess =
  '@aph/mobile-patients/src/components/PaymentGateway/AnimationFiles/Animation_2/tick.json';

import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GET_PAYMENT_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

const { height, width } = Dimensions.get('window');
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
  const timerVal = useRef(timerTime);
  const [remainingTime, setremainingTime] = useState(timerTime);
  const client = useApolloClient();
  let interval: any;

  useEffect(() => {
    interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, []);

  const tick = () => {
    if (timerVal.current > 1) {
      timerVal.current -= 1;
      setremainingTime(timerVal.current);
    } else if (timerVal.current == 1) {
      timerVal.current = 0;
      setremainingTime(0);
      onTimerComplete();
      clearInterval(interval);
    }
  };

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

  const renderProcessingAnimation = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', marginTop: 125 }}>
        <LottieView
          source={require(paymentProcessing)}
          autoPlay
          loop={true}
          autoSize={true}
          style={{ width: 250, marginBottom: 40 }}
          imageAssetsFolder={'lottie/animation_1/images'}
        />
        <Text>
          <Animated.Text style={styles.timer}>
            00:{remainingTime > 9 ? remainingTime : '0' + remainingTime}
          </Animated.Text>
        </Text>
        <Text style={styles.wait}>{'Please Wait'}</Text>
        <Text style={styles.status}>We are checking your payment status</Text>
      </View>
    );
  };

  return <View style={styles.container}>{renderProcessingAnimation()}</View>;
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
  timer: {
    ...theme.fonts.IBMPlexSansBold(20),
    color: '#0087BA',
    textAlign: 'center',
  },
  wait: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#01475B',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  status: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#01475B',
    marginTop: 2,
  },
});
