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
    marginHorizontal: 16,
    paddingBottom: 9,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
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
});

export interface ConsultTypeCardProps {
  isOnlineSelected: boolean;
  DoctorId: string;
  chatDays: string;
  DoctorName: string | null;
  nextAppointemntOnlineTime: string;
  nextAppointemntInPresonTime: string;
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
    isOnlineSelected,
    DoctorId,
    chatDays,
    DoctorName,
    nextAppointemntOnlineTime,
    nextAppointemntInPresonTime,
    availNowText,
    consultNowText,
  } = props;

  const { currentPatient } = useAllCurrentPatients();

  const [consultDoctorName, setConsultDocotrName] = useState<string>(DoctorName ? DoctorName : '');

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    time: string | null,
    steps: stepsObject[]
  ) => {
    const timeDiff: Number = timeDiffFromNow(time || '');
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeaderStyle}>
          {headingImage}
          <View style={styles.headingTextContainer}>
            <Text style={theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE, 1, undefined, 0.02)}>
              {heading}
            </Text>
            {time && moment(time).isValid() ? (
              <Text style={timeDiff <= 15 ? styles.timeText2Style : styles.timeTextStyle}>
                {availNowText || nextAvailability(time)}
              </Text>
            ) : null}
          </View>
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
      </View>
    );
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
        {
          image: <CTChat />,
          description: string.consultType.follow_up_chat_days_text.replace('{0}', chatDays),
          textColor: theme.colors.SKY_BLUE,
        },
      ]
    );
  };

  return (
    <View style={styles.mainView}>
      {isOnlineSelected ? renderOnlineCard() : renderInPersonCard()}
    </View>
  );
};
