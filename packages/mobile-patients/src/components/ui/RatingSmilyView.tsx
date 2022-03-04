import {
  Good,
  GoodSelected,
  Great,
  GreatSelected,
  Okay,
  OkaySelected,
  Poor,
  PoorSelected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  commonText: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#02475b',
    textAlign: 'center',
    marginTop: 12,
  },
  iconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 28,
    marginRight: 28,
    marginTop: 15,
  },
});

export type RatingStatus = 'POOR' | 'OKAY' | 'GOOD' | 'GREAT' | undefined;

export interface RatingSmilyViewProps {
  status: RatingStatus;
  onStatusChange: (status: RatingStatus) => void;
  style?: StyleProp<ViewStyle>;
}

export const RatingSmilyView: React.FC<RatingSmilyViewProps> = (props) => {
  const { status, onStatusChange } = props;

  const feedback: {
    [id: number]: {
      cardName: RatingStatus;
      cardIcon: Element;
      cardSelectedIcon: Element;
    };
  } = {
    1: {
      cardName: 'POOR',
      cardIcon: <Poor />,
      cardSelectedIcon: <PoorSelected />,
    },
    2: {
      cardName: 'OKAY',
      cardIcon: <Okay />,
      cardSelectedIcon: <OkaySelected />,
    },
    3: {
      cardName: 'GOOD',
      cardIcon: <Good />,
      cardSelectedIcon: <GoodSelected />,
    },
    4: {
      cardName: 'GREAT',
      cardIcon: <Great />,
      cardSelectedIcon: <GreatSelected />,
    },
  };

  return (
    <View style={[styles.iconView, props.style]}>
      {Object.keys(feedback).map((key, i, array) => {
        const { cardIcon, cardName, cardSelectedIcon } = feedback[parseInt(key)];
        return (
          <View>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                onStatusChange(cardName);
              }}
            >
              {cardName === status ? cardSelectedIcon : cardIcon}
            </TouchableOpacity>
            <Text style={styles.commonText}>{cardName}</Text>
          </View>
        );
      })}
    </View>
  );
};
