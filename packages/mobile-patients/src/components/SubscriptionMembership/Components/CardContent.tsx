import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface CardContentProps {
  heading: string;
  bodyText: string;
  icon: string | null;
  isActivePlan: boolean;
  iconElement?: Element; 
}

export const CardContent: React.FC<CardContentProps> = (props) => {
  const { heading, bodyText, icon, isActivePlan, iconElement } = props;
  const iconPngPath = icon ? icon.replace('.svg', '.png') : null; 
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={styles.redeemableCardsHeading}>{heading}</Text>
        {iconPngPath && isActivePlan && (
          <Image
            style={{
              width: 25,
              height: 25,
              resizeMode: 'contain',
            }}
            source={{
              uri: iconPngPath,
            }}
            resizeMode={'contain'}
          />
        )}
        {iconElement}
      </View>
      <Text style={styles.redeemableCardsText}>{bodyText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  redeemableCardsHeading: {
    ...theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35),
    width: '80%',
    marginBottom: 10,
  },
  redeemableCardsText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20, 0.35),
    width: '75%',
  },
});