import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  BOOK_APPOINTMENT,
  BOOK_FOLLOWUP_APPOINTMENT,
  GET_AVAILABLE_SLOTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/BookFollowUpAppointment';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  DoctorType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { divideSlots, getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ConsultOverlayProps extends NavigationScreenProps {
  // dispalyoverlay: boolean;
  setdisplayoverlay: (arg0: boolean) => void;
  // setdisplayoverlay: () => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  FollowUp: boolean;
  appointmentType: string;
  appointmentId: string;
  // availableSlots: string[] | null;
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const client = useApolloClient();
  console.log('FollowUp', props.FollowUp);
  console.log('appointmentType', props.appointmentType);
  console.log('patientId', props.patientId);
  console.log('appointmentType', props.appointmentType);
  console.log('appointmentId', props.appointmentId);
  console.log('doctorId', props.doctorId);
  const tabs =
    props.doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];

  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [showSuccessPopUp, setshowSuccessPopUp] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);
  const [AppointmentExistAlert, setAppointmentExistAlert] = useState<boolean>(false);
  const scrollViewRef = React.useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  const todayDate = new Date().toDateString().split('T')[0];
  console.log(todayDate, 'todayDatetodayDate', new Date().toDateString());

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    console.log(availableSlots, 'setTimeArrayData availableSlots');

    const array = await divideSlots(availableSlots, date);
    console.log(array, 'array', timeArray, 'timeArray.......');
    if (array !== timeArray) settimeArray(array);
  };

  useEffect(() => {
    fetchSlots(date);
  }, []);

  const fetchSlots = (date: Date) => {
    console.log('fetchSlots', date);

    getNetStatus().then((status) => {
      if (status) {
        setshowSpinner(true);
        const availableDate = moment(date).format('YYYY-MM-DD');
        client
          .query<getDoctorAvailableSlots>({
            query: GET_AVAILABLE_SLOTS,
            fetchPolicy: 'no-cache',
            variables: {
              DoctorAvailabilityInput: {
                availableDate: availableDate,
                doctorId: props.doctorId,
              },
            },
          })
          .then(({ data }) => {
            try {
              console.log(data, 'availableSlots', availableSlots);
              if (
                data &&
                data.getDoctorAvailableSlots &&
                data.getDoctorAvailableSlots.availableSlots &&
                availableSlots !== data.getDoctorAvailableSlots.availableSlots
              ) {
                setshowSpinner(false);
                setTimeArrayData(data.getDoctorAvailableSlots.availableSlots, date);
                setavailableSlots(data.getDoctorAvailableSlots.availableSlots);
              }
            } catch {}
          })
          .catch((e: string) => {
            showSpinner && setshowSpinner(false);
            console.log('Error occured', e);
          });
      } else {
        setshowSpinner(false);
        setshowOfflinePopup(true);
      }
    });
  };

  // console.log(availableDate, 'dateeeeeeee', props.doctorId, 'doctorId');
  // const availabilityData = useQuery<getDoctorAvailableSlots>(GET_AVAILABLE_SLOTS, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     DoctorAvailabilityInput: {
  //       availableDate: availableDate,
  //       doctorId: props.doctorId,
  //     },
  //   },
  // });

  // if (availabilityData.error) {
  //   console.log('error', availabilityData.error);
  //   showSpinner && setshowSpinner(false);
  // } else {
  //   console.log(availabilityData.data, 'availableSlots', availableSlots);
  //   if (
  //     availabilityData &&
  //     availabilityData.data &&
  //     availabilityData.data.getDoctorAvailableSlots &&
  //     availabilityData.data.getDoctorAvailableSlots.availableSlots &&
  //     availableSlots !== availabilityData.data.getDoctorAvailableSlots.availableSlots
  //   ) {
  //     setshowSpinner(false);
  //     console.log(
  //       availableDate,
  //       'dateeeeeeee',
  //       availableSlots,
  //       'availableSlots1111',
  //       availabilityData.data.getDoctorAvailableSlots.availableSlots
  //     );
  //     setTimeArrayData(availabilityData.data.getDoctorAvailableSlots.availableSlots, date);
  //     setavailableSlots(availabilityData.data.getDoctorAvailableSlots.availableSlots);
  //   }
  // }

  const onSubmitBookAppointment = () => {
    console.log('BookAppointment flow');
    setshowSpinner(true);
    const timeSlot =
      tabs[0].title === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;
    const appointmentInput: BookAppointmentInput = {
      patientId: props.patientId,
      doctorId: props.doctor ? props.doctor.id : '',
      appointmentDateTime: timeSlot, //appointmentDate,
      appointmentType:
        selectedTab === tabs[0].title ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      hospitalId:
        props.clinics && props.clinics.length > 0 && props.clinics[0].facility
          ? props.clinics[0].facility.id
          : '',
    };
    console.log(appointmentInput, 'appointmentInput');

    client
      .mutate<bookAppointment>({
        mutation: BOOK_APPOINTMENT,
        variables: {
          bookAppointment: appointmentInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        console.log('bookAppointment data', data), setshowSpinner(false), setshowSuccessPopUp(true);
      })
      .catch((error) => {
        try {
          console.log(
            'bookAppointment error',
            // error.graphQLErrors,
            error.message
          ),
            setshowSpinner(false),
            (error.message.split(':')[1].trim() == 'APPOINTMENT_EXIST_ERROR' ||
              error.message.split(':')[1].trim() === 'APPOINTMENT_BOOK_DATE_ERROR') &&
              setAppointmentExistAlert(true);
        } catch (error) {}
      });
  };

  const onPressPay = () => {
    getNetStatus().then((status) => {
      if (status) {
        if (props.FollowUp == false) {
          console.log('BookfollowupAppointment flow');
          const timeSlot =
            tabs[0].title === selectedTab &&
            isConsultOnline &&
            availableInMin! <= 60 &&
            0 < availableInMin!
              ? nextAvailableSlot
              : selectedTimeSlot;
          console.log('time', timeSlot);
          console.log('FollowUp', props.FollowUp);
          console.log('appointmentType', props.appointmentType);
          console.log('patientId', props.patientId);
          console.log('appointmentType', props.appointmentType);
          console.log('appointmentId', props.appointmentId);
          console.log('doctorId', props.doctorId);
          const input = {
            patientId: props.patientId,
            doctorId: props.doctorId,
            appointmentDateTime: timeSlot,
            appointmentType: APPOINTMENT_TYPE.ONLINE,
            hospitalId: '',
            followUpParentId: props.appointmentId,
          };
          client
            .mutate<BookFollowUpAppointment, BookFollowUpAppointmentVariables>({
              mutation: BOOK_FOLLOWUP_APPOINTMENT,
              variables: {
                followUpAppointmentInput: input,
              },
              fetchPolicy: 'no-cache',
            })
            .then((_data: any) => {
              console.log('BookFollowUpAppointment', _data);
              props.navigation.navigate(AppRoutes.Consult);
            })
            .catch((e: any) => {
              try {
                const error = JSON.parse(JSON.stringify(e));
                const errorMessage = error && error.message;
                console.log('Error occured while BookFollowUpAppointment ', errorMessage, error);
                Alert.alert('Error', errorMessage);
              } catch {}
            });
        } else {
          onSubmitBookAppointment();
        }
      } else {
        setshowOfflinePopup(true);
      }
    });
  };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent
        defaultBG
        style={{
          paddingHorizontal: 16,
          height: 66,
          marginTop: 10,
        }}
      >
        <Button
          title={`PAY Rs. ${
            tabs[0].title === selectedTab
              ? props.doctor!.onlineConsultationFees
              : props.doctor!.physicalConsultationFees
          }`}
          disabled={
            tabs[0].title === selectedTab &&
            isConsultOnline &&
            availableInMin! <= 60 &&
            0 < availableInMin!
              ? false
              : selectedTimeSlot === ''
              ? true
              : false
          }
          onPress={onPressPay}
        />
      </StickyBottomComponent>
    );
  };
  console.log(timeArray, 'timeArraytimeArray render');

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            // backgroundColor: 'white',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setdisplayoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? 38 : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: showSpinner ? 20 : 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            // isVisible={props.dispalyoverlay}
            // windowBackgroundColor="rgba(0, 0, 0, .41)"
            // overlayBackgroundColor={theme.colors.DEFAULT_BACKGROUND_COLOR}

            // onBackdropPress={() => props.setdisplayoverlay(false)}
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
              // margin: 0,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <TabsComponent
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 0,
              }}
              data={tabs}
              onChange={(selectedTab: string) => {
                setDate(new Date());
                fetchSlots(new Date());
                setselectedTab(selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(true);
                setisConsultOnline(selectedTab === tabs[0].title ? true : false);
              }}
              selectedTab={selectedTab}
            />
            <ScrollView
              bounces={false}
              // ref={scrollViewRef}
            >
              {selectedTab === tabs[0].title ? (
                <ConsultOnline
                  doctor={props.doctor}
                  timeArray={timeArray}
                  date={date}
                  setDate={(date) => {
                    console.log(scrollViewRef, 'scrollViewRef');
                    setDate(date);
                    fetchSlots(date);
                    // scrollViewRef.current &&
                    //   scrollViewRef.current.scrollTo &&
                    //   scrollViewRef.current.scrollTo({ x: 0, y: 510, animated: true });
                  }}
                  nextAvailableSlot={nextAvailableSlot}
                  setNextAvailableSlot={setNextAvailableSlot}
                  isConsultOnline={isConsultOnline}
                  setisConsultOnline={setisConsultOnline}
                  setavailableInMin={setavailableInMin}
                  availableInMin={availableInMin}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  setshowSpinner={setshowSpinner}
                />
              ) : (
                <ConsultPhysical
                  doctor={props.doctor}
                  clinics={props.clinics}
                  setDate={(date) => {
                    console.log(scrollViewRef, 'scrollViewRef');
                    setDate(date);
                    fetchSlots(date);
                    // scrollViewRef.current &&
                    //   scrollViewRef.current.scrollTo &&
                    //   scrollViewRef.current.scrollTo({ x: 0, y: 465, animated: true });
                  }}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  timeArray={timeArray}
                  date={date}
                  setshowSpinner={setshowSpinner}
                  setshowOfflinePopup={setshowOfflinePopup}
                />
              )}
              <View style={{ height: 96 }} />
            </ScrollView>
            {props.doctor && renderBottomButton()}
          </View>
        </View>
      </View>
      {showSuccessPopUp && (
        <BottomPopUp
          title={'Appointment Confirmation'}
          description={`Your appointment has been successfully booked with Dr. ${
            props.doctor && props.doctor!.firstName ? props.doctor!.firstName : ''
          }`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                setshowSuccessPopUp(false);
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
                  })
                );
              }}
            >
              <Text style={styles.gotItTextStyles}>GO TO CONSULT ROOM</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {AppointmentExistAlert && (
        <BottomPopUp
          title={'Alert!'}
          description={`Oops ! The selected slot is unavailable. Please choose a different one`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                setAppointmentExistAlert(false);
                props.setdisplayoverlay(false);
              }}
            >
              <Text style={styles.gotItTextStyles}>Okay</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
