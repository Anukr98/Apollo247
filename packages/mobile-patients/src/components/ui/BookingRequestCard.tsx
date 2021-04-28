import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BORHeader, CTDoctor, CTCalender, BORform, InfoBlue, CircleLogo } from './Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '../../theme/theme';
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
    marginTop: 8,
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
});

export interface BookingRequestCardProps extends NavigationScreenProps {
  onPress: () => void;
  doctorName: string | null;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};

export const BookingRequestCard: React.FC<BookingRequestCardProps> = (props) => {
  const { onPress, doctorName } = props;

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    steps: stepsObject[]
  ) => {
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
            </View>
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

  const renderSubmittedCard = () => {
    console.log('csk props bor card', 'here card');
    return renderCard(
      <BORHeader />,
      'How Request Appointment Works',
      'How Request Appointment Works',
      [
        { image: <BORform />, description: string.BORJourney.point1 },
        { image: <CTDoctor />, description: string.BORJourney.point2 },
        { image: <CTCalender />, description: string.BORJourney.point3 },
      ]
    );
  };

  return <View style={styles.mainView}>{renderSubmittedCard()}</View>;
};
