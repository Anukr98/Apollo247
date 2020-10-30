import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface CareCashbackBannerProps {
  bannerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  bannerText?: string;
}

export const CareCashbackBanner: React.FC<CareCashbackBannerProps> = (props) => {
  const { bannerStyle, textStyle, bannerText } = props;
  return (
    <View style={[styles.careBannerView, bannerStyle]}>
      <Text style={[styles.careBannerText, textStyle]}>{bannerText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  careBannerView: {
    backgroundColor: '#F0533B',
    left: -15,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  careBannerText: {
    ...theme.viewStyles.text('M', 10, '#FFFFFF', 1, 15),
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});