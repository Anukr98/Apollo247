import React from 'react';
import { View, Text, Dimensions, StyleSheet, Image, ImageBackground } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  DoctorPlaceholderImage,
  Location,
  CircleLogo,
  OnlineAppointmentMarkerIcon,
  AppointmentCalendarIcon,
  PhysicalAppointmentMarkerIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
const { width } = Dimensions.get('window');
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { BookAppointmentInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { dateFormatter } from '@aph/mobile-patients/src/utils/dateUtil';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface DoctorCheckoutProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  appointmentInput: BookAppointmentInput;
  doctorFees: number;
  selectedTab: string;
  circleSubscriptionId?: string;
  planSelected?: any;
}

export const DoctorCheckoutCard: React.FC<DoctorCheckoutProps> = (props) => {
  const {
    doctor,
    appointmentInput,
    doctorFees,
    selectedTab,
    circleSubscriptionId,
    planSelected,
  } = props;
  const isOnlineConsult = selectedTab === 'Consult Online';
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
    onlineConsultDiscountedPrice,
    physicalConsultDiscountedPrice,
    isCircleDoctorOnSelectedConsultMode,
  } = circleDoctorDetails;
  const discountedPrice = isOnlineConsult
    ? onlineConsultDiscountedPrice
    : physicalConsultDiscountedPrice;

  const renderCareDoctorPricing = () => {
    return (
      <View>
        <View style={styles.normalRowContainer}>
          <Text
            style={[
              styles.carePrice,
              {
                textDecorationLine: circleSubscriptionId || planSelected ? 'line-through' : 'none',
                ...theme.viewStyles.text(
                  'M',
                  15,
                  circleSubscriptionId || planSelected
                    ? theme.colors.BORDER_BOTTOM_COLOR
                    : theme.colors.SKY_BLUE
                ),
              },
            ]}
          >
            {string.common.Rs}
            {convertNumberToDecimal(
              isOnlineConsult ? onlineConsultMRPPrice : physicalConsultMRPPrice
            )}
          </Text>
          {!!circleSubscriptionId || planSelected ? (
            <Text style={styles.careDiscountedPrice}>
              {string.common.Rs}
              {convertNumberToDecimal(
                isOnlineConsult ? onlineConsultSlashedPrice : physicalConsultSlashedPrice
              )}
            </Text>
          ) : null}
        </View>
        {!!circleSubscriptionId || planSelected ? (
          <Text style={styles.amountSavedTextStyle}>
            {string.circleDoctors.circleSavings.replace(
              '{amount}',
              `${convertNumberToDecimal(discountedPrice)}`
            )}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderNonCareDoctorPricing = () => {
    return <Text style={styles.doctorFees}>{`${string.common.Rs}${Number(doctorFees)}`}</Text>;
  };

  const renderDoctorProfile = () => {
    return (
      <View style={{ marginLeft: isCircleDoctorOnSelectedConsultMode ? 3.5 : 0 }}>
        {!!g(doctor, 'photoUrl') ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: doctor?.photoUrl!,
            }}
            resizeMode={'contain'}
          />
        ) : (
          <DoctorPlaceholderImage />
        )}
      </View>
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
          <View style={styles.doctorPointers}>
            <OnlineAppointmentMarkerIcon style={styles.doctorPointersImage} />
            <Text style={styles.appointmentTimeStyle}>Online Consultation</Text>
          </View>
        </View>
        <View>
          {isCircleDoctorOnSelectedConsultMode ? (
            <ImageBackground
              source={require('@aph/mobile-patients/src/components/ui/icons/doctor_ring.png')}
              style={styles.drImageBackground}
              resizeMode="contain"
            >
              {renderDoctorProfile()}
            </ImageBackground>
          ) : (
            <View>{renderDoctorProfile()}</View>
          )}
          {isCircleDoctorOnSelectedConsultMode && <CircleLogo style={styles.careLogo} />}
        </View>
      </View>
      {!isOnlineConsult && (
        <View style={{ width: isCircleDoctorOnSelectedConsultMode ? width - 140 : width - 40 }}>
          <View style={styles.row}>
            <Location />
            <View style={{ flex: 1 }}>
              <Text style={[styles.regularText, { marginTop: 0, flexWrap: 'wrap' }]}>
                {`${doctor?.doctorHospital?.[0].facility?.streetLine1}, ${
                  doctor?.doctorHospital?.[0].facility?.streetLine2
                    ? `${doctor?.doctorHospital?.[0].facility?.streetLine2}, `
                    : ''
                }${doctor?.doctorHospital?.[0].facility?.city}`}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.doctorPointers, { marginTop: -1 }]}>
        <AppointmentCalendarIcon style={styles.doctorPointersImage} />
        <Text style={styles.appointmentTimeStyle}>
          {dateFormatter(appointmentInput?.appointmentDateTime)}
        </Text>
      </View>
      <View style={styles.seperatorLine} />
      <View style={[styles.rowContainer, { marginTop: 9 }]}>
        <Text style={[styles.regularText, { marginTop: 0 }]}>{string.common.amountToPay}</Text>
        {isCircleDoctorOnSelectedConsultMode
          ? renderCareDoctorPricing()
          : renderNonCareDoctorPricing()}
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
    width: 30,
    height: 18,
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
    color: '#02475B',
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
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW),
    marginLeft: 6,
  },
  normalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountSavedTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.APP_YELLOW,
    marginTop: 2,
  },
  doctorFees: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
  },
  row: {
    flexDirection: 'row',
    marginTop: 7,
  },
  doctorProfile: {
    height: 80,
    borderRadius: 40,
    width: 80,
    alignSelf: 'center',
  },
  drImageBackground: {
    height: 95,
    width: 95,
    justifyContent: 'center',
  },
  doctorPointers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  doctorPointersImage: {
    width: 14,
    height: '100%',
    marginRight: 8,
  },
});
