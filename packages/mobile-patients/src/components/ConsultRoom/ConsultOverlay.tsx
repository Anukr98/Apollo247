import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CrossPopup,
  CouponIcon,
  ArrowRight,
  GreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  BOOK_APPOINTMENT,
  BOOK_FOLLOWUP_APPOINTMENT,
  VALIDATE_CONSULT_COUPON,
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
  AppointmentType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getNetStatus,
  g,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
// import { useAppCommonData } from '../AppCommonDataProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import {
  ValidateConsultCoupon,
  ValidateConsultCouponVariables,
} from '@aph/mobile-patients/src/graphql/types/ValidateConsultCoupon';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';

const { width, height } = Dimensions.get('window');

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
  const [availableInMin, setavailableInMin] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [coupon, setCoupon] = useState('');

  const doctorFees = isConsultOnline
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
  const { showAphAlert } = useUIElements();
  // const { VirtualConsultationFee } = useAppCommonData();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const todayDate = new Date().toDateString().split('T')[0];
  const scrollToSlots = (top: number = 400) => {
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
  };

  useEffect(() => {
    const todayDate = new Date().toISOString().slice(0, 10);
    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      .then(({ data }: any) => {
        console.log(data, 'next');

        try {
          const nextSlot = data[0] ? data[0]!.availableSlot : '';
          if (!nextSlot && data[0]!.physicalAvailableSlot) {
            tabs.length > 1 && setselectedTab(tabs[1].title);
          }
        } catch (e) {
          CommonBugFender('ConsultOverlay_getNextAvailableSlots_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultOverlay_getNextAvailableSlots', e);
        console.log('error', e);
      });
  }, []);

  const onSubmitBookAppointment = () => {
    CommonLogEvent(AppRoutes.DoctorDetails, 'ConsultOverlay onSubmitBookAppointment clicked');
    setshowSpinner(true);
    const timeSlot =
      tabs[0].title === selectedTab &&
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
    const appointmentInput: BookAppointmentInput = {
      patientId: props.patientId,
      doctorId: props.doctor ? props.doctor.id : '',
      appointmentDateTime: timeSlot, //appointmentDate,
      appointmentType:
        selectedTab === tabs[0].title ? APPOINTMENT_TYPE.ONLINE : APPOINTMENT_TYPE.PHYSICAL,
      hospitalId,
      couponCode: coupon ? coupon : null,
    };
    console.log(appointmentInput, 'input');
    // const price =
    //   VirtualConsultationFee !== props.doctor!.onlineConsultationFees &&
    //   Number(VirtualConsultationFee) > 0
    //     ? VirtualConsultationFee
    //     : props.doctor!.onlineConsultationFees;

    // console.log('price', price);
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
        props.navigation.navigate(AppRoutes.ConsultPayment, {
          doctorName: `${g(props.doctor, 'fullName')}`,
          appointmentId: g(data, 'data', 'bookAppointment', 'appointment', 'id'),
          price: coupon ? doctorDiscountedFees : Number(doctorFees),
          //   tabs[0].title === selectedTab
          //     ? price //1 //props.doctor!.onlineConsultationFees
          //     : props.doctor!.physicalConsultationFees,
        });
      })
      .catch((error) => {
        CommonBugFender('ConsultOverlay_onSubmitBookAppointment', error);
        setshowSpinner(false);
        let message = '';
        try {
          message = error.message.split(':')[1].trim();
        } catch (error) {
          CommonBugFender('ConsultOverlay_onSubmitBookAppointment_try', error);
        }
        if (
          message == 'APPOINTMENT_EXIST_ERROR' ||
          message === 'APPOINTMENT_BOOK_DATE_ERROR' ||
          message === 'DOCTOR_SLOT_BLOCKED'
        ) {
          renderErrorPopup(
            `Oops ! The selected slot is unavailable. Please choose a different one`
          );
        } else if (message === 'BOOKING_LIMIT_EXCEEDED') {
          renderErrorPopup(
            `Sorry! You have cancelled 3 appointments with this doctor in past 7 days, please try later or choose another doctor.`
          );
        } else {
          renderErrorPopup(`Something went wrong.${message ? ` Error Code: ${message}.` : ''}`);
        }
      });
  };

  const onPressPay = () => {
    CommonLogEvent(AppRoutes.DoctorDetails, 'Book Appointment clicked');
    CommonLogEvent(
      AppRoutes.DoctorDetails,
      `PAY Rs. ${
        tabs[0].title === selectedTab
          ? props.doctor!.onlineConsultationFees
          : props.doctor!.physicalConsultationFees
      }`
    );
    getNetStatus()
      .then((status) => {
        // setdisablePay(true);
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
            console.log(input, 'input');
            return;

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
                CommonBugFender('ConsultOverlay_onPressPay', e);
                handleGraphQlError(e);
              });
          } else {
            onSubmitBookAppointment();
          }
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultOverlay_getNetStatus_onPressPay', e);
      });
  };

  const renderBottomButton = () => {
    const buttonText = `PAY Rs. ${(coupon ? doctorDiscountedFees : Number(doctorFees)).toFixed(2)}`;
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
          title={buttonText}
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
        {/* <Button
          title={
            tabs[0].title === selectedTab ? (
              <Text>
                PAY{' '}
                {Number(VirtualConsultationFee) <= 0 ||
                VirtualConsultationFee === props.doctor!.onlineConsultationFees ? (
                  <Text>{`Rs. ${props.doctor!.onlineConsultationFees}`}</Text>
                ) : (
                  <>
                    <Text
                      style={{
                        textDecorationLine: 'line-through',
                        textDecorationStyle: 'solid',
                      }}
                    >
                      {`(Rs. ${props.doctor!.onlineConsultationFees})`}
                    </Text>
                    <Text> Rs. {VirtualConsultationFee}</Text>
                  </>
                )}
                ||* {VirtualConsultationFee !== props.doctor!.onlineConsultationFees &&
                  Number(VirtualConsultationFee) > 0 && (
                    <>
                      <Text
                        style={{
                          textDecorationLine: 'line-through',
                          textDecorationStyle: 'solid',
                        }}
                      >
                        {`(Rs. ${props.doctor!.onlineConsultationFees})`}
                      </Text>
                      <Text> </Text>
                    </>
                  )}
                Rs. {VirtualConsultationFee} *||
              </Text>
            ) : (
              `PAY Rs. ${props.doctor!.physicalConsultationFees}`
            )
          }
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
        /> */}
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
          {string.common.DisclaimerText}
        </Text>
      </View>
    );
  };

  const validateAndApplyCoupon = (couponValue: string, isOnlineConsult: boolean) => {
    const timeSlot =
      tabs[0].title === selectedTab &&
      isConsultOnline &&
      availableInMin! <= 60 &&
      0 < availableInMin!
        ? nextAvailableSlot
        : selectedTimeSlot;

    return new Promise((res, rej) => {
      client
        .mutate<ValidateConsultCoupon, ValidateConsultCouponVariables>({
          mutation: VALIDATE_CONSULT_COUPON,
          variables: {
            doctorId: props.doctorId,
            code: couponValue,
            consultType: isOnlineConsult ? AppointmentType.ONLINE : AppointmentType.PHYSICAL,
            appointmentDateTimeInUTC: timeSlot,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          console.log('v-alidateConsultCoupo-n');
          console.log(JSON.stringify(data!.validateConsultCoupon));
          console.log('\n\n\n\n\n\n\n');
          if (g(data, 'validateConsultCoupon', 'validityStatus')) {
            const revisedAmount = g(data, 'validateConsultCoupon', 'revisedAmount')!;
            setCoupon(couponValue);
            setDoctorDiscountedFees(Number(revisedAmount));
            res();
          } else {
            rej(g(data, 'validateConsultCoupon', 'reasonForInvalidStatus'));
          }
        })
        .catch(rej);
    });
  };

  const updateCouponDiscountOnChangeTab = (isOnlineConsult: boolean) => {
    console.log('updateCouponDiscountOnChangeTab isOnlineConsult', isOnlineConsult);
    // this function will reset coupon discount on change in consultation type
    setCoupon('');
    setDoctorDiscountedFees(0);
  };

  const onApplyCoupon = (value: string) => {
    return validateAndApplyCoupon(value, isConsultOnline);
  };

  const renderApplyCoupon = () => {
    return (
      <ListCard
        container={{
          ...theme.viewStyles.card(),
          borderRadius: 0,
          marginHorizontal: 0,
          marginTop: 16,
          backgroundColor: theme.colors.CARD_BG,
        }}
        leftIcon={<CouponIcon />}
        rightIcon={coupon ? <GreenTickIcon /> : <ArrowRight />}
        title={!coupon ? 'Apply Coupon' : 'Coupon Applied'}
        onPress={() => {
          if (!selectedTimeSlot) {
            Alert.alert('Uh oh.. :(', 'Please select a slot to apply coupon.');
            return;
          }
          props.navigation.navigate(AppRoutes.ApplyConsultCoupon, {
            coupon: coupon,
            onApplyCoupon: onApplyCoupon,
          });
        }}
      />
    );
  };

  const renderPriceAndDiscount = () => {
    if (!coupon) return null;

    const localStyles = StyleSheet.create({
      rowSpaceBetweenStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      blueTextStyle: {
        ...theme.viewStyles.text('M', 16, '#01475b', 1, 24),
      },
    });

    const total = Number(doctorFees).toFixed(2);
    const amountToPay = doctorDiscountedFees.toFixed(2);
    const couponDiscount = (Number(total) - Number(amountToPay)).toFixed(2);

    return (
      <View style={{ ...theme.viewStyles.card(16, 10, 10, theme.colors.CARD_BG) }}>
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>Subtotal</Text>
          <Text style={localStyles.blueTextStyle}>Rs. {total}</Text>
        </View>
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>{`Coupon (${coupon})`}</Text>
          <Text style={localStyles.blueTextStyle}>- Rs. {couponDiscount}</Text>
        </View>
        <Spearator style={{ marginTop: 16, marginBottom: 10 }} />
        <View style={localStyles.rowSpaceBetweenStyle}>
          <Text style={localStyles.blueTextStyle}>To Pay</Text>
          <Text style={theme.viewStyles.text('B', 16, '#01475b', 1, 24)}>Rs. {amountToPay}</Text>
        </View>
      </View>
    );
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
              backgroundColor: '#f7f8f5',
              marginTop: 16,
              // width: width - 40,
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
              onChange={(_selectedTab: string) => {
                setDate(new Date());
                setselectedTab(_selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(_selectedTab === tabs[0].title);
                updateCouponDiscountOnChangeTab(_selectedTab === tabs[0].title);
              }}
              selectedTab={selectedTab}
            />
            <ScrollView bounces={false} ref={scrollViewRef}>
              {selectedTab === tabs[0].title ? (
                <>
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
                </>
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
                  setselectedClinic={setselectedClinic}
                />
              )}
              {renderApplyCoupon()}
              {renderPriceAndDiscount()}
              {selectedTab === tabs[0].title && renderDisclamer()}
              <View style={{ height: 70 }} />
            </ScrollView>
            {props.doctor && renderBottomButton()}
          </View>
        </View>
      </View>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
