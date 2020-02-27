import {
  Great,
  GreatSelected,
  Okay,
  OkaySelected,
  Poor,
  PoorSelected,
  TopIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import RatingCardStyles from '@aph/mobile-doctors/src/components/ui/RatingCard.styles';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

const styles = RatingCardStyles;

export interface CardProps {
  cardContainer?: StyleProp<ViewStyle>;
  icon?: Element;
  doctorName?: string;
  todayDate?: string;
  timeText?: string;
  patientName?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  disableButton?: boolean;
  buttonIcon?: React.ReactNode;
  onClickButton?: TouchableOpacityProps['onPress'];
}

export const RatingCard: React.FC<CardProps> = (props) => {
  const [selectedId, setSelectedId] = useState<number>(0);

  const feedback: {
    [id: number]: {
      cardName: string;
      cardIcon: Element;
      cardSelectedIcon: Element;
    };
  } = {
    1: {
      cardName: 'Poor',
      cardIcon: <Poor />,
      cardSelectedIcon: <PoorSelected />,
    },
    2: {
      cardName: 'Okay',
      cardIcon: <Okay />,
      cardSelectedIcon: <OkaySelected />,
    },
    3: {
      cardName: 'Great',
      cardIcon: <Great />,
      cardSelectedIcon: <GreatSelected />,
    },
  };

  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      <View style={{ alignItems: 'flex-end', marginTop: -40 }}>
        <TopIcon />
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 15 }}>
        <View style={{ marginBottom: 6, marginTop: 10 }}>{props.icon}</View>
        <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(23), color: '#02475b' }}>
          {props.doctorName}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.todayText}>{props.todayDate}</Text>
          <View style={styles.line}></View>
          <Text style={styles.todayText}>{props.timeText}</Text>
        </View>
      </View>
      <View style={styles.underline}></View>
      <Text style={styles.doctorName}>{props.patientName}</Text>
      <Text
        style={{
          ...theme.fonts.IBMPlexSansMedium(17),
          color: '#0087ba',
          marginBottom: 8,
          lineHeight: 24,
        }}
      >
        {strings.common.consultation_experience}
      </Text>
      <View style={styles.iconView}>
        {Object.keys(feedback).map((key, i, array) => {
          const { cardIcon, cardName, cardSelectedIcon } = feedback[parseInt(key, 10)];
          return (
            <View>
              <TouchableOpacity onPress={() => setSelectedId(parseInt(key, 10))}>
                {parseInt(key, 10) !== selectedId ? cardIcon : cardSelectedIcon}
              </TouchableOpacity>
              <Text style={styles.commonText}>{cardName}</Text>
            </View>
          );
        })}
      </View>
      {props.children}
    </View>
  );
};
