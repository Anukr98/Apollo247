import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Failure, Pending, Success } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CONSULT_ORDER_INVOICE,
  GET_APPOINTMENT_DATA,
  GET_TRANSACTION_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string, { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '../../graphql/types/getAppointmentData';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import { FirebaseEventName } from '../../helpers/firebaseEvents';
import firebase from 'react-native-firebase';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultPaymentStatusProps extends NavigationScreenProps {}

export const ConsultPaymentStatus: React.FC<ConsultPaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('');
  const [displayId, setdisplayId] = useState<String>('');
  const [paymentRefId, setpaymentRefId] = useState<string>('');
  const price = props.navigation.getParam('price');
  const orderId = props.navigation.getParam('orderId');
  const doctorName = props.navigation.getParam('doctorName');
  const doctorID = props.navigation.getParam('doctorID');
  const appointmentDateTime = props.navigation.getParam('appointmentDateTime');
  const appointmentType = props.navigation.getParam('appointmentType');
  const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  const fireBaseEventAttributes = props.navigation.getParam('fireBaseEventAttributes');
  const client = useApolloClient();
  const { success, failure, pending } = Payment;
  const { showAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [notificationAlert, setNotificationAlert] = useState(false);

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
        try {
          const paymentEventAttributes = {
            Payment_Status: res.data.paymentTransactionStatus.appointment.paymentStatus,
            Type: 'Consultation',
            Appointment_Id: orderId,
          };
          postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
          postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, paymentEventAttributes);
        } catch (error) {}
        console.log(res.data);
        if (res.data.paymentTransactionStatus.appointment.paymentStatus == success) {
          try {
            postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, webEngageEventAttributes);
            postAppsFlyerEvent(AppsFlyerEventName.CONSULTATION_BOOKED, webEngageEventAttributes);
            postFirebaseEvent(FirebaseEventName.CONSULTATION_BOOKED, fireBaseEventAttributes);
          } catch (error) {}
        }
        setrefNo(res.data.paymentTransactionStatus.appointment.bankTxnId);
        setStatus(res.data.paymentTransactionStatus.appointment.paymentStatus);
        setdisplayId(res.data.paymentTransactionStatus.appointment.displayId);
        setpaymentRefId(res.data.paymentTransactionStatus.appointment.paymentRefId);
        setLoading(false);
        fireBaseFCM();
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

  const fireBaseFCM = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      console.log('enabled', enabled);
    } else {
      // user doesn't have permission
      console.log('not enabled');
      setNotificationAlert(true);
      try {
        const authorized = await firebase.messaging().requestPermission();
        console.log('authorized', authorized);

        // User has authorised
      } catch (error) {
        // User has rejected permissions
        CommonBugFender('Login_fireBaseFCM_try', error);
        console.log('not enabled error', error);
      }
    }
  };

  const requestStoragePermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
        console.log(resuts);
        downloadInvoice();
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_requestReadSmsPermission_try', error);
      console.log('error', error);
    }
  };

  const handleBack = () => {
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

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
        selectable={true}
      >
        {message}
      </Text>
    );
  };

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
    let message = 'PAYMENT PENDING';
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      message = ' PAYMENT SUCCESSFUL';
      textColor = theme.colors.SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' PAYMENT FAILED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return textComponent(message, undefined, textColor, false);
  };

  const renderViewInvoice = () => {
    if (status === success) {
      return (
        <TouchableOpacity
          style={{ justifyContent: 'flex-end' }}
          onPress={() => {
            requestStoragePermission();
          }}
        >
          {textComponent('VIEW INVOICE', undefined, theme.colors.APP_YELLOW, false)}
        </TouchableOpacity>
      );
    }
  };

  const downloadInvoice = () => {
    console.log('-------------', currentPatient.id, orderId);
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient.id,
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        console.log('-------------', res);
        const { data } = res;
        const { getOrderInvoice } = data;
        let dirs = RNFetchBlob.fs.dirs;
        let fileName: string = 'Apollo_Consult_Invoice' + String(new Date()) + '.pdf';
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) +
              '/' +
              (fileName || 'Apollo_Consult_Invoice.pdf')
            : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: fileName,
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {
            //some headers ..
          })
          .then((res) => {
            console.log('invoiceURL-->', res);
            if (Platform.OS === 'android') {
              Alert.alert('Download Complete');
            }
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {
            CommonBugFender('ConsultView_downloadInvoice', err);
            console.log('error ', err);
          });
      })
      .catch((error) => {
        // props.navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
  };
  const renderStatusCard = () => {
    const refNumberText = String(paymentRefId != '' && paymentRefId != null ? paymentRefId : '--');
    const orderIdText = 'Order ID: ' + String(displayId);
    const priceText = 'Rs. ' + String(price);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View style={styles.statusCardSubContainerStyle}>{statusIcon()}</View>
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
            flex: 0.12,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(priceText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View
          style={{
            flex: 0.12,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View style={{ flex: 0.39, justifyContent: 'flex-start', alignItems: 'center' }}>
          <View style={{ flex: 0.6, justifyContent: 'flex-start', alignItems: 'center' }}>
            {textComponent('Payment Ref. Number - ', undefined, theme.colors.SHADE_GREY, false)}
            {textComponent(refNumberText, undefined, theme.colors.SHADE_GREY, false)}
          </View>
          <View style={{ flex: 0.4, justifyContent: 'flex-start', alignItems: 'center' }}>
            {renderViewInvoice()}
          </View>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent('BOOKING DETAILS', undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View style={styles.appointmentCardStyle}>
        <View style={{ flex: 0.5, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent(
              'Date & Time of Appointment',
              undefined,
              theme.colors.ASTRONAUT_BLUE,
              false
            )}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            {textComponent(
              // appointmentDateTime.toDateString() + '  ' + appointmentDateTime.toLocaleTimeString(),
              getDate(appointmentDateTime),
              undefined,
              theme.colors.SHADE_CYAN_BLUE,
              false
            )}
          </View>
        </View>
        <View style={{ flex: 0.5, flexDirection: 'row' }}>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
              {textComponent('Doctor Name', undefined, theme.colors.ASTRONAUT_BLUE, false)}
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              {textComponent(doctorName, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
            </View>
          </View>
          <View style={{ flex: 0.5 }}>
            <View style={{ flex: 0.4, justifyContent: 'center' }}>
              {textComponent('Mode of Consult', undefined, theme.colors.ASTRONAUT_BLUE, false)}
            </View>
            <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
              {textComponent(appointmentType, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 1-7 working days.';
    } else if (status != success && status != failure) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (status == success) {
      return 'Fill Medical Details';
    } else if (status == failure) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = () => {
    const { navigation } = props;
    const { navigate } = navigation;
    if (status == success) {
      getAppointmentInfo();
    } else if (status == failure) {
      // navigate(AppRoutes.DoctorSearch);
      setLoading(true);
      navigate(AppRoutes.DoctorDetails, {
        doctorId: doctorID,
      });
    } else {
      navigate(AppRoutes.ConsultRoom);
    }
  };

  const getAppointmentInfo = () => {
    setShowSpinner && setShowSpinner(true);

    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        try {
          setShowSpinner && setShowSpinner(false);

          console.log(
            'GetDoctorNextAvailableSlot',
            _data.data.getAppointmentData!.appointmentsHistory
          );
          const appointmentData = _data.data.getAppointmentData!.appointmentsHistory;
          if (appointmentData) {
            try {
              if (appointmentData[0]!.doctorInfo !== null) {
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: appointmentData[0],
                  callType: '',
                  prescription: '',
                });
              }
            } catch (error) {}
          }
        } catch (error) {
          setShowSpinner && setShowSpinner(false);
          props.navigation.navigate('APPOINTMENTS');
        }
      })
      .catch((e) => {
        console.log('Error occured while GetDoctorNextAvailableSlot', { e });
        setShowSpinner && setShowSpinner(false);
        props.navigation.navigate('APPOINTMENTS');
      });
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
      {showSpinner && <Spinner />}
      {notificationAlert && (
        <NotificationPermissionAlert onPressOutside={() => setNotificationAlert(false)} />
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
  statusIconStyles: {
    width: 45,
    height: 45,
  },
  statusCardStyle: {
    height: 0.32 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    flex: 0.22,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCardStyle: {
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
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
