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
import { WhatsAppStatus } from './WhatsAppStatus';
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
});

export interface BookingRequestSubmittedOverlayProps extends NavigationScreenProps {
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
export const BookingRequestSubmittedOverlay: React.FC<BookingRequestSubmittedOverlayProps> = (
  props
) => {
  const { doctor } = props;
  const { availableModes } = doctor;

  const client = useApolloClient();
  const { circleSubscriptionId } = useShoppingCart();
  const isOnline = availableModes?.filter(
    (consultMode: ConsultMode) => consultMode === ConsultMode.ONLINE
  );
  const isBoth = availableModes?.filter(
    (consultMode: ConsultMode) => consultMode === ConsultMode.BOTH
  );
  const consultOnlineTab = string.consultModeTab.CONSULT_ONLINE;
  const consultPhysicalTab = string.consultModeTab.MEET_IN_PERSON;

  const tabs = [{ title: 'Request Submitted' }];

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

  const doctorFees =
    consultOnlineTab === selectedTab
      ? props.doctor!.onlineConsultationFees
      : props.doctor!.physicalConsultationFees;

  const [doctorDiscountedFees, setDoctorDiscountedFees] = useState<number>(0);
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
  const isOnlineConsult = selectedTab === consultOnlineTab;
  const isPhysicalConsult = isPhysicalConsultation(selectedTab);

  const circleDoctorDetails = calculateCircleDoctorPricing(
    props.doctor,
    isOnlineConsult,
    isPhysicalConsult
  );
  const {
    onlineConsultSlashedPrice,
    onlineConsultMRPPrice,
    physicalConsultMRPPrice,
    physicalConsultSlashedPrice,
    isCircleDoctorOnSelectedConsultMode,
  } = circleDoctorDetails;
  const actualPrice = isCircleDoctorOnSelectedConsultMode
    ? selectedTab === consultOnlineTab
      ? circleSubscriptionId
        ? onlineConsultSlashedPrice
        : onlineConsultMRPPrice
      : circleSubscriptionId
      ? physicalConsultSlashedPrice
      : physicalConsultMRPPrice
    : Number(doctorFees);

  const todayDate = new Date().toDateString().split('T')[0];
  const scrollToSlots = (top: number = 400) => {
    if (props.scrollToSlot) {
      scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
    }
  };
  useEffect(() => {
    if (props.consultModeSelected === ConsultMode.ONLINE) {
      setselectedTab(consultOnlineTab);
    } else if (props.consultModeSelected === ConsultMode.PHYSICAL) {
      setselectedTab(consultPhysicalTab);
    }
  }, [props.consultModeSelected]);

  useEffect(() => {
    const todayDate = new Date().toISOString().slice(0, 10);
    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      .then(({ data }: any) => {
        try {
          const nextSlot = data[0] ? data[0]!.availableSlot : '';
          if (!nextSlot && data[0]!.physicalAvailableSlot) {
            tabs.length > 1 && setselectedTab(consultPhysicalTab);
          }
        } catch (e) {
          CommonBugFender('ConsultOverlay_getNextAvailableSlots_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultOverlay_getNextAvailableSlots', e);
      });
  }, []);

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
          consultedWithDoctorBefore: props.consultedWithDoctorBefore,
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
          consultedWithDoctorBefore: props.consultedWithDoctorBefore,
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
          title={'PROCEED'}
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

  const updateCouponDiscountOnChangeTab = (isOnlineConsult: boolean) => {
    // this function will reset coupon discount on change in consultation type
    setCoupon('');
    setDoctorDiscountedFees(0);
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
            <TabsComponent
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 0,
              }}
              data={tabs}
              onChange={(_selectedTab: string) => {
                setDate(new Date());
                setselectedTab(_selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(_selectedTab === consultOnlineTab);
                updateCouponDiscountOnChangeTab(_selectedTab === consultOnlineTab);
              }}
              selectedTab={selectedTab}
            />

            <ConsultOnline
              source={props.navigation.getParam('showBookAppointment') ? 'List' : 'Profile'}
              doctor={props.doctor}
              date={date}
              setDate={(date) => {
                setDate(date);
              }}
              nextAvailableSlot={nextAvailableSlot}
              setNextAvailableSlot={''}
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

            <View style={{ height: 50 }} />

            {props.doctor && renderBottomButton()}
          </View>
        </View>
      </View>
    </View>
  );
};

BookingRequestSubmittedOverlay.defaultProps = {
  scrollToSlot: true,
};
