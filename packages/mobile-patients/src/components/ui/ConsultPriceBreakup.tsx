import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';

interface ConsultPriceProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  doctorFees: number;
  selectedTab: string;
  coupon: string;
  couponDiscountFees: number;
  circleSubscriptionId?: string;
  planSelected?: any;
  bookingFee: number;
  isBookingFeeExempted: boolean;
}

export const ConsultPriceBreakup: React.FC<ConsultPriceProps> = (props) => {
  const {
    doctor,
    doctorFees,
    selectedTab,
    coupon,
    couponDiscountFees,
    circleSubscriptionId,
    planSelected,
    bookingFee,
    isBookingFeeExempted,
  } = props;
  const isOnlineConsult =
    selectedTab === string.consultModeTab.VIDEO_CONSULT ||
    selectedTab === string.consultModeTab.CONSULT_ONLINE;
  const isPhysicalConsult = isPhysicalConsultation(selectedTab);
  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctor,
    isOnlineConsult,
    isPhysicalConsult
  );
  const {
    physicalConsultMRPPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultSlashedPrice,
    isCircleDoctorOnSelectedConsultMode,
    cashbackAmount,
    cashbackEnabled,
  } = circleDoctorDetails;

  const onlineConsultPrice = cashbackEnabled ? onlineConsultMRPPrice : onlineConsultSlashedPrice;
  const amountToPay = isCircleDoctorOnSelectedConsultMode
    ? isOnlineConsult
      ? circleSubscriptionId
        ? onlineConsultPrice - couponDiscountFees
        : onlineConsultMRPPrice - couponDiscountFees
      : circleSubscriptionId
      ? physicalConsultSlashedPrice - couponDiscountFees
      : physicalConsultMRPPrice - couponDiscountFees
    : Number(doctorFees) - couponDiscountFees;

  const finalBookingFee = isBookingFeeExempted ? 0 : bookingFee;
  const isCirclePricing = !!circleSubscriptionId || planSelected;

  const renderCareDoctorPricing = () => {
    return (
      <View style={styles.normalRowContainer}>
        <Text style={isCirclePricing && !cashbackEnabled ? styles.slicedText : styles.regularText}>
          {string.common.Rs}
          {convertNumberToDecimal(
            isOnlineConsult ? onlineConsultMRPPrice : physicalConsultMRPPrice
          )}
        </Text>
        {isCirclePricing && !cashbackEnabled ? (
          <Text style={styles.regularText}>
            {string.common.Rs}
            {convertNumberToDecimal(
              isOnlineConsult ? onlineConsultPrice : physicalConsultSlashedPrice
            )}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderNonCareDoctorPricing = () => {
    return (
      <Text style={styles.regularText}>
        {string.common.Rs}
        {convertNumberToDecimal(Number(doctorFees))}
      </Text>
    );
  };

  const renderBookingFee = () => {
    return (
      <View style={styles.normalRowContainer}>
        {isBookingFeeExempted && (
          <Text style={styles.slicedText}>{string.common.Rs + bookingFee}</Text>
        )}
        <Text style={styles.regularText}>
          {string.common.Rs + (isBookingFeeExempted ? '0' : bookingFee)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={styles.regularText}>
          {string.common.consultFee}{' '}
          {`${
            isCircleDoctorOnSelectedConsultMode && (!!circleSubscriptionId || planSelected)
              ? '(CIRCLE Price)'
              : ''
          }`}
        </Text>
        {isCircleDoctorOnSelectedConsultMode
          ? renderCareDoctorPricing()
          : renderNonCareDoctorPricing()}
      </View>
      {!circleSubscriptionId && planSelected && isCircleDoctorOnSelectedConsultMode ? (
        <View style={[styles.rowContainer, { marginTop: 4 }]}>
          <Text style={styles.regularText}>{string.common.careMembership}</Text>
          <Text style={styles.regularText}>
            {string.common.Rs}
            {convertNumberToDecimal(planSelected?.currentSellingPrice)}
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
            - {string.common.Rs}
            {convertNumberToDecimal(couponDiscountFees)}
          </Text>
        </View>
      ) : null}
      <View style={[styles.rowContainer, { marginTop: 8 }]}>
        <Text style={styles.regularText}>{string.common.bookingFee}</Text>
        {renderBookingFee()}
      </View>
      <View style={styles.seperatorLine} />
      <View style={styles.rowContainer}>
        <Text style={styles.regularText}>{string.common.toPay}</Text>
        <Text style={{ ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE) }}>
          {string.common.Rs}
          {planSelected && isCircleDoctorOnSelectedConsultMode
            ? isOnlineConsult
              ? convertNumberToDecimal(
                  onlineConsultPrice -
                    couponDiscountFees +
                    finalBookingFee +
                    (!circleSubscriptionId ? Number(planSelected?.currentSellingPrice) : 0)
                )
              : convertNumberToDecimal(
                  physicalConsultSlashedPrice -
                    couponDiscountFees +
                    Number(planSelected?.currentSellingPrice) +
                    finalBookingFee
                )
            : convertNumberToDecimal(amountToPay + finalBookingFee)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    ...theme.viewStyles.card(10),
    paddingVertical: 16,
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
  couponText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE),
  },
  slicedText: {
    ...theme.viewStyles.text('M', 14, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginEnd: 4,
  },
});
