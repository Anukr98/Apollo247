import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DoctorPlaceholderImage } from '@aph/mobile-patients/src/components/ui/Icons';
import { CareLogo } from '@aph/mobile-patients/src/components/ui/CareLogo';
import string from '@aph/mobile-patients/src/strings/strings.json';
const { width } = Dimensions.get('window');

interface DoctorCheckoutProps {}

export const DoctorCheckoutCard: React.FC<DoctorCheckoutProps> = (props) => {
  return (
    <View style={styles.doctorCard}>
      <View style={styles.rowContainer}>
        <View style={{ width: width - 140 }}>
          <Text style={styles.doctorNameStyle}>Dr. Simran Rai</Text>
          <Text style={styles.specializationStyle}>GENERAL PHYSICIAN | 7 YRS Exp.</Text>
          <Text style={styles.regularText}>{string.common.optedForOnlineConsultation}</Text>
          <Text style={styles.appointmentTimeStyle}>Today, 6:30 pm</Text>
        </View>
        <View>
          <DoctorPlaceholderImage />
          <CareLogo style={styles.careLogo} textStyle={styles.careLogoText} />
        </View>
      </View>
      <View style={styles.seperatorLine} />
      <View style={[styles.rowContainer, { marginTop: 9 }]}>
        <Text style={[styles.regularText, { marginTop: 0 }]}>{string.common.amountToPay}</Text>
        <View>
          <View style={styles.normalRowContainer}>
            <Text style={styles.carePrice}>
              {string.common.Rs}
              500
            </Text>
            <Text style={styles.careDiscountedPrice}>
              {string.common.Rs}
              400
            </Text>
          </View>
          <Text style={styles.amountSavedTextStyle}>
            {string.common.amountSavedByCare.replace('{amount}', '100')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  doctorNameStyle: {
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(23),
    color: theme.colors.SEARCH_DOCTOR_NAME,
    marginTop: 4,
  },
  doctorCard: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.CARD_BG,
    borderRadius: 0,
    marginTop: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  specializationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    marginTop: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careLogo: {
    marginTop: 10,
    width: 73,
    height: 29,
    borderRadius: 14,
    alignSelf: 'center',
  },
  careLogoText: {
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  regularText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginTop: 18,
  },
  appointmentTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
    marginTop: 10,
  },
  seperatorLine: {
    marginTop: 14,
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  carePrice: {
    ...theme.viewStyles.text('M', 15, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  careDiscountedPrice: {
    ...theme.viewStyles.text('M', 12, theme.colors.DEEP_RED),
    marginLeft: 6,
  },
  normalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountSavedTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.DEEP_RED,
    marginTop: 2,
  },
});
