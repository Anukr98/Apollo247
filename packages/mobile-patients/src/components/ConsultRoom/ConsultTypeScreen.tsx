import React, { useState, useEffect } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '../ui/Header';
import { theme } from '../../theme/theme';
import {
  CheckUnselectedIcon,
  CheckedIcon,
  InPersonHeader,
  InPersonBlue,
  CTDoctor,
  CTCalender,
  CTPayment,
  CTVideo,
  CTPrescription,
  CTChat,
  OnlineHeader,
  CTPhone,
  InfoBlue,
  CircleLogo,
} from '../ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  nextAvailability,
  mhdMY,
  g,
  timeDiffFromNow,
  postWebEngageEvent,
} from '../../helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { ConsultMode, DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppRoutes } from '../NavigatorContainer';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_DOCTOR_DETAILS_BY_ID } from '../../graphql/profiles';
import {
  getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { CommonBugFender } from '../../FunctionHelpers/DeviceHelper';
import moment from 'moment';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  ScrollViewStyle: {
    paddingBottom: 23,
  },
  shadowStyle: {
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 15 },
    zIndex: 1,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerTextContainer: {
    backgroundColor: theme.colors.WHITE,
    paddingTop: 8,
    paddingHorizontal: 25,
    paddingBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 14,
    marginHorizontal: 0,
    width: '100%',
    height: 46,
    backgroundColor: '#f0fffc',
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE),
    marginLeft: 8,
  },
  cardContainer: {
    backgroundColor: theme.colors.WHITE,
    marginTop: 21,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  cardHeaderStyle: {
    flexDirection: 'row',
    marginTop: 13,
    paddingBottom: 9,
    justifyContent: 'space-between',
  },
  cardBorderStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
    marginHorizontal: 16,
  },
  headingTextContainer: {
    flex: 1,
    marginLeft: 14,
    alignItems: 'flex-start',
    marginTop: 5,
  },
  priceTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, undefined, 0.35),
    marginTop: 4,
  },
  timeTextStyle: {
    ...theme.viewStyles.text('B', 9, theme.colors.SHERPA_BLUE, 1, undefined, 0.5),
    marginTop: 6,
    marginLeft: 1,
    textTransform: 'uppercase',
  },
  timeText2Style: {
    ...theme.viewStyles.text('B', 9, theme.colors.CAPSULE_ACTIVE_BG, 1),
    marginTop: 6,
    marginLeft: 1,
    textTransform: 'uppercase',
  },
  stepsMainContainer: {
    marginTop: 9,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },
  buttonStyle: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.BUTTON_BG,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  buttonTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.WHITE, 1, 24),
    textTransform: 'uppercase',
  },
  stepsImageContainer: {
    alignItems: 'flex-start',
    marginRight: 12,
    height: '100%',
  },
  carePrice: {
    ...theme.viewStyles.text('M', 15, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 'auto',
  },
  careDiscountedPrice: {
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW),
    marginLeft: 'auto',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careLogo: {
    width: 25,
    height: 15,
    marginHorizontal: 2.5,
  },
  careLogoText: {
    ...theme.viewStyles.text('M', 4, 'white'),
  },
  smallRightAlignText: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_YELLOW),
    marginLeft: 'auto',
    lineHeight: 12,
  },
  row: {
    flexDirection: 'row',
    paddingBottom: 9,
    alignItems: 'center',
    marginTop: -15,
  },
  infoIcon: {
    width: 10,
    height: 10,
    marginLeft: 3,
  },
});

export interface ConsultTypeScreenProps extends NavigationScreenProps {
  DoctorName: string;
  DoctorId: string;
  nextSlot: string;
  nextAppointemntInPresonTime: string;
  onlinePrice: string;
  InpersonPrice: string;
  ConsultType: ConsultMode;
  availNowText?: string;
  consultNowText?: string;
  doctorType: DoctorType;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};
export const ConsultTypeScreen: React.FC<ConsultTypeScreenProps> = (props) => {
  const DoctorName = props.navigation.getParam('DoctorName');
  const DoctorId = props.navigation.getParam('DoctorId');
  const nextAppointemntInPresonTime = props.navigation.getParam('nextSlot');
  const ConsultType = props.navigation.getParam('ConsultType');
  const doctorType = props.navigation.getParam('doctorType');
  const isPayrollDoctor = doctorType === DoctorType.PAYROLL;
  const params = props.navigation.getParam('params');
  const { currentPatientId, currentPatient } = useAllCurrentPatients();
  const [doctorDetails, setdoctorDetails] = useState<getDoctorDetailsById_getDoctorDetailsById>();
  const callSaveSearch = props.navigation.getParam('callSaveSearch');
  const circleDoctorDetails = calculateCircleDoctorPricing(doctorDetails);
  const {
    isCircleDoctor,
    physicalConsultMRPPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultSlashedPrice,
  } = circleDoctorDetails;
  const { showCircleSubscribed } = useShoppingCart();
  const availNowText = props.navigation.getParam('availNowText');
  const consultNowText = props.navigation.getParam('consultNowText');

  const client = useApolloClient();

  useEffect(() => {
    fetchDoctorDetails(DoctorId);
  }, []);

  const fetchDoctorDetails = (doctorId: string) => {
    const input = {
      id: doctorId,
    };

    client
      .query<getDoctorDetailsById>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (data && data.getDoctorDetailsById) {
            setdoctorDetails(data.getDoctorDetailsById);
          }
        } catch (e) {
          CommonBugFender('DoctorDetails_fetchDoctorDetails_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_fetchDoctorDetails', e);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title="CONSULT TYPE"
        onPressLeftIcon={() => props.navigation.goBack()}
        container={styles.shadowStyle}
      />
    );
  };
  const renderDoctorName = () => {
    return (
      <View style={[styles.headerTextContainer, styles.shadowStyle]}>
        <Text style={theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE)}>
          {string.consultType.mainHeading}
        </Text>
        <Text style={theme.viewStyles.text('SB', 16, theme.colors.SKY_BLUE)}>
          {`${DoctorName}?`}
        </Text>
      </View>
    );
  };

  const renderCareDoctorPricing = (heading: string) => {
    return (
      <View style={{ justifyContent: 'center' }}>
        <Text
          style={[
            styles.carePrice,
            {
              textDecorationLine: showCircleSubscribed ? 'line-through' : 'none',
              ...theme.viewStyles.text(
                'M',
                15,
                showCircleSubscribed ? theme.colors.BORDER_BOTTOM_COLOR : theme.colors.LIGHT_BLUE
              ),
            },
          ]}
        >
          {string.common.Rs}
          {heading === string.consultType.online.heading
            ? convertNumberToDecimal(onlineConsultMRPPrice)
            : convertNumberToDecimal(physicalConsultMRPPrice)}
        </Text>
        <View style={styles.rowContainer}>
          {showCircleSubscribed ? <CircleLogo style={styles.careLogo} /> : null}
          <Text style={styles.careDiscountedPrice}>
            {string.common.Rs}
            {heading === string.consultType.online.heading
              ? convertNumberToDecimal(onlineConsultSlashedPrice)
              : convertNumberToDecimal(physicalConsultSlashedPrice)}
          </Text>
        </View>
      </View>
    );
  };

  const openCircleWebView = (heading: string) => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
      isCallback: true,
      onPlanSelected: () => onPlanSelected(heading),
    });
  };

  const onPlanSelected = (heading: string) => {
    if (heading === string.consultType.online.heading) {
      setTimeout(() => {
        onPressOnlineConsult();
      }, 1000);
    } else {
      setTimeout(() => {
        onPressPhysicalConsult();
      }, 1000);
    }
  };

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    price: string,
    time: string | null,
    steps: stepsObject[],
    onPress: () => void
  ) => {
    const timeDiff: Number = timeDiffFromNow(time || '');
    const showCirclePricing =
      isCircleDoctor &&
      ((heading === string.consultType.online.heading && onlineConsultMRPPrice > 0) ||
        (heading === string.consultType.inperson.heading && physicalConsultMRPPrice > 0));
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardBorderStyle}>
          <View style={styles.cardHeaderStyle}>
            {headingImage}
            <View style={styles.headingTextContainer}>
              <Text
                style={theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE, 1, undefined, 0.02)}
              >
                {heading}
              </Text>
              {time && moment(time).isValid() ? (
                <Text style={timeDiff <= 15 ? styles.timeText2Style : styles.timeTextStyle}>
                  {availNowText || nextAvailability(time)}
                </Text>
              ) : null}
            </View>
            {showCirclePricing ? (
              renderCareDoctorPricing(heading)
            ) : (
              <Text style={styles.priceTextStyle}>{`${string.common.Rs}${convertNumberToDecimal(
                Number(price)
              )}`}</Text>
            )}
          </View>
          {!showCircleSubscribed && showCirclePricing ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                openCircleWebView(heading);
                circleWebEngage();
              }}
              style={[
                styles.row,
                {
                  marginTop: heading === string.consultType.online.heading ? -16 : -20,
                },
              ]}
            >
              <Text style={styles.smallRightAlignText}>for</Text>
              <CircleLogo style={styles.careLogo} />
              <Text style={[styles.smallRightAlignText, { marginLeft: 0 }]}>members</Text>
              <InfoBlue style={styles.infoIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.stepsMainContainer}>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 18)}>
            {question}
          </Text>
          {steps.map((i) => (
            <View style={styles.stepsContainer}>
              <View style={styles.stepsImageContainer}>{i.image}</View>
              <Text
                style={{
                  flex: 1,
                  ...theme.viewStyles.text(
                    'M',
                    12,
                    i.textColor ? i.textColor : theme.colors.CONSUTL_STEPS,
                    1,
                    18,
                    0
                  ),
                }}
              >
                {i.description}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onPress}>
          <View style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>
              {consultNowText ||
                `${
                  time && moment(time).isValid()
                    ? nextAvailability(time, 'Consult')
                    : string.common.book_apointment
                }`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const circleWebEngage = () => {
    const eventAttributes = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.VC_NON_CIRCLE_KNOWMORE_CONSULT, eventAttributes);
  };

  const postWebengaegConsultType = (consultType: 'Online' | 'In Person') => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_TYPE_SELECTION] = {
      'Consult Type': consultType,
      'Doctor ID': DoctorId,
      'Doctor Name': DoctorName,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_TYPE_SELECTION, eventAttributes);
  };
  const renderOnlineCard = () => {
    return renderCard(
      <OnlineHeader />,
      string.consultType.online.heading,
      string.consultType.online.question,
      doctorDetails?.onlineConsultationFees ? doctorDetails?.onlineConsultationFees : '-',
      doctorDetails?.doctorNextAvailSlots?.onlineSlot,
      [
        { image: <CTDoctor />, description: string.consultType.online.point1 },
        { image: <CTCalender />, description: string.consultType.online.point2 },
        { image: <CTPayment />, description: string.consultType.online.point3 },
        {
          image: <CTPhone style={{ marginTop: 3 }} />,
          description: string.consultType.online.point4,
        },
        {
          image: <CTVideo />,
          description: string.consultType.online.point5,
          textColor: theme.colors.SKY_BLUE,
        },
        { image: <CTPrescription />, description: string.consultType.online.point6 },
        {
          image: <CTChat />,
          description: string.consultType.follow_up_chat_days_text.replace(
            '{0}',
            doctorDetails?.chatDays ? String(doctorDetails?.chatDays) : '7'
          ),
          textColor: theme.colors.SKY_BLUE,
        },
      ],
      () => {
        onPressOnlineConsult();
      }
    );
  };

  const onPressOnlineConsult = () => {
    props.navigation.navigate(AppRoutes.DoctorDetails, {
      doctorId: DoctorId,
      consultModeSelected: ConsultMode.ONLINE,
      externalConnect: null,
      callSaveSearch: callSaveSearch,
      ...params,
    });
    postWebengaegConsultType('Online');
  };

  const renderInPersonCard = () => {
    return renderCard(
      <InPersonHeader />,
      string.consultType.inperson.heading,
      string.consultType.inperson.question,
      doctorDetails?.physicalConsultationFees ? doctorDetails?.physicalConsultationFees : '-',
      doctorDetails?.doctorNextAvailSlots?.physicalSlot,
      [
        { image: <CTDoctor />, description: string.consultType.inperson.point1 },
        { image: <CTCalender />, description: string.consultType.inperson.point2 },
        { image: <CTPayment />, description: string.consultType.inperson.point3 },
        {
          image: <InPersonBlue />,
          description: string.consultType.inperson.point4,
          textColor: theme.colors.SKY_BLUE,
        },
        { image: <CTPrescription />, description: string.consultType.inperson.point5 },
        {
          image: <CTChat />,
          description: string.consultType.inperson.point6,
          textColor: theme.colors.SKY_BLUE,
        },
      ],
      () => {
        onPressPhysicalConsult();
      }
    );
  };

  const onPressPhysicalConsult = () => {
    props.navigation.navigate(AppRoutes.DoctorDetails, {
      doctorId: DoctorId,
      consultModeSelected: ConsultMode.PHYSICAL,
      externalConnect: null,
      callSaveSearch: callSaveSearch,
      ...params,
    });
    postWebengaegConsultType('In Person');
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.mainContainer}>
        {renderHeader()}
        {renderDoctorName()}
        <ScrollView
          bounces={false}
          style={styles.mainContainer}
          contentContainerStyle={styles.ScrollViewStyle}
        >
          {[ConsultMode.ONLINE, ConsultMode.BOTH].includes(ConsultType) ? renderOnlineCard() : null}
          {!isPayrollDoctor && [ConsultMode.PHYSICAL, ConsultMode.BOTH].includes(ConsultType)
            ? renderInPersonCard()
            : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
