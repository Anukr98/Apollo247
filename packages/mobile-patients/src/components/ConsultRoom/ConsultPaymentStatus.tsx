import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {colors} from '@aph/mobile-patients/src/theme/colors';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { Success, Failure, Pending } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import {Header} from '@aph/mobile-patients/src/components/ui/Header';
import { useApolloClient } from 'react-apollo-hooks';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAppointmentPayment';
import {
  BOOK_APPOINTMENT,
  BOOK_FOLLOWUP_APPOINTMENT,
  MAKE_APPOINTMENT_PAYMENT,
  VALIDATE_CONSULT_COUPON,
} from '@aph/mobile-patients/src/graphql/profiles';
import {getTxnStatus} from '@aph/mobile-patients/src/helpers/apiCalls';
import {CommonBugFender} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {useUIElements} from '@aph/mobile-patients/src/components/UIElementsProvider';
import {Spinner} from '@aph/mobile-patients/src/components/ui/Spinner';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultPaymentStatusProps extends NavigationScreenProps { }

export const ConsultPaymentStatus: React.FC<ConsultPaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('123456');
  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const doctorName = props.navigation.getParam('doctorName');
  const appointmentDateTime = new Date(props.navigation.getParam('appointmentDateTime'));
  const appointmentType = props.navigation.getParam('appointmentType');
  const client = useApolloClient();
  const { success, failure, pending } = Payment
  const { showAphAlert } = useUIElements();

const renderErrorPopup = (desc : string) => showAphAlert !({
  title: 'Uh oh.. :(',
  description: `${desc || ''}`.trim()
});

useEffect(() => {
  getTxnStatus(orderId).then((res) => {
    console.log(res.data);
    setrefNo(res.data.TXNID);
    setStatus(res.data.STATUS);
    setLoading(false);
  }).catch((error) => {
    CommonBugFender('fetchingTxnStutus', error);
    console.log(error);
    props
      .navigation
      .navigate(AppRoutes.DoctorSearch);
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
    if (status === success) {
      return <Success style={styles.statusIconStyles} />;
    } else if (status === failure) {
      return <Failure style={styles.statusIconStyles} />;
    } else {
      return <Pending style={styles.statusIconStyles} />;
    }
  };

  const textComponent = (message: string, numOfLines:number | undefined,color:string)=>{
    return (
      <Text style={{ ...theme.viewStyles.text('SB', 13, color, 1, 20) }} numberOfLines={numOfLines}>
      {message}
        </Text>
        )
  }

  const statusCardColour = () => {
    if (status == success) {
return colors.SUCCESS;
    } else if (status == failure) {
      return colors.FAILURE;
    } else {
      return colors.PENDING;
    }
  };

  const statusText = () => {
    let message ='PAYMENT PENDING'
    let textColor = theme.colors.PENDING_TEXT
    if (status == success) {
      message =' PAYMENT SUCCESSFUL'
      textColor = theme.colors.SUCCESS_TEXT
    } else if (status == failure) {
      message =' PAYMENT FAILED'
      textColor = theme.colors.FAILURE_TEXT
    } 
    textComponent(message, undefined, textColor)
  };

  const renderStatusCard = () => {
    const refNumberText = 'Ref.No : '+String(refNo)
    const orderIdText = 'Order ID: '+String(orderId)
    const priceText = 'Rs. '+String(price)
    return (
      <View style={[styles.statusCardStyle,{ backgroundColor: statusCardColour()},]}>
        <View
          style={styles.statusCardSubContainerStyle}
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
           {statusText}
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
            {textComponent(priceText, undefined, theme.colors.SHADE_GREY)}
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
            {textComponent(refNumberText,undefined,theme.colors.SHADE_GREY)}
        </View>
        <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
          {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY)}
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle} >
           {textComponent('BOOKING DETAILS', undefined, theme.colors.ASTRONAUT_BLUE)} 
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View style={styles.appointmentCardStyle}>
        <View style={{ flex: 0.5, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
              {textComponent('Date & Time of Appointment', undefined, theme.colors.ASTRONAUT_BLUE)}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              {textComponent(appointmentDateTime.toLocaleString(), undefined, theme.colors.SHADE_CYAN_BLUE) }
          </View>
        </View>
        <View style={{ flex: 0.5, flexDirection: 'row' }}>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent('Doctor Name', undefined, theme.colors.ASTRONAUT_BLUE)}
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              {textComponent(doctorName, undefined, theme.colors.SHADE_CYAN_BLUE)}
            </View>
          </View>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
              {textComponent('Mode of Consult', undefined, theme.colors.ASTRONAUT_BLUE)}
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
                {textComponent(appointmentType, undefined, theme.colors.SHADE_CYAN_BLUE)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    if (status == failure) {
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
    } else if (status == pending) {
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
    if (status == success) {
      return 'START CONSULTATION';
    } else if (status == failure) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = () => {
    const {navigation}=props
    const {navigate}=navigation
    if (status == success) {
      navigate('APPOINTMENTS');
    } else if (status == failure) {
      navigate(AppRoutes.DoctorSearch);
    } else {
      navigate(AppRoutes.ConsultRoom);
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
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles:{
    width:45,
    height:45
  },
  statusCardStyle: {
    height: 0.27 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    elevation: 10,
  },
  statusCardSubContainerStyle: { 
    flex: 0.22, 
    marginVertical: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  appointmentCardStyle:{
    height: 0.23 * windowHeight,
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    elevation: 8,
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  }
});
