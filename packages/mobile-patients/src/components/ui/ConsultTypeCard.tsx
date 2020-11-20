import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  InPersonHeader,
  InPersonBlue,
  CTDoctor,
  CTCalender,
  CTPayment,
  CTVideo,
  CTPrescription,
  CTChat,
  OnlineHeader,
  CTLightGrayChat,
  CTLightGrayVideo,
  CTPhone,
  InfoBlue,
  CircleLogo,
} from './Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '../../theme/theme';
import {
  nextAvailability,
  mhdMY,
  g,
  timeDiffFromNow,
  postWebEngageEvent,
} from '../../helpers/helperFunctions';
import moment from 'moment';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  cardContainer: {
    backgroundColor: theme.colors.WHITE,
    marginTop: 21,
    marginHorizontal: 20,
    marginBottom: 26,
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
  careLogo: {
    width: 40,
    height: 21,
  },
  careLogoText: {
    ...theme.viewStyles.text('M', 4, 'white'),
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
  smallRightAlignText: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_YELLOW),
    marginLeft: 'auto',
    lineHeight: 12,
  },
  row: {
    flexDirection: 'row',
    paddingBottom: 9,
    alignItems: 'center',
    marginTop: -16,
  },
  infoIcon: {
    width: 10,
    height: 10,
    marginLeft: 3,
  },
});

export interface ConsultTypeCardProps extends NavigationScreenProps {
  onOnlinePress: () => void;
  onPhysicalPress: () => void;
  isOnlineSelected: boolean;
  DoctorId: string;
  chatDays: string;
  DoctorName: string | null;
  nextAppointemntOnlineTime: string;
  nextAppointemntInPresonTime: string;
  circleDoctorDetails?: any;
  availNowText?: string;
  consultNowText?: string;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};

export const ConsultTypeCard: React.FC<ConsultTypeCardProps> = (props) => {
  const {
    onOnlinePress,
    onPhysicalPress,
    isOnlineSelected,
    DoctorId,
    chatDays,
    DoctorName,
    nextAppointemntOnlineTime,
    nextAppointemntInPresonTime,
    circleDoctorDetails,
    availNowText,
    consultNowText,
  } = props;

  const { currentPatient } = useAllCurrentPatients();
  const { circleSubscriptionId } = useShoppingCart();

  const [consultDoctorName, setConsultDocotrName] = useState<string>(DoctorName ? DoctorName : '');
  const {
    isCircleDoctor,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultMRPPrice,
    physicalConsultSlashedPrice,
  } = circleDoctorDetails;

  const renderCareDoctorPricing = () => {
    return (
      <View>
        <Text
          style={[
            styles.carePrice,
            {
              textDecorationLine: circleSubscriptionId ? 'line-through' : 'none',
              ...theme.viewStyles.text(
                'M',
                15,
                circleSubscriptionId ? theme.colors.BORDER_BOTTOM_COLOR : theme.colors.LIGHT_BLUE
              ),
            },
          ]}
        >
          {string.common.Rs}
          {isOnlineSelected ? onlineConsultMRPPrice : physicalConsultMRPPrice}
        </Text>
        <View style={styles.rowContainer}>
          {circleSubscriptionId ? <CircleLogo style={styles.careLogo} /> : null}
          <Text style={styles.careDiscountedPrice}>
            {string.common.Rs}
            {isOnlineSelected ? onlineConsultSlashedPrice : physicalConsultSlashedPrice}
          </Text>
        </View>
      </View>
    );
  };

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    time: string | null,
    steps: stepsObject[],
    onPress: () => void
  ) => {
    const timeDiff: Number = timeDiffFromNow(time || '');
    const current = moment(new Date());
    const isTomorrow = moment(time).isAfter(
      current
        .add(1, 'd')
        .startOf('d')
        .set({
          hour: moment('06:00', 'HH:mm').get('hour'),
          minute: moment('06:00', 'HH:mm').get('minute'),
        })
    );
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
            {isCircleDoctor && renderCareDoctorPricing()}
          </View>
          {!circleSubscriptionId && isCircleDoctor ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => openCircleWebView()}
              style={[
                styles.row,
                {
                  marginTop:
                    heading === string.consultType.online.heading
                      ? isTomorrow
                        ? -16
                        : -22
                      : isTomorrow
                      ? -23
                      : -29,
                },
              ]}
            >
              <Text style={styles.smallRightAlignText}>for</Text>
              <CircleLogo style={styles.careLogo} />
              <Text style={[styles.smallRightAlignText, { marginLeft: -4 }]}>members</Text>
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

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
    });
  };

  const postWebengaegConsultType = (consultType: 'Online' | 'In Person') => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_TYPE_SELECTION] = {
      'Consult Type': consultType,
      'Doctor ID': DoctorId,
      'Doctor Name': consultDoctorName,
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
      nextAppointemntOnlineTime,
      [
        { image: <CTDoctor />, description: string.consultType.online.point1 },
        { image: <CTCalender />, description: string.consultType.online.point2 },
        { image: <CTPayment />, description: string.consultType.online.point3 },
        {
          image: <CTPhone style={{ marginTop: 3 }} />,
          description: string.consultType.online.point4,
        },
        {
          image: <CTLightGrayVideo />,
          description: string.consultType.online.point5,
        },
        { image: <CTPrescription />, description: string.consultType.online.point6 },
        {
          image: <CTLightGrayChat />,
          description: string.consultType.follow_up_chat_days_text.replace('{0}', chatDays),
        },
      ],
      () => {
        onOnlinePress();
        postWebengaegConsultType('Online');

        // props.navigation.navigate(AppRoutes.DoctorDetails, {
        //   doctorId: DoctorId,
        //   consultModeSelected: ConsultMode.ONLINE,
        //   externalConnect: hideCheckbox ? null : consultedChecked,
        //   ...params,
        // });
      }
    );
  };

  const renderInPersonCard = () => {
    return renderCard(
      <InPersonHeader />,
      string.consultType.inperson.heading,
      string.consultType.inperson.question,
      nextAppointemntInPresonTime,
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
          description: string.consultType.follow_up_chat_days_text.replace('{0}', chatDays),
          textColor: theme.colors.SKY_BLUE,
        },
      ],
      () => {
        onPhysicalPress();
        postWebengaegConsultType('In Person');

        // props.navigation.navigate(AppRoutes.DoctorDetails, {
        //   doctorId: DoctorId,
        //   consultModeSelected: ConsultMode.PHYSICAL,
        //   externalConnect: hideCheckbox ? null : consultedChecked,
        //   ...params,
        // });
      }
    );
  };

  return (
    <View style={styles.mainView}>
      {isOnlineSelected ? renderOnlineCard() : renderInPersonCard()}
    </View>
  );
};
