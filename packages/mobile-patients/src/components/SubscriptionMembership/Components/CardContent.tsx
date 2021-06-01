import React from 'react';
import { StyleSheet, View, Text, Image, StyleProp, ImageStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface CardContentProps {
  heading: string;
  bodyText: string;
  icon: string | null;
  isActivePlan: boolean;
  iconElement?: Element;
  isExpired?: boolean;
  imageStyle?: StyleProp<ImageStyle>;
  isCorporateCard?: boolean;
}

export const CardContent: React.FC<CardContentProps> = (props) => {
  const {
    heading,
    bodyText,
    icon,
    isActivePlan,
    iconElement,
    isExpired,
    imageStyle,
    isCorporateCard,
  } = props;
  const iconPngPath = icon ? icon.replace('.svg', '.png') : null;
  return (
    <View style={isCorporateCard ? styles.flexRow : {}}>
      <View style={isCorporateCard ? { width: '70%' } : {}}>
        <View style={isCorporateCard ? {} : styles.flexRow}>
          <Text
            style={[
              styles.redeemableCardsHeading,
              theme.viewStyles.text('SB', 14, isExpired ? '#979797' : '#02475B', 1, 18.2, 0.35),
            ]}
          >
            {heading}
          </Text>
          {iconPngPath && isActivePlan && !isCorporateCard && (
            <Image
              style={{
                width: 25,
                height: 25,
                resizeMode: 'contain',
                opacity: isExpired ? 0.5 : 1,
              }}
              source={{
                uri: iconPngPath,
              }}
              resizeMode={'contain'}
            />
          )}
          {iconElement}
        </View>
        <Text
          style={[
            styles.redeemableCardsText,
            theme.viewStyles.text('R', 11, isExpired ? '#979797' : '#02475B', 1, 16, 0.35),
          ]}
        >
          {bodyText}
        </Text>
      </View>
      {!!isCorporateCard && !!imageStyle && (
        <Image
          style={imageStyle}
          source={{
            uri: iconPngPath,
          }}
          resizeMode={'contain'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  redeemableCardsHeading: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 18.2, 0.35),
    width: '80%',
    marginBottom: 10,
  },
  redeemableCardsText: {
    ...theme.viewStyles.text('R', 11, '#02475B', 1, 16, 0.35),
    width: '75%',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
