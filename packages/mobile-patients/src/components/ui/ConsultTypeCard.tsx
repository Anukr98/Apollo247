import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  InPersonHeader,
  InPersonBlue,
  CTDoctor,
  CTCalender,
  CTPayment,
  CTPrescription,
  OnlineHeader,
  CTLightGrayChat,
  CTLightGrayVideo,
  CTPhone,
  InfoBlue,
  CircleLogo,
  Tick,
} from './Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '../../theme/theme';
import {
  CircleEventSource,
  nextAvailability,
  timeDiffFromNow,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

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
  noteContainer: {
    margin: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 25,
    height: 15,
    marginHorizontal: 2.5,
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
  tickIcon: {
    height: 8, 
    width: 8, 
    marginEnd: 4
  },
});

export interface ConsultTypeCardProps extends NavigationScreenProps {
  isOnlineSelected: boolean;
  DoctorId: string;
  chatDays: string | number;
  DoctorName: string | null;
  nextAppointemntOnlineTime: string;
  nextAppointemntInPresonTime: string;
  circleDoctorDetails?: any;
  availNowText?: string;
  consultNowText?: string;
  circleEventSource?: CircleEventSource;
}

type stepsObject = {
  image?: Element;
  description?: string;
  textColor?: string;
};

export const ConsultTypeCard: React.FC<ConsultTypeCardProps> = (props) => {
  const {
    isOnlineSelected,
    DoctorId,
    chatDays,
    DoctorName,
    nextAppointemntOnlineTime,
    nextAppointemntInPresonTime,
    circleDoctorDetails,
    availNowText,
    consultNowText,
    circleEventSource,
  } = props;

  const { showCircleSubscribed } = useShoppingCart();

  const {
    isCircleDoctor,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultMRPPrice,
    physicalConsultSlashedPrice,
    cashbackEnabled,
    cashbackAmount,
  } = circleDoctorDetails;

  const renderCareDoctorPricing = () => {
    if (
      (isOnlineSelected && onlineConsultMRPPrice > 0) ||
      (!isOnlineSelected && physicalConsultMRPPrice > 0)
    ) {
      return (
        <View>
          <Text
            style={[
              styles.carePrice,
              {
                textDecorationLine: showCircleSubscribed &&
                (!cashbackEnabled || !isOnlineSelected) ? 'line-through' : 'none',
                ...theme.viewStyles.text(
                  'M',
                  15,
                  showCircleSubscribed && (!cashbackEnabled || !isOnlineSelected) ?
                   theme.colors.BORDER_BOTTOM_COLOR : theme.colors.LIGHT_BLUE
                ),
              },
            ]}
          >
            {string.common.Rs}
            {convertNumberToDecimal(
              isOnlineSelected ? onlineConsultMRPPrice : physicalConsultMRPPrice
            )}
          </Text>
          <View style={styles.rowContainer}>
            {showCircleSubscribed ? !isOnlineSelected ? (
              <CircleLogo style={styles.careLogo} /> 
            ) : cashbackEnabled ? <Tick style={styles.tickIcon} /> : 
            <CircleLogo style={styles.careLogo} /> : null}
            {/* {showCircleSubscribed ? <CircleLogo style={styles.careLogo} /> : null} */}
            <Text style={styles.careDiscountedPrice}>
            {cashbackEnabled && isOnlineSelected ? `Upto ${cashbackAmount} HC` :
              string.common.Rs + convertNumberToDecimal(
              isOnlineSelected ? onlineConsultSlashedPrice : physicalConsultSlashedPrice)}
            </Text>
          </View>
        </View>
      );
    }
    return <></>;
  };

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    time: string | null,
    steps: stepsObject[]
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
    const showCirclePricing =
      isCircleDoctor &&
      ((isOnlineSelected && onlineConsultMRPPrice > 0) ||
        (!isOnlineSelected && physicalConsultMRPPrice > 0));
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
          {!showCircleSubscribed && showCirclePricing ? (
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
              <Text style={[styles.smallRightAlignText, { marginLeft: 0 }]}>members</Text>
              <InfoBlue style={styles.infoIcon} />
            </TouchableOpacity>
          ) : null}
          {showCircleSubscribed && isOnlineSelected && cashbackEnabled &&
            <View style={[
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
            ]}>
              <Text style={styles.smallRightAlignText}>as a</Text>
              <CircleLogo style={styles.careLogo} />
              <Text style={[styles.smallRightAlignText, { marginLeft: 0 }]}>members</Text>
            </View>
          }
        </View>

        <View style={styles.stepsMainContainer}>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 18)}>
            {question}
          </Text>
          {steps.map((i) => (
            <>
              {i?.description ? (
                <View style={styles.stepsContainer}>
                  <View style={styles.stepsImageContainer}>{i.image}</View>
                  <Text
                    style={{
                      flex: 1,
                      ...theme.viewStyles.text(
                        'M',
                        12,
                        i.textColor ? i.textColor : theme.colors.CONSUTL_STEPS
                      ),
                    }}
                  >
                    {i.description}
                  </Text>
                </View>
              ) : null}
            </>
          ))}
        </View>
        {!isOnlineSelected ? (
          <View style={styles.noteContainer}>
            <Text style={theme.viewStyles.text('M', 12, '#02475B', 1, 16, 0)}>
              Note: Pay at Reception is available.
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
      circleEventSource,
    });
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
        chatDays !== 0
          ? {
              image: <CTLightGrayChat />,
              description: string.consultType.follow_up_chat_days_text.replace(
                '{0} days',
                `${chatDays} day${chatDays && Number(chatDays) > 1 ? 's' : ''}`
              ),
            }
          : {},
      ]
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
      ]
    );
  };

  return (
    <View style={styles.mainView}>
      {isOnlineSelected ? renderOnlineCard() : renderInPersonCard()}
    </View>
  );
};
