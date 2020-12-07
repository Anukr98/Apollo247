import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { calculateCircleDoctorPricing } from '@aph/mobile-patients/src/utils/commonUtils';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';

interface CareMembershipProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  isOnlineConsult?: boolean;
}

export const CareMembershipAdded: React.FC<CareMembershipProps> = (props) => {
  const { doctor, isOnlineConsult } = props;
  const circleDoctorDetails = calculateCircleDoctorPricing(doctor);
  const { onlineConsultDiscountedPrice, physicalConsultDiscountedPrice } = circleDoctorDetails;
  const discountedPrice = isOnlineConsult
    ? onlineConsultDiscountedPrice
    : physicalConsultDiscountedPrice;

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <CircleLogo style={styles.careLogo} />
        <Text style={styles.mediumFontText}>
          membership<Text style={{ color: theme.colors.SHERPA_BLUE }}> applied</Text>
        </Text>
      </View>
      <View style={styles.amountSavedView}>
        <Text style={styles.amountSavedText}>
          {string.common.amountSavedOnConsultByCare.replace('{amount}', `${discountedPrice}`)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.card(),
  },
  careLogo: {
    width: 45,
    height: 27,
    marginRight: 3,
  },
  careLogoTextStyle: {
    textTransform: 'lowercase',
    ...theme.fonts.IBMPlexSansMedium(9.5),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediumFontText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SEARCH_UNDERLINE_COLOR,
  },
  amountSavedView: {
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderRadius: 3,
    height: 32,
    backgroundColor: 'rgba(0, 179, 142, 0.07)',
    marginTop: 14,
    justifyContent: 'center',
  },
  amountSavedText: {
    ...theme.fonts.IBMPlexSansRegular(16),
    color: theme.colors.SEARCH_UNDERLINE_COLOR,
    fontWeight: '400',
    marginLeft: 8,
  },
});
