import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
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
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  g,
  postFirebaseEvent,
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useApolloClient } from 'react-apollo-hooks';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import { BOOK_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';
import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { fetchPaymentOptions } from '@aph/mobile-patients/src/helpers/apiCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { FirebaseEvents, FirebaseEventName } from '../../helpers/firebaseEvents';
import {
  postWebEngageEvent,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import { saveSearchDoctor, saveSearchSpeciality } from '../../helpers/clientCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface ConsultCheckoutProps extends NavigationScreenProps {}

export const ConsultCheckout: React.FC<ConsultCheckoutProps> = (props) => {
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const client = useApolloClient();
  const doctor = props.navigation.getParam('doctor');
  const tabs =
    doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];
  const selectedTab = props.navigation.getParam('selectedTab');
  const appointmentInput = props.navigation.getParam('appointmentInput');
  const price = props.navigation.getParam('price');
  const doctorName = props.navigation.getParam('doctorName');
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setLoading] = useState(true);
  const { showAphAlert } = useUIElements();
  const couponApplied = props.navigation.getParam('couponApplied');
  const callSaveSearch = props.navigation.getParam('callSaveSearch');
  const patientId = props.navigation.getParam('patientId');
  const planSelected = props.navigation.getParam('planSelected');
  const isDoctorsOfTheHourStatus = props.navigation.getParam('isDoctorsOfTheHourStatus');
  const circleDiscountedPrice = props.navigation.getParam('circleDiscount');

  type bankOptions = {
    name: string;
    paymentMode: string;
    bankCode: string;
    seq: number;
    enabled: boolean;
    imageUrl: string;
  };
  const [bankOptions, setbankOptions] = useState<bankOptions[]>([]);

  type paymentOptions = {
    name: string;
    paymentMode: string;
    enabled: boolean;
    seq: number;
    imageUrl: string;
  };
  const [paymentOptions, setpaymentOptions] = useState<paymentOptions[]>([]);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    fetchPaymentOptions()
      .then((res: any) => {
        console.log(JSON.stringify(res), 'objobj');
        let options: paymentOptions[] = [];
        res.data.forEach((item: any) => {
          if (item && item.enabled && item.paymentMode != 'NB') {
            options.push(item);
          } else if (item && item.enabled && item.paymentMode == 'NB') {
            let bankList: bankOptions[] = [];
            let bankOptions: bankOptions[] = item.banksList;
            bankOptions.forEach((item) => {
              if (item.enabled) {
                item.paymentMode = 'NB';
                bankList.push(item);
              }
            });
            if (bankList.length > 0) {
              bankList.sort((a, b) => {
                return a.seq - b.seq;
              });
              setbankOptions(bankList);
            } else {
              delete item.banksList;
              options.push(item);
            }
          }
        });
        options.sort((a, b) => {
          return a.seq - b.seq;
        });
        setpaymentOptions(options);
        setLoading && setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingPaymentOptions', error);
        console.log(error);
        props.navigation.navigate(AppRoutes.DoctorSearch);
        renderErrorPopup(string.common.tryAgainLater);
      });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getConsultationBookedEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    console.log(localTimeSlot.format('DD MMM YYYY, h:mm A'));
    let date = moment(time).toDate();
    // date = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName'),
      specialisation: g(doctor, 'specialty', 'name'),
      category: g(doctor, 'doctorType'), // send doctorType
      // time: localTimeSlot.format('DD-MM-YYY, hh:mm A'),
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Consult ID': id,
      'Speciality ID': g(doctor, 'specialty', 'id'),
      'Consult Date Time': date,
      'Consult Mode': tabs[0].title === selectedTab ? 'Online' : 'Physical',
      'Hospital Name':
        doctorClinics.length > 0 && doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}`
          : '',
      'Hospital City':
        doctorClinics.length > 0 && doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.city}`
          : '',
      'Doctor ID': g(doctor, 'id')!,
      'Doctor Name': g(doctor, 'fullName')!,
      'Net Amount': price,
      af_revenue: price,
      af_currency: 'INR',
      'Dr of hour appointment': !!isDoctorsOfTheHourStatus ? 'Yes' : 'No',
      'Circle discount': circleDiscountedPrice,
      User_Type: getUserType(currentPatient),
    };
    return eventAttributes;
  };

  const getConsultationBookedAppsFlyerEventAttributes = (id: string, displayId: number) => {
    const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULTATION_BOOKED] = {
      'customer id': g(currentPatient, 'id'),
      'doctor id': g(doctor, 'id')!,
      'specialty id': g(doctor, 'specialty', 'id')!,
      'consult type': 'Consult Online' === selectedTab ? 'online' : 'clinic',
      af_revenue: price,
      af_currency: 'INR',
      'consult id': id,
      displayId: `${displayId}`,
      'coupon applied': couponApplied,
      'Circle discount': circleDiscountedPrice,
    };
    return eventAttributes;
  };

  const getConsultationBookedFirebaseEventAttributes = (time: string, id: string) => {
    const localTimeSlot = moment(new Date(time));
    console.log(localTimeSlot.format('DD-MM-YYY, hh:mm A'));

    const doctorClinics = (g(doctor, 'doctorHospital') || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: FirebaseEvents[FirebaseEventName.CONSULTATION_BOOKED] = {
      name: g(doctor, 'fullName')!,
      specialisation: g(doctor, 'specialty', 'userFriendlyNomenclature')!,
      category: g(doctor, 'doctorType')!, // send doctorType
      time: localTimeSlot.format('DD-MM-YYY, hh:mm A'),
      consultType: tabs[0].title === selectedTab ? 'online' : 'clinic',
      clinic_name: g(doctor, 'doctorHospital', '0' as any, 'facility', 'name')!,
      clinic_address:
        doctorClinics.length > 0 && doctor!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}${doctorClinics[0].facility.name ? ', ' : ''}${
              doctorClinics[0].facility.city
            }`
          : '',
      Patient_Name: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      Patient_UHID: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      Mobile_Number: g(currentPatient, 'mobileNumber'),
      Customer_ID: g(currentPatient, 'id'),
      Consult_ID: id,
      af_revenue: price,
      af_currency: 'INR',
      'Circle discount': circleDiscountedPrice,
    };
    return eventAttributes;
  };

  const initiatePayment = (item) => {
    console.log('appointmentInput---------------', appointmentInput);
    setLoading && setLoading(true);
    client
      .mutate<bookAppointment>({
        mutation: BOOK_APPOINTMENT,
        variables: {
          bookAppointment: appointmentInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        console.log(JSON.stringify(data));
        try {
          if (callSaveSearch !== 'true') {
            saveSearchDoctor(client, doctor ? doctor.id : '', patientId);

            saveSearchSpeciality(
              client,
              doctor && doctor.specialty && doctor.specialty.id,
              patientId
            );
          }
          const paymentEventAttributes = {
            Payment_Mode: item.paymentMode,
            LOB: 'Consultation',
            Appointment_Id: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
            Mobile_Number: g(currentPatient, 'mobileNumber'),
          };
          postWebEngageEvent(WebEngageEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
          postFirebaseEvent(FirebaseEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
          postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
          const paymentModeEventAttribute: WebEngageEvents[WebEngageEventName.CONSULT_PAYMENT_MODE_SELECTED] = {
            'Payment Mode': item.paymentMode,
            User_Type: getUserType(currentPatient),
          };
          postWebEngageEvent(
            WebEngageEventName.CONSULT_PAYMENT_MODE_SELECTED,
            paymentModeEventAttribute
          );
        } catch (error) {}
        const apptmt = g(data, 'data', 'bookAppointment', 'appointment');

        !item.bankCode
          ? props.navigation.navigate(AppRoutes.ConsultPaymentnew, {
              consultedWithDoctorBefore: consultedWithDoctorBefore,
              doctorName: doctorName,
              doctorID: doctor.id,
              doctor: doctor,
              appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
              price: price,
              paymentTypeID: item.paymentMode,
              appointmentInput: appointmentInput,
              webEngageEventAttributes: getConsultationBookedEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
              appsflyerEventAttributes: getConsultationBookedAppsFlyerEventAttributes(
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!,
                g(data, 'data', 'bookAppointment', 'appointment', 'displayId')!
              ),
              fireBaseEventAttributes: getConsultationBookedFirebaseEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
              planSelected: planSelected,
              isDoctorsOfTheHourStatus,
              selectedTab,
            })
          : props.navigation.navigate(AppRoutes.ConsultPaymentnew, {
              consultedWithDoctorBefore: consultedWithDoctorBefore,
              doctorName: doctorName,
              doctorID: doctor.id,
              doctor: doctor,
              appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
              price: price,
              paymentTypeID: item.paymentMode,
              appointmentInput: appointmentInput,
              bankCode: item.bankCode,
              webEngageEventAttributes: getConsultationBookedEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
              appsflyerEventAttributes: getConsultationBookedAppsFlyerEventAttributes(
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
              fireBaseEventAttributes: getConsultationBookedFirebaseEventAttributes(
                g(apptmt, 'appointmentDateTime'),
                g(data, 'data', 'bookAppointment', 'appointment', 'id')!
              ),
              planSelected: planSelected,
              isDoctorsOfTheHourStatus,
              selectedTab,
            });
        setLoading && setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
        setLoading && setLoading(false);
        let message = '';
        try {
          message = error.message.split(':')[1].trim();
        } catch (error) {
          CommonBugFender('ConsultOverlay_onSubmitBookAppointment_try', error);
        }
        if (message == 'APPOINTMENT_EXIST_ERROR') {
          props.navigation.navigate(AppRoutes.DoctorSearch);
          renderErrorPopup(
            `Oops ! The selected slot is unavailable. Please choose a different one`
          );
        } else if (message === 'BOOKING_LIMIT_EXCEEDED') {
          props.navigation.navigate(AppRoutes.DoctorSearch);
          renderErrorPopup(
            `Sorry! You have cancelled 3 appointments with this doctor in past 7 days, please try later or choose another doctor.`
          );
        } else if (
          message === 'OUT_OF_CONSULT_HOURS' ||
          message === 'DOCTOR_SLOT_BLOCKED' ||
          message === 'APPOINTMENT_BOOK_DATE_ERROR'
        ) {
          renderErrorPopup(
            `Slot you are trying to book is no longer available. Please try a different slot.`
          );
        } else {
          props.navigation.navigate(AppRoutes.DoctorSearch);
          renderErrorPopup(`Something went wrong.${message ? ` Error Code: ${message}.` : ''}`);
        }
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
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            {' '}
            Amount To Pay
          </Text>
        </View>
        <View
          style={{
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginRight: 0.06 * windowWidth,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE, 1, 20) }}>
            {string.common.Rs} {convertNumberToDecimal(price)}
          </Text>
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
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            PAY VIA
          </Text>
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
              style={styles.paymentModeCard}
            >
              <View
                style={{
                  flex: 0.16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: 30, height: 30 }} />
              </View>
              <View
                style={{
                  flex: 0.84,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  style={{ ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 20) }}
                >
                  {' '}
                  {item.name}
                </Text>
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
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            NET BANKING
          </Text>
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
        <View style={styles.netBankingCard}>
          <View style={{ flex: 0.65, flexDirection: 'row' }}>
            <FlatList
              data={bankOptions.slice(0, 4)}
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
                      flex: 0.65,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={{ width: 40, height: 40 }} />
                  </View>
                  <View
                    style={{
                      flex: 0.35,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20),
                      }}
                    >
                      {' '}
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
          </View>
          <View style={{ flex: 0.35, flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                flex: 0.3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                initiatePayment({ paymentMode: 'NB' });
              }}
            >
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 14, theme.colors.SEARCH_UNDERLINE_COLOR, 1, 20),
                }}
              >
                See All
              </Text>
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
          props.navigation.goBack();
        },
      },
    ]);
    return true;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.SHERPA_BLUE} />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />
        {!loading ? (
          <ScrollView style={{ flex: 0.9 }}>
            {rendertotalAmount()}
            {renderPaymentOptions()}
            {bankOptions.length > 0 && renderNetBanking()}
          </ScrollView>
        ) : (
          <Spinner />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  scrollView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  paymentModeCard: {
    flex: 1,
    flexDirection: 'row',
    width: 0.9 * windowWidth,
    height: 0.08 * windowHeight,
    borderRadius: 9,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  netBankingCard: {
    flex: 1,
    width: 0.9 * windowWidth,
    height: 0.22 * windowHeight,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
