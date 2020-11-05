import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { calculateCareDoctorPricing } from '@aph/mobile-patients/src/utils/commonUtils';

interface ConsultPriceProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  doctorFees: number;
  selectedTab: string;
  coupon: string;
  couponDiscountFees: number;
  isCareSubscribed?: boolean;
  planSelected?: any;
}

export const ConsultPriceBreakup: React.FC<ConsultPriceProps> = (props) => {
  const {
    doctor,
    doctorFees,
    selectedTab,
    coupon,
    couponDiscountFees,
    isCareSubscribed,
    planSelected,
  } = props;
  const isOnlineConsult = selectedTab === 'Consult Online';
  const careDoctorDetails = calculateCareDoctorPricing(doctor);
  const {
    isCareDoctor,
    physicalConsultMRPPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultSlashedPrice,
  } = careDoctorDetails;

  const amountToPay = isCareDoctor
    ? isOnlineConsult
      ? isCareSubscribed
        ? onlineConsultSlashedPrice - couponDiscountFees
        : onlineConsultMRPPrice - couponDiscountFees
      : isCareSubscribed
      ? physicalConsultSlashedPrice - couponDiscountFees
      : physicalConsultMRPPrice - couponDiscountFees
    : Number(doctorFees) - couponDiscountFees;

  const renderCareDoctorPricing = () => {
    return (
      <View style={styles.normalRowContainer}>
        <Text
          style={[
            styles.carePrice,
            {
              textDecorationLine: isCareSubscribed || planSelected ? 'line-through' : 'none',
              ...theme.viewStyles.text(
                'M',
                16,
                isCareSubscribed || planSelected
                  ? theme.colors.BORDER_BOTTOM_COLOR
                  : theme.colors.LIGHT_BLUE
              ),
            },
          ]}
        >
          {string.common.Rs}
          {isOnlineConsult ? onlineConsultMRPPrice : physicalConsultMRPPrice}
        </Text>
        {isCareSubscribed || planSelected ? (
          <Text style={styles.regularText}>
            {string.common.Rs}
            {isOnlineConsult ? onlineConsultSlashedPrice : physicalConsultSlashedPrice}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderNonCareDoctorPricing = () => {
    return (
      <Text style={styles.regularText}>
        {string.common.Rs} {Number(doctorFees)}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={styles.regularText}>
          {string.common.subtotal}{' '}
          {`${isCareDoctor && (isCareSubscribed || planSelected) ? '(Care Price)' : ''}`}
        </Text>
        {isCareDoctor ? renderCareDoctorPricing() : renderNonCareDoctorPricing()}
      </View>
      {planSelected ? (
        <View style={[styles.rowContainer, { marginTop: 4 }]}>
          <Text style={styles.regularText}>{string.common.careMembership}</Text>
          <Text style={styles.regularText}>
            {string.common.Rs} {planSelected?.currentSellingPrice}
          </Text>
        </View>
      ) : null}

      {coupon ? (
        <View style={[styles.rowContainer, { marginTop: 4 }]}>
          <View>
            <Text style={styles.couponText}>{string.common.couponApplied}</Text>
            <Text style={styles.couponText}>({`${coupon}`})</Text>
          </View>
          <Text style={styles.couponText}>
            - {string.common.Rs} {couponDiscountFees}
          </Text>
        </View>
      ) : null}
      <View style={styles.seperatorLine} />
      <View style={styles.rowContainer}>
        <Text style={styles.regularText}>{string.common.toPay}</Text>
        <Text style={{ ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE) }}>
          {string.common.Rs}{' '}
          {planSelected
            ? isOnlineConsult
              ? onlineConsultSlashedPrice -
                couponDiscountFees +
                Number(planSelected?.currentSellingPrice)
              : physicalConsultSlashedPrice -
                couponDiscountFees +
                Number(planSelected?.currentSellingPrice)
            : amountToPay}
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regularText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  seperatorLine: {
    marginVertical: 12,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  normalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carePrice: {
    ...theme.viewStyles.text('M', 16, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginRight: 4,
  },
  couponText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE),
  },
});
