import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CheckedIcon } from '../../ui/Icons';
import { CareCashbackBanner } from '../../ui/CareCashbackBanner';

export interface ApplyCircleBenefitsProps {}

export const ApplyCircleBenefits: React.FC<ApplyCircleBenefitsProps> = (props) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.applyBenefits} onPress={() => {}}>
      <View style={{ flexDirection: 'row' }}>
        <CheckedIcon style={{ marginTop: 8, marginRight: 4 }} />
        <CareCashbackBanner
          bannerText={`benefits APPLIED!`}
          textStyle={styles.circleText}
          logoStyle={styles.circleLogo}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  applyBenefits: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 15,
    marginTop: 10,
    padding: 10,
  },
  circleText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 40,
  },
});
