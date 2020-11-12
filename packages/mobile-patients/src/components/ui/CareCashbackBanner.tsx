import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';

interface CareCashbackBannerProps {
  bannerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  bannerText?: string;
}

export const CareCashbackBanner: React.FC<CareCashbackBannerProps> = (props) => {
  const { bannerStyle, textStyle, bannerText } = props;
  return (
    <View style={[styles.careBannerView, bannerStyle]}>
      <CircleLogo style={{
        resizeMode: 'contain',
        width: 40,
        height: 30,
      }} />
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
  },
});