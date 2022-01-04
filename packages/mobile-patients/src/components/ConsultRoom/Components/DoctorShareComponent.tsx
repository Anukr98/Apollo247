import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  InPerson,
  DoctorPlaceholderImage,
  Online,
  ApolloDoctorIcon,
  ApolloPartnerIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { calculateCircleDoctorPricing } from '@aph/mobile-patients/src/utils/commonUtils';
import { ConsultMode, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
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
    marginHorizontal: 12,
    marginTop: 4,
  },
  drImageMargins: {},
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    textTransform: 'uppercase',
  },
  doctorNameStyles: {
    paddingTop: 0,
    paddingLeft: 0,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  educationTextStyles: {
    paddingTop: 10,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  doctorLocation: {
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  goBackTextStyle: {
    marginRight: 18,
    paddingRight: 6,
    ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW_COLOR, 1, 24),
  },
  shareGoBackViewStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  doctorDescriptionTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 20, 0.3),
    margin: 16,
  },
  separatorLineViewStyle: {
    height: 1,
    backgroundColor: '#000000',
    opacity: 0.1,
    marginHorizontal: 8,
    marginTop: 16,
  },
  mainViewStyle: {
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  doctorTypeViewStyle: { alignSelf: 'flex-end', marginTop: 8, marginRight: 8 },
  doctorDetailsViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  onlinePhysicalViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  onlineViewStyle: { justifyContent: 'center', alignItems: 'center' },
  onlineTextStyle: {
    ...theme.viewStyles.text('M', 7, theme.colors.light_label),
    marginBottom: 3.5,
  },
  inPersonIconStyle: { width: 14, height: 16, marginBottom: 5 },
  inPersonViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorIconStyle: { width: 80, height: 32 },
  doctorSpecialityMainViewStyle: { flex: 1, marginTop: 20 },
  doctorSpecialityViewStyle: { flex: 1, paddingRight: 16, marginBottom: 16 },
  shareProfileBtnStyle: { width: '40%' },
});

export interface DoctorShareComponentProps {
  doctorData: any;
  onPressSharePropfile: (doctorData: any) => void;
  onPressGoBack: (doctorData: any) => void;
  selectedConsultMode?: ConsultMode | null;
  fromDoctorDetails?: boolean;
  availableModes?: ConsultMode | null;
}

export const DoctorShareComponent: React.FC<DoctorShareComponentProps> = (props) => {
  const { doctorData, selectedConsultMode, fromDoctorDetails, availableModes } = props;
  const isOnlineConsultSelected = selectedConsultMode === ConsultMode.ONLINE;
  const isPhysicalConsultSelected = selectedConsultMode === ConsultMode.PHYSICAL;
  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctorData,
    isOnlineConsultSelected,
    isPhysicalConsultSelected
  );
  const { isCircleDoctorOnSelectedConsultMode } = circleDoctorDetails;
  const isPhysical = availableModes
    ? fromDoctorDetails
      ? availableModes?.includes(ConsultMode.PHYSICAL)
      : [ConsultMode.PHYSICAL, ConsultMode.BOTH].includes(availableModes)
    : false;
  const isOnline = availableModes
    ? fromDoctorDetails
      ? availableModes?.includes(ConsultMode.ONLINE)
      : [ConsultMode.ONLINE, ConsultMode.BOTH].includes(availableModes)
    : false;
  const isBoth = availableModes
    ? fromDoctorDetails
      ? availableModes?.includes(ConsultMode.BOTH)
      : [ConsultMode.BOTH].includes(availableModes)
    : false;
  const hospitalName = g(doctorData, 'doctorHospital', '0', 'facility', 'name')
    ? g(doctorData, 'doctorHospital', '0', 'facility', 'name') + ', '
    : '';
  const hospitalCity = g(doctorData, 'doctorHospital', '0', 'facility', 'city') || '';
  const clinicAddress = fromDoctorDetails
    ? hospitalName + hospitalCity
    : doctorData?.doctorfacility;
  const doctorProfileImageUrl = fromDoctorDetails
    ? !!g(doctorData, 'photoUrl')
    : !!g(doctorData, 'thumbnailUrl');

  const renderDoctorProfile = () => {
    return (
      <View style={{ marginLeft: 3.3 }}>
        {doctorProfileImageUrl ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: doctorData?.thumbnailUrl! || doctorData?.photoUrl,
            }}
            resizeMode={'cover'}
          />
        ) : (
          <DoctorPlaceholderImage style={[styles.doctorProfile, { borderRadius: 0 }]} />
        )}
      </View>
    );
  };

  const renderSpecialities = () => {
    return (
      <View>
        <Text style={styles.doctorSpecializationStyles}>
          {doctorData?.specialtydisplayName || doctorData?.specialty?.name || ''}
        </Text>
        <Text style={styles.doctorSpecializationStyles}>
          {doctorData?.experience} YR
          {Number(doctorData?.experience) != 1 ? 'S Exp.' : ' Exp.'}
        </Text>
      </View>
    );
  };

  const doctorDescription = `${doctorData?.displayName} ${
    !!clinicAddress ? 'from ' + clinicAddress : ''
  } is one of the top ${doctorData?.specialtydisplayName ||
    doctorData?.specialty?.name ||
    ''} doctors in the country. \n\nI strongly recommend ${
    doctorData?.gender ? (doctorData?.gender === Gender.FEMALE ? 'her' : 'him') : ''
  } for any relevant health issues!\n\nYou can easily consult with ${
    doctorData?.displayName
  } online over Apollo 247 App and Website.`;

  return (
    <Overlay
      isVisible
      onRequestClose={() => props.onPressGoBack(doctorData)}
      windowBackgroundColor={'rgba(0, 0, 0, 0.3)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={styles.overlayViewStyle}>
        <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
          <View style={styles.mainViewStyle}>
            <View style={styles.doctorTypeViewStyle}>
              {doctorData?.doctorType !== 'DOCTOR_CONNECT' ? (
                <ApolloDoctorIcon style={styles.doctorIconStyle} />
              ) : (
                <ApolloPartnerIcon style={styles.doctorIconStyle} />
              )}
            </View>
            <View style={styles.doctorDetailsViewStyle}>
              <View>
                {isCircleDoctorOnSelectedConsultMode ? (
                  <ImageBackground
                    source={require('@aph/mobile-patients/src/components/ui/icons/doctor_ring.webp')}
                    style={styles.drImageBackground}
                    resizeMode="cover"
                  >
                    {renderDoctorProfile()}
                  </ImageBackground>
                ) : (
                  <View style={styles.drImageBackground}>{renderDoctorProfile()}</View>
                )}
                <View style={styles.onlinePhysicalViewStyle}>
                  {(isBoth || isOnline) && (
                    <View style={styles.onlineViewStyle}>
                      <Online />
                      <Text style={styles.onlineTextStyle}>Online</Text>
                    </View>
                  )}
                  {(isBoth || isPhysical) && (
                    <View
                      style={[
                        styles.inPersonViewStyle,
                        { marginLeft: isOnline || isBoth ? 12 : 0 },
                      ]}
                    >
                      <InPerson style={styles.inPersonIconStyle} />
                      <Text style={[styles.onlineTextStyle, { marginBottom: 5 }]}>In-Person</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.doctorSpecialityMainViewStyle}>
                <View style={styles.doctorSpecialityViewStyle}>
                  <Text style={styles.doctorNameStyles}>
                    {doctorData?.displayName}
                  </Text>
                  {renderSpecialities()}
                  <Text style={[styles.educationTextStyles]}>{doctorData?.qualification}</Text>
                  {!!clinicAddress && <Text style={styles.doctorLocation}>{clinicAddress}</Text>}
                </View>
              </View>
            </View>
            <View style={styles.separatorLineViewStyle} />
            <Text style={styles.doctorDescriptionTextStyle}>{doctorDescription}</Text>
            <View style={styles.shareGoBackViewStyle}>
              <Text style={styles.goBackTextStyle} onPress={() => props.onPressGoBack(doctorData)}>
                {'GO BACK'}
              </Text>
              <Button
                style={styles.shareProfileBtnStyle}
                title={'SHARE PROFILE'}
                onPress={() => props.onPressSharePropfile(doctorData)}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Overlay>
  );
};
