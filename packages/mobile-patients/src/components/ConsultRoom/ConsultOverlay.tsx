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
} from '@aph/mobile-patients/src/graphql/profiles';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/BookFollowUpAppointment';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  DoctorType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
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
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

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
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
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
  const tabs =
    props.doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [showSuccessPopUp, setshowSuccessPopUp] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [AppointmentExistAlert, setAppointmentExistAlert] = useState<boolean>(false);
  const scrollViewRef = React.useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [disablePay, setdisablePay] = useState<boolean>(false);

  const todayDate = new Date().toDateString().split('T')[0];

  const scrollToSlots = (top: number = 400) => {
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
  };

  const onSubmitBookAppointment = () => {
    CommonLogEvent(
      'ConsultOverlay onSubmitBookAppointment',
      'ConsultOverlay onSubmitBookAppointment clicked'
    );
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
    client
      .mutate<bookAppointment>({
        mutation: BOOK_APPOINTMENT,
        variables: {
          bookAppointment: appointmentInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setshowSpinner(false);
        setshowSuccessPopUp(true);
      })
      .catch((error) => {
        try {
          setshowSpinner(false);
          const message = error.message.split(':')[1].trim();
          if (
            message == 'APPOINTMENT_EXIST_ERROR' ||
            message === 'APPOINTMENT_BOOK_DATE_ERROR' ||
            message === 'DOCTOR_SLOT_BLOCKED'
          )
            setAppointmentExistAlert(true);
        } catch (error) {}
      });
  };

  const onPressPay = () => {
    CommonLogEvent('ConsultOverlay onPressPay', 'ConsultOverlay onPressPay clicked');
    getNetStatus().then((status) => {
      setdisablePay(true);
      if (status) {
        if (props.FollowUp == false) {
          const timeSlot =
            tabs[0].title === selectedTab &&
            isConsultOnline &&
            availableInMin! <= 60 &&
            0 < availableInMin!
              ? nextAvailableSlot
              : selectedTimeSlot;
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
              props.navigation.navigate(AppRoutes.Consult);
            })
            .catch((e: any) => {
              try {
                const error = JSON.parse(JSON.stringify(e));
                const errorMessage = error && error.message;
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
            disablePay
              ? true
              : tabs[0].title === selectedTab &&
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
  const successSteps = [
    'Let’s get you feeling better in 5 simple steps :)',
    '1. Answer some quick questions',
    '2. Connect with your doctor',
    '3. Get a prescription and meds, if necessary',
    '4. Avail 1 free follow-up*',
    '5. Chat with your doctor*',
    '* 7 days after your first consultation.',
  ];

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
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
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
                setselectedTab(selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(true);
                setisConsultOnline(selectedTab === tabs[0].title ? true : false);
              }}
              selectedTab={selectedTab}
            />
            <ScrollView bounces={false} ref={scrollViewRef}>
              {selectedTab === tabs[0].title ? (
                <ConsultOnline
                  doctor={props.doctor}
                  date={date}
                  setDate={(date) => {
                    setDate(date);
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
                  scrollToSlots={scrollToSlots}
                  setshowOfflinePopup={setshowOfflinePopup}
                />
              ) : (
                <ConsultPhysical
                  doctor={props.doctor}
                  clinics={props.clinics}
                  setDate={(date) => {
                    setDate(date);
                    // fetchSlots(date);//removed
                    // scrollViewRef.current &&
                    //   scrollViewRef.current.scrollTo &&
                    //   scrollViewRef.current.scrollTo({ x: 0, y: 465, animated: true });
                  }}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  date={date}
                  setshowSpinner={setshowSpinner}
                  setshowOfflinePopup={setshowOfflinePopup}
                  scrollToSlots={scrollToSlots}
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
            props.doctor ? `${props.doctor.firstName} ${props.doctor.lastName}` : ''
          }.`}
        >
          <ScrollView bounces={false}>
            <Text style={styles.congratulationsDescriptionStyle}>{successSteps.join('\n')}</Text>
          </ScrollView>
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                CommonLogEvent(
                  'ConsultOverlay Appointment Confirmation',
                  'ConsultOverlay Appointment Confirmation clicked'
                );
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
