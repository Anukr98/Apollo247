import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  NavState,
  SafeAreaView,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  getNetStatus,
  g,
  handleGraphQlError,
  postWebEngageEvent,
  callPermissions,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import { BOOK_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  DoctorType,
  AppointmentType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Axios from 'axios';
import {
  CommonLogEvent,
  CommonScreenLog,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultCheckoutProps extends NavigationScreenProps {}

export const ConsultCheckout: React.FC<ConsultCheckoutProps> = (props) => {
  const client = useApolloClient();
  const doctor = props.navigation.getParam('doctor');
  const tabs =
    doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];
  const selectedTab = props.navigation.getParam('selectedTab');
  const appointmentInput = props.navigation.getParam('appointmentInput');
  const price = props.navigation.getParam('price');
  // const appointmentId = props.navigation.getParam('appointmentId');
  const doctorName = props.navigation.getParam('doctorName');
  const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [loading, setLoading] = useState(true);

 

  const [bankOptions, setbankOptions] = useState([
    {
      name: 'SBI',
      imagePath: require('../ui/icons/sbi.png'),
      paymentMode: 'NB',
      bankCode: 'ASBI',
    },
    {
      name: 'HDFC',
      imagePath: require('../ui/icons/hdfc.png'),
      paymentMode: 'NB',
      bankCode: 'HDFC',
    },
    {
      name: 'ICICI',
      imagePath: require('../ui/icons/icici.png'),
      paymentMode: 'NB',
      bankCode: 'ICICI',
    },
    {
      name: 'AXIS',
      imagePath: require('../ui/icons/axis.png'),
      paymentMode: 'NB',
      bankCode: 'AXIS',
    },
  ]);

  type paymentOptions = {
    name: string;
    paymentMode: string;
    enabled: boolean;
    seq: number;
  };

  const [paymentOptions, setpaymentOptions] = useState<paymentOptions[]>([
   
  ]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    fetchPaymentOptions();
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const fetchPaymentOptions = () => {
    const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
    const url = `${baseUrl}/list-of-payment-methods`;

    Axios.get(url)
      .then((data: any) => {
        console.log(JSON.stringify(data), 'objobj');
        setLoading(false);
        let options: paymentOptions[] = [];
        data.forEach((item: any) => {
          if (item && item.enabled && item.paymentMode != 'NB') {
            options.push(item);
          } else if (item && item.enabled && item.paymentMode == 'NB') {
            setbankOptions(item.banksList);
          }
        });
        options.sort((a, b) => {
          return a.seq - b.seq;
        });
        setpaymentOptions(options);
      })
      .catch((error) => {
        CommonBugFender('fetchingPaymentOptions', error);
        console.log(error);
      });
  };

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    console.log(localTimeSlot.format('DD-MM-YYY, hh:mm A'));

    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName')!,
      specialisation: g(doctor, 'specialty', 'userFriendlyNomenclature')!,
      category: g(doctor, 'doctorType')!, // send doctorType
      time: localTimeSlot.format('DD-MM-YYY, hh:mm A'),
      consultType: tabs[0].title === selectedTab ? 'online' : 'clinic',
      'clinic name': g(doctor, 'doctorHospital', '0' as any, 'facility', 'name')!,
      'clinic address':
        doctorClinics.length > 0 && doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}${doctorClinics[0].facility.name ? ', ' : ''}${
              doctorClinics[0].facility.city
            }`
          : '',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': id,
    };
    return eventAttributes;
  };

  const initiatePayment = (item) => {
    setLoading(true);
    client
      .mutate<bookAppointment>({
        mutation: BOOK_APPOINTMENT,
        variables: {
          bookAppointment: appointmentInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        const apptmt = g(data, 'data', 'bookAppointment', 'appointment');

        !item.bankCode
          ? props.navigation.navigate(AppRoutes.ConsultPaymentnew, {
              doctorName: doctorName,
              appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
              price: price,
              paymentTypeID: item.paymentMode,
              appointmentInput: appointmentInput,
              webEngageEventAttributes: getConsultationBookedEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
            })
          : props.navigation.navigate(AppRoutes.ConsultPaymentnew, {
              doctorName: doctorName,
              appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
              price: price,
              paymentTypeID: item.paymentMode,
              appointmentInput: appointmentInput,
              bankCode: item.bankCode,
              webEngageEventAttributes: getConsultationBookedEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
            });
      });
  };

  const rendertotalAmount = () => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          width: 0.9 * windowWidth,
          height: 0.07 * windowHeight,
          borderRadius: 9,
          backgroundColor: 'rgba(0, 135, 186, 0.15)',
          margin: 0.05 * windowWidth,
        }}
      >
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            marginLeft: 0.02 * windowWidth,
          }}
        >
          <Text style={styles.amounttoPay}> Amount To Pay</Text>
        </View>
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginRight: 0.06 * windowWidth,
          }}
        >
          <Text style={styles.totalAmount}> Rs. {price}</Text>
        </View>
      </View>
    );
  };

  const renderPaymentOptions = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Text style={styles.paymentMode}> PAY NOW </Text>
        </View>
        <View
          style={{
            width: 0.9 * windowWidth,
            height: 1,
            backgroundColor: 'rgba(2, 71, 91, 0.2)',
            margin: 0.05 * windowWidth,
            marginTop: 0.01 * windowWidth,
            marginBottom: 0.03 * windowWidth,
          }}
        ></View>
        <FlatList
          data={paymentOptions}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                initiatePayment(item);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                width: 0.9 * windowWidth,
                height: 0.08 * windowHeight,
                borderRadius: 9,
                backgroundColor: '#fff',
                margin: 0.05 * windowWidth,
                marginTop: 0,
              }}
            >
              <View
                style={{
                  flex: 0.16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image source={item.imagePath} style={{ width: 30, height: 30 }} />
              </View>
              <View
                style={{
                  flex: 0.84,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Text style={styles.payNow}> {item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    );
  };

  const renderNetBanking = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Text style={styles.paymentMode}> NET BANKING </Text>
        </View>
        <View
          style={{
            width: 0.9 * windowWidth,
            height: 1,
            backgroundColor: 'rgba(2, 71, 91, 0.2)',
            margin: 0.05 * windowWidth,
            marginTop: 0.01 * windowWidth,
            marginBottom: 0.03 * windowWidth,
          }}
        ></View>
        <View
          style={{
            flex: 1,
            width: 0.9 * windowWidth,
            height: 0.23 * windowHeight,
            borderRadius: 9,
            backgroundColor: '#fff',
            margin: 0.05 * windowWidth,
            marginTop: 0,
          }}
        >
          <View style={{ flex: 0.65, flexDirection: 'row' }}>
            <FlatList
              data={bankOptions}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    initiatePayment(item);
                  }}
                  style={{ width: 0.225 * windowWidth, flex: 1 }}
                >
                  <View
                    style={{
                      flex: 0.8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image source={item.imagePath} style={{ width: 40, height: 40 }} />
                  </View>
                  <View
                    style={{
                      flex: 0.2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={styles.bankName}> {item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
          </View>
          <View style={{ flex: 0.35, flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                flex: 0.25,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBack);
          props.navigation.navigate(AppRoutes.DoctorSearch);
        },
      },
    ]);
    return true;
  };

  const renderLoading = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.9 }}>
        <ActivityIndicator size="large" color="#01475b" />
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
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
          <Text style={styles.Payment}> PAYMENT </Text>
        </View>
        {/* <Header
          title="PAYMENT"
          leftText={{
            isBack: false,
            title: 'Cancel',
            onPress: handleBack,
          }}
        /> */}
        {!loading ? (
          <ScrollView style={{ flex: 0.9 }}>
            {rendertotalAmount()}
            {renderPaymentOptions()}
            {renderNetBanking()}
          </ScrollView>
        ) : (
          renderLoading()
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  scrollView: {
    backgroundColor: '#f0f1ec',
  },

  heading: {},
  Payment: {
    fontSize: 14,
    color: '#01475b',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  paymentMode: {
    color: '#01475b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  payNow: {
    color: '#fc9916',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bankName: {
    color: '#01475b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  amounttoPay: {
    color: '#01475b',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  seeAll: {
    color: '#00b38e',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },

  totalAmount: {
    color: '#01475b',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
