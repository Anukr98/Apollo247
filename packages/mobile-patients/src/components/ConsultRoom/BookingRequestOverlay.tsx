import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { NotificationPermissionAlert } from '@aph/mobile-patients/src/components/ui/NotificationPermissionAlert';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  ConsultMode,
  DoctorType,
  BookAppointmentInput,
  APPOINTMENT_TYPE,
  BOOKINGSOURCE,
  DEVICETYPE,
  PLAN,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { WhatsAppStatus } from '../ui/WhatsAppStatus';
import {
  calculateCircleDoctorPricing,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import moment from 'moment';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainViewStyle: {
    backgroundColor: '#f7f8f5',
    marginTop: 16,
    width: width - 40,
    height: 'auto',
    maxHeight: height - 98,
    padding: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  noteContainer: {
    margin: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextStyle: {
    margin: 18,
  },
});

export interface BookingRequestOverlayProps extends NavigationScreenProps {
  setdisplayoverlay: (arg0: boolean) => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  FollowUp: boolean;
  appointmentType: string;
  appointmentId: string;
  consultModeSelected: ConsultMode;
  externalConnect: boolean | null;
  availableMode: string;
  consultedWithDoctorBefore: boolean;
  callSaveSearch: string;
  mainContainerStyle?: StyleProp<ViewStyle>;
  scrollToSlot?: boolean;
  isDoctorsOfTheHourStatus?: boolean;
}
export const BookingRequestOverlay: React.FC<BookingRequestOverlayProps> = (props) => {
  const { doctor } = props;

  const client = useApolloClient();
  const { circleSubscriptionId } = useShoppingCart();

  const consultOnlineTab = string.consultModeTab.CONSULT_ONLINE;
  const consultPhysicalTab = string.consultModeTab.MEET_IN_PERSON;

  const tabs = [{ title: 'Request Appointment' }];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [coupon, setCoupon] = useState('');
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(true);
  const [notificationAlert, setNotificationAlert] = useState(false);

  const scrollViewRef = React.useRef<any>(null);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [disablePay, setdisablePay] = useState<boolean>(false);
  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );
  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, hdfcUserSubscriptions } = useAppCommonData();

  const todayDate = new Date().toDateString().split('T')[0];
  const scrollToSlots = (top: number = 400) => {
    if (props.scrollToSlot) {
      scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
    }
  };

  const onPressCheckout = async () => {
    CommonLogEvent(AppRoutes.DoctorDetails, 'ConsultOverlay onSubmitBookAppointment clicked');
    const timeSlot =
      consultOnlineTab === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;

    const doctorClinics = props.clinics.filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const hospitalId = isConsultOnline
      ? doctorClinics.length > 0 && doctorClinics[0].facility
        ? doctorClinics[0].facility.id
        : ''
      : selectedClinic
      ? selectedClinic.facility.id
      : '';
    const externalConnectParam =
      props.externalConnect !== null ? { externalConnect: props.externalConnect } : {};
    const appointmentInput: BookAppointmentInput = {
      patientId: props.patientId,
      doctorId: props.doctor ? props.doctor.id : '',
      appointmentDateTime: timeSlot, //appointmentDate,
      appointmentType:
        selectedTab === consultOnlineTab ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      hospitalId,
      bookingSource: BOOKINGSOURCE.MOBILE,
      deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
      ...externalConnectParam,
      actualAmount: actualPrice,
      pinCode: locationDetails && locationDetails.pincode,
      subscriptionDetails:
        circleSubscriptionId && isCircleDoctorOnSelectedConsultMode
          ? {
              userSubscriptionId: circleSubscriptionId,
              plan: PLAN.CARE_PLAN,
            }
          : null,
    };

    consultOnlineTab === selectedTab
      ? props.navigation.navigate(AppRoutes.PaymentCheckout, {
          doctor: props.doctor,
          tabs: tabs,
          selectedTab: selectedTab,
          price: actualPrice,
          appointmentInput: appointmentInput,
          couponApplied: coupon == '' ? false : true,
          consultedWithDoctorBefore: props?.consultedWithDoctorBefore,
          patientId: props.patientId,
          callSaveSearch: props.callSaveSearch,
          availableInMin: availableInMin,
          nextAvailableSlot: nextAvailableSlot,
          selectedTimeSlot: selectedTimeSlot,
          followUp: props.FollowUp,
          whatsAppUpdate: whatsAppUpdate,
          isDoctorsOfTheHourStatus: props.isDoctorsOfTheHourStatus,
        })
      : props.navigation.navigate(AppRoutes.PaymentCheckoutPhysical, {
          doctor: props.doctor,
          tabs: tabs,
          selectedTab: selectedTab,
          price: actualPrice,
          appointmentInput: appointmentInput,
          couponApplied: coupon == '' ? false : true,
          consultedWithDoctorBefore: props?.consultedWithDoctorBefore,
          patientId: props.patientId,
          callSaveSearch: props.callSaveSearch,
          availableInMin: availableInMin,
          nextAvailableSlot: nextAvailableSlot,
          selectedTimeSlot: selectedTimeSlot,
          followUp: props.FollowUp,
          whatsAppUpdate: whatsAppUpdate,
          isDoctorsOfTheHourStatus: props.isDoctorsOfTheHourStatus,
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
          title={'SUBMIT REQUEST'}
          disabled={
            disablePay
              ? true
              : consultOnlineTab === selectedTab &&
                isConsultOnline &&
                availableInMin! <= 60 &&
                0 < availableInMin!
              ? false
              : selectedTimeSlot === ''
              ? true
              : false
          }
          onPress={() => {
            onPressCheckout();
          }}
        />
      </StickyBottomComponent>
    );
  };
  const renderDisclamer = () => {
    return (
      <View
        style={{
          margin: 20,
          padding: 12,
          borderRadius: 10,
          backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
        }}
      >
        <Text
          style={[
            theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE, 1, 16, 0),
            { textAlign: 'justify' },
          ]}
        >
          {string.common.DisclaimerTextBookingRequest}
        </Text>
      </View>
    );
  };
  const renderFootNote = () => {
    return (
      <View style={styles.noteContainer}>
        <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 16, 0)}>
          Note: Pay at Reception is available.
        </Text>
      </View>
    );
  };

  const [slotsSelected, setSlotsSelected] = useState<string[]>([]);

  const postSlotSelectedEvent = (slot: string) => {
    if (!slot) {
      return;
    }
    // to avoid duplicate events
    if (!slotsSelected.find((val) => val == slot)) {
      const doctorClinics = (g(props.doctor, 'doctorHospital') || []).filter((item) => {
        if (item && item.facility && item.facility.facilityType)
          return item.facility.facilityType === 'HOSPITAL';
      });
      const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_SLOT_SELECTED] = {
        doctorName: g(props.doctor, 'fullName')!,
        specialisation: g(props.doctor, 'specialty', 'name')!,
        experience: Number(g(props.doctor, 'experience')!),
        'language known': g(props.doctor, 'languages')! || 'NA',
        'Consult Mode': consultOnlineTab === selectedTab ? 'Online' : 'Physical',
        'Doctor ID': g(props.doctor, 'id')!,
        'Speciality ID': g(props.doctor, 'specialty', 'id')!,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Consult Date Time': moment(slot).toDate(),
      };
      postWebEngageEvent(WebEngageEventName.CONSULT_SLOT_SELECTED, eventAttributes);
      setSlotsSelected([...slotsSelected, slot]);
    }
  };

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
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              props.setdisplayoverlay(false);
            }}
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
          <View style={[styles.mainViewStyle, props.mainContainerStyle]}>
            <View
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                shadowOffset: { width: 5, height: 20 },
              }}
            >
              <Text style={[styles.headerTextStyle, theme.viewStyles.text('M', 16, '#02475B')]}>
                {tabs[0].title}
              </Text>
            </View>
            <ScrollView bounces={false} ref={scrollViewRef}>
              <ConsultOnline
                source={props.navigation.getParam('showBookAppointment') ? 'List' : 'Profile'}
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
                setselectedTimeSlot={(timeSlot) => {
                  postSlotSelectedEvent(timeSlot);
                  setselectedTimeSlot(timeSlot);
                }}
                selectedTimeSlot={selectedTimeSlot}
                setshowSpinner={setshowSpinner}
                scrollToSlots={scrollToSlots}
                setshowOfflinePopup={setshowOfflinePopup}
              />

              {renderDisclamer()}

              {renderFootNote()}
              <View style={{ height: 70 }} />
            </ScrollView>
            {renderBottomButton()}
          </View>
        </View>
      </View>
      {notificationAlert && (
        <NotificationPermissionAlert
          onPressOutside={() => setNotificationAlert(false)}
          onButtonPress={() => {
            setNotificationAlert(false);
            Linking.openSettings();
          }}
        />
      )}
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};

BookingRequestOverlay.defaultProps = {
  scrollToSlot: true,
};
