import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { Success, Failure, Pending } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { getTxnStatus } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GET_TRANSACTION_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultPaymentStatusProps extends NavigationScreenProps {}

export const ConsultPaymentStatus: React.FC<ConsultPaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('');
  const [displayId, setdisplayId] = useState<String>('');
  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const doctorName = props.navigation.getParam('doctorName');
  const appointmentDateTime = new Date(props.navigation.getParam('appointmentDateTime'));
  const appointmentType = props.navigation.getParam('appointmentType');
  const { showAphAlert } = useUIElements();
  const client = useApolloClient();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    // getTxnStatus(orderId)
    client
      .query({
        query: GET_TRANSACTION_STATUS,
        variables: {
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        console.log(res.data.paymentTransactionStatus.appointment);
        setrefNo(res.data.paymentTransactionStatus.appointment.bankTxnId);
        setStatus(res.data.paymentTransactionStatus.appointment.paymentStatus);
        setdisplayId(res.data.paymentTransactionStatus.appointment.displayId);
        setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingTxnStutus', error);
        console.log(error);
        props.navigation.navigate(AppRoutes.DoctorSearch);
        renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    props.navigation.navigate(AppRoutes.ConsultRoom);
    return true;
  };

  const statusIcon = () => {
    if (status == string.Payment.success) {
      return <Success style={{ height: 45, width: 45 }} />;
    } else if (status == string.Payment.failure) {
      return <Failure style={{ height: 45, width: 45 }} />;
    } else {
      return <Pending style={{ height: 45, width: 45 }} />;
    }
  };

  const statusCardColour = () => {
    if (status == string.Payment.success) {
      return '#edf7ed';
    } else if (status == string.Payment.failure) {
      return '#edc6c2';
    } else {
      return '#eed9c6';
    }
  };

  const statusText = () => {
    if (status == string.Payment.success) {
      return (
        <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.SUCCESS_TEXT, 1, 20) }}>
          PAYMENT SUCCESSFUL
        </Text>
      );
    } else if (status == string.Payment.failure) {
      return (
        <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.FAILURE_TEXT, 1, 20) }}>
          PAYMENT FAILED
        </Text>
      );
    } else {
      return (
        <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.PENDING_TEXT, 1, 20) }}>
          PAYMENT PENDING
        </Text>
      );
    }
  };

  const renderStatusCard = () => {
    return (
      <View
        style={{
          ...styles.statusCard,
          backgroundColor: statusCardColour(),
        }}
      >
        <View
          style={{ flex: 0.24, marginVertical: 18, justifyContent: 'center', alignItems: 'center' }}
        >
          {statusIcon()}
        </View>
        <View
          style={{
            flex: 0.15,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {statusText()}
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, '#666666', 1, 20) }}>Rs. {price}</Text>
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 13, '#666666', 1, 20) }}>
            Ref. Number : {refNo != '' && refNo != null ? refNo : '--'}
          </Text>
        </View>
        <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text style={{ ...theme.viewStyles.text('SB', 13, '#666666', 1, 20) }}>
            Order ID : {displayId}
          </Text>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeader}>
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b', 1, 20) }}>
          BOOKING DETAILS
        </Text>
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View style={styles.appointmentCard}>
        <View style={{ flex: 0.5, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b', 1, 20) }}>
              Date & Time of Appointment
            </Text>
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, '#6d7278', 1, 20) }}>
              {appointmentDateTime.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={{ flex: 0.5, flexDirection: 'row' }}>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
              <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b', 1, 20) }}>
                Doctor Name
              </Text>
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              <Text style={{ ...theme.viewStyles.text('SB', 13, '#6d7278', 1, 20) }}>
                {doctorName}
              </Text>
            </View>
          </View>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
              <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b', 1, 20) }}>
                Mode of Consult
              </Text>
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              <Text style={{ ...theme.viewStyles.text('SB', 13, '#6d7278', 1, 20) }}>
                {appointmentType}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    if (status == string.Payment.failure) {
      return (
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, '#666666', 1, 20),
            marginHorizontal: 0.1 * windowWidth,
          }}
          numberOfLines={2}
        >
          Note : In case your account has been debited, you should get the refund in 1-7 working
          days.
        </Text>
      );
    } else if (status != string.Payment.success && status != string.Payment.failure) {
      return (
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, '#666666', 1, 20),
            marginHorizontal: 0.1 * windowWidth,
          }}
          numberOfLines={4}
        >
          Note : Your payment is in progress and this may take a couple of minutes to confirm your
          booking. We’ll intimate you once your bank confirms the payment.
        </Text>
      );
    }
  };

  const getButtonText = () => {
    if (status == string.Payment.success) {
      return 'START CONSULTATION';
    } else if (status == string.Payment.failure) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = () => {
    if (status == string.Payment.success) {
      props.navigation.navigate('APPOINTMENTS');
    } else if (status == string.Payment.failure) {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    } else {
      props.navigation.navigate(AppRoutes.ConsultRoom);
    }
  };

  const renderButton = () => {
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => {
          handleButton();
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />

      {!loading ? (
        <ScrollView style={styles.container}>
          {renderStatusCard()}
          {appointmentHeader()}
          {appointmentCard()}
          {renderNote()}
          {renderButton()}
        </ScrollView>
      ) : (
        <Spinner />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  statusCard: {
    height: 0.27 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  appointmentCard: {
    height: 0.23 * windowHeight,
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  appointmentHeader: {
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
});
