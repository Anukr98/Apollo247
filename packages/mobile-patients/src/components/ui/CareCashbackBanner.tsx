import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';

interface CareCashbackBannerProps {
  bannerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  bannerText?: string;
  logoStyle?: StyleProp<ImageStyle>;
}

export const CareCashbackBanner: React.FC<CareCashbackBannerProps> = (props) => {
  const { bannerStyle, textStyle, bannerText, logoStyle } = props;
  return (
    <View style={[styles.careBannerView, bannerStyle]}>
      <CircleLogo style={[styles.circleLogo, logoStyle]} />
      <Text style={[styles.careBannerText, textStyle]}>{bannerText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  careBannerView: {
    flexDirection: 'row',
  },
  careBannerText: {
    ...theme.viewStyles.text('M', 9, '#02475B', 1, 15),
    paddingVertical: 7,
    left: 5,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  },
});