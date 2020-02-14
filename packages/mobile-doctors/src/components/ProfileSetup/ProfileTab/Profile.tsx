import { StarDoctorsTeam } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/StarDoctorsTeam';
import { Star } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f4f5',
  },
  understatusline: {
    width: '95%',
    backgroundColor: '#02475b',
    marginTop: 11,
    opacity: 0.1,
    marginBottom: 16,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 1,
      }
    ),
  },
  education: {
    color: '#658f9b',
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  educationtext: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 2,
  },
  cardView: {
    margin: 16,
    ...theme.viewStyles.whiteRoundedCornerCard,
  },
  imageview: {
    height: 141,
    marginBottom: 16,
  },
  drname: {
    ...theme.fonts.IBMPlexSansSemiBold(20),
    color: '#02475b',
  },
  drnametext: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087ba',
    lineHeight: 16,
    marginTop: 4,
  },
  starIconStyle: {
    position: 'absolute',
    right: 16,
    top: 141 - 28,
  },
  columnContainer: {
    flexDirection: 'column',
    marginLeft: 16,
  },
});

export interface ProfileProps {
  profileData: GetDoctorDetails_getDoctorDetails;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profileData, scrollViewRef, onReload }) => {
  const profileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.columnContainer}>
        <Text style={styles.education}>{title}</Text>
        <Text style={styles.educationtext}>{description}</Text>
      </View>
    );
  };

  const formatSpecialityAndExperience = (speciality: string, experience: string) =>
    `${(speciality || '').toUpperCase()}     |   ${experience}${strings.common.yrs}`;

  const getFormattedLocation = () => {
    let location = '';
    try {
      location = [
        profileData.doctorHospital[0].facility.streetLine1,
        profileData.doctorHospital[0].facility.streetLine2,
        profileData.doctorHospital[0].facility.streetLine3,
        profileData.doctorHospital[0].facility.city,
        profileData.doctorHospital[0].facility.state,
        profileData.doctorHospital[0].facility.country,
      ]
        // .filter((data) => console.log('data', data))
        .filter(Boolean)
        .join(', ');
    } catch (e) {
      CommonBugFender('Get_Formatted_Location_Profile', e);
      console.log(e);
    }
    return location;
  };

  return (
    <View style={styles.container}>
      <SquareCardWithTitle title={strings.account.your_profile} containerStyle={{ marginTop: 0 }}>
        <View style={styles.cardView}>
          <View style={{ overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
            {profileData!.photoUrl ? (
              // <Image
              //   style={styles.imageview}
              //   source={{
              //     uri: profileData!.photoUrl,
              //   }}
              // />
              <Image
                style={styles.imageview}
                source={require('../../../images/doctor/doctor.png')}
              />
            ) : (
              <Image
                style={styles.imageview}
                source={require('../../../images/doctor/doctor.png')}
              />
            )}
          </View>
          {profileData!.doctorType == 'STAR_APOLLO' ? (
            <Star style={styles.starIconStyle}></Star>
          ) : null}
          <View style={styles.columnContainer}>
            <Text style={[styles.drname]} numberOfLines={1}>
              {`${strings.common.dr} ${profileData!.firstName} ${profileData!.lastName}`}
            </Text>
            <Text style={styles.drnametext}>
              {formatSpecialityAndExperience(
                profileData!.specialty!.name,
                profileData!.experience || ''
              )}
            </Text>
            <View style={styles.understatusline} />
          </View>
          {profileRow(strings.account.education, profileData!.qualification!)}
          {profileRow(strings.account.speciality, profileData!.specialty!.name!)}
          {profileRow(strings.account.services, profileData!.specialization || '')}
          {profileRow(
            strings.account.awards,
            (profileData!.awards || '')
              .replace('&amp;', '&')
              .replace(/<\/?[^>]+>/gi, '')
              .trim()
          )}
          {profileRow(strings.account.speaks, (profileData!.languages || '').split(',').join(', '))}
          {profileRow(strings.account.mci_num, profileData!.registrationNumber)}
          {profileRow(strings.account.in_person_consult_loc, getFormattedLocation())}
        </View>
      </SquareCardWithTitle>
      {profileData!.doctorType == 'STAR_APOLLO' ? (
        <StarDoctorsTeam
          profileData={profileData}
          scrollViewRef={scrollViewRef}
          onReload={onReload}
        />
      ) : null}
      {/* <StarDoctorsTeam profileData={profileData} /> */}
    </View>
  );
};
