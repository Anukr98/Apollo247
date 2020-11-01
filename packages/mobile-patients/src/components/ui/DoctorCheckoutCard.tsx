import React from 'react';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DoctorPlaceholderImage, Location } from '@aph/mobile-patients/src/components/ui/Icons';
import { CareLogo } from '@aph/mobile-patients/src/components/ui/CareLogo';
import string from '@aph/mobile-patients/src/strings/strings.json';
const { width } = Dimensions.get('window');
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { BookAppointmentInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { dateFormatter } from '@aph/mobile-patients/src/utils/dateUtil';
import { calculateCareDoctorPricing } from '@aph/mobile-patients/src/utils/commonUtils';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface DoctorCheckoutProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  appointmentInput: BookAppointmentInput;
  doctorFees: number;
  selectedTab: string;
  isCareSubscribed?: boolean;
  planSelected?: any;
}

export const DoctorCheckoutCard: React.FC<DoctorCheckoutProps> = (props) => {
  const {
    doctor,
    appointmentInput,
    doctorFees,
    selectedTab,
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
    minDiscountedPrice,
  } = careDoctorDetails;

  const renderCareDoctorPricing = () => {
    return (
      <View>
        <View style={styles.normalRowContainer}>
          <Text
            style={[
              styles.carePrice,
              {
                textDecorationLine: isCareSubscribed || planSelected ? 'line-through' : 'none',
                ...theme.viewStyles.text(
                  'M',
                  15,
                  isCareSubscribed || planSelected
                    ? theme.colors.BORDER_BOTTOM_COLOR
                    : theme.colors.SKY_BLUE
                ),
              },
            ]}
          >
            {string.common.Rs}
            {isOnlineConsult ? onlineConsultMRPPrice : physicalConsultMRPPrice}
          </Text>
          {isCareSubscribed || planSelected ? (
            <Text style={styles.careDiscountedPrice}>
              {string.common.Rs}
              {isOnlineConsult ? onlineConsultSlashedPrice : physicalConsultSlashedPrice}
            </Text>
          ) : null}
        </View>
        {isCareSubscribed || planSelected ? (
          <Text style={styles.amountSavedTextStyle}>
            {string.common.amountSavedByCare.replace('{amount}', `${minDiscountedPrice}`)}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderNonCareDoctorPricing = () => {
    return (
      <Text style={styles.doctorFees}>{`${string.common.Rs} ${Number(doctorFees).toFixed(
        2
      )}`}</Text>
    );
  };
  return (
    <View style={styles.doctorCard}>
      <View style={styles.rowContainer}>
        <View style={{ width: width - 140 }}>
          <Text style={styles.doctorNameStyle}>{doctor?.displayName}</Text>
          <Text style={styles.specializationStyle}>
            {doctor?.specialty?.name || ''} | {doctor?.experience} YR
            {Number(doctor?.experience) != 1 ? 'S Exp.' : ' Exp.'}
          </Text>
          <Text style={styles.regularText}>
            {isOnlineConsult
              ? string.common.optedForOnlineConsultation
              : string.common.optedForClinicConsultation}
          </Text>
          {!isOnlineConsult && (
            <View>
              <View style={styles.row}>
                <Location />
                <Text style={[styles.regularText, { marginTop: 0 }]}>{`${
                  doctor?.doctorHospital?.[0].facility?.streetLine1
                }, ${
                  doctor?.doctorHospital?.[0].facility?.streetLine2
                    ? `${doctor?.doctorHospital?.[0].facility?.streetLine2}, `
                    : ''
                }${doctor?.doctorHospital?.[0].facility?.city}`}</Text>
              </View>
            </View>
          )}
          <Text style={styles.appointmentTimeStyle}>
            {dateFormatter(appointmentInput?.appointmentDateTime)}
          </Text>
        </View>
        <View>
          {!!g(doctor, 'photoUrl') ? (
            <Image
              style={{
                height: 80,
                borderRadius: 40,
                width: 80,
              }}
              source={{
                uri: doctor?.photoUrl!,
              }}
              resizeMode={'contain'}
            />
          ) : (
            <DoctorPlaceholderImage />
          )}
          {isCareDoctor && <CareLogo style={styles.careLogo} textStyle={styles.careLogoText} />}
        </View>
      </View>
      <View style={styles.seperatorLine} />
      <View style={[styles.rowContainer, { marginTop: 9 }]}>
        <Text style={[styles.regularText, { marginTop: 0 }]}>{string.common.amountToPay}</Text>
        {isCareDoctor ? renderCareDoctorPricing() : renderNonCareDoctorPricing()}
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
    height: 0.5,
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
  doctorFees: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
});
