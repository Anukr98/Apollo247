import {
  Alert,
  BackHandler,
  NavState,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Success, Failure, Pending } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultPaymentStatusProps extends NavigationScreenProps {}

export const ConsultPaymentStatus: React.FC<ConsultPaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('123456');
  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const doctorName = props.navigation.getParam('doctorName');
  const appointmentDateTime = new Date(props.navigation.getParam('appointmentDateTime'));
  const appointmentType = props.navigation.getParam('appointmentType');

  useEffect(() => {
    getTxnStatus();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getTxnStatus = () => {
    setLoading(false);
  };

  const handleBack = () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    props.navigation.navigate(AppRoutes.ConsultRoom);
    return true;
  };

  const statusIcon = () => {
    if (status == 'success') {
      return <Success style={{ height: 45, width: 45 }} />;
    } else if (status == 'failure') {
      return <Failure style={{ height: 45, width: 45 }} />;
    } else {
      return <Pending style={{ height: 45, width: 45 }} />;
    }
  };

  const statusCardColour = () => {
    if (status == 'success') {
      return '#edf7ed';
    } else if (status == 'failure') {
      return '#edc6c2';
    } else {
      return '#eed9c6';
    }
  };

  const statusText = () => {
    if (status == 'success') {
      return (
        <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.SUCCESS_TEXT, 1, 20) }}>
          PAYMENT SUCCESSFUL
        </Text>
      );
    } else if (status == 'failure') {
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
          height: 0.27 * windowHeight,
          margin: 0.06 * windowWidth,
          backgroundColor: statusCardColour(),
          flex: 1,
          borderRadius: 10,
          elevation: 10,
        }}
      >
        <View
          style={{ flex: 0.22, marginVertical: 18, justifyContent: 'center', alignItems: 'center' }}
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
            Ref. Number : {refNo}
          </Text>
        </View>
        <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text style={{ ...theme.viewStyles.text('SB', 13, '#666666', 1, 20) }}>
            Order ID : {orderId}
          </Text>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View
        style={{
          backgroundColor: '#eee',
          height: 0.04 * windowHeight,
          justifyContent: 'center',
          marginHorizontal: 0.06 * windowWidth,
          borderBottomWidth: 0.8,
          borderBottomColor: '#ddd',
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#01475b', 1, 20) }}>
          BOOKING DETAILS
        </Text>
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View
        style={{
          height: 0.23 * windowHeight,
          marginVertical: 0.03 * windowWidth,
          paddingLeft: 0.06 * windowWidth,
          marginHorizontal: 0.06 * windowWidth,
          backgroundColor: '#fff',
          flex: 1,
          borderRadius: 10,
          elevation: 8,
        }}
      >
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
    if (status == 'failure') {
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
    } else if (status == 'pending') {
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
    if (status == 'success') {
      return 'START CONSULTATION';
    } else if (status == 'failure') {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = () => {
    if (status == 'success') {
      props.navigation.navigate('APPOINTMENTS');
    } else if (status == 'failure') {
      props.navigation.navigate(AppRoutes.DoctorSearch);
    } else {
      props.navigation.navigate(AppRoutes.ConsultRoom);
    }
  };

  const renderButton = () => {
    return (
      <TouchableOpacity
        style={{
          height: 0.06 * windowHeight,
          backgroundColor: '#fcb716',
          marginVertical: 0.06 * windowWidth,
          marginHorizontal: 0.2 * windowWidth,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
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

  const renderLoading = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.9 }}>
        <ActivityIndicator size="large" color="#01475b" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <View
        style={{
          backgroundColor: '#FFF',
          flex: 0.1,
          justifyContent: 'center',
          alignItems: 'center',
          shadowOpacity: 5,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', left: 15 }}
          onPress={() => {
            handleBack();
          }}
        >
          <Image source={require('../ui/icons/back.png')} style={{ width: 35, height: 35 }} />
        </TouchableOpacity>
        <Text style={styles.Payment}> PAYMENT STATUS </Text>
      </View>
      {!loading ? (
        <ScrollView style={{ flex: 0.9, backgroundColor: '#f0f1ec' }}>
          {renderStatusCard()}
          {appointmentHeader()}
          {appointmentCard()}
          {renderNote()}
          {renderButton()}
        </ScrollView>
      ) : (
        renderLoading()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: '#01475b',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
});
