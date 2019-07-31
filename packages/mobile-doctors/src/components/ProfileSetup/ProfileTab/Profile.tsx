import { StarDoctorsTeam } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/StarDoctorsTeam';
import { Star } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { GetDoctorProfile_getDoctorProfile } from '@aph/mobile-doctors/src/graphql/types/getDoctorProfile';

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
  profileData: GetDoctorProfile_getDoctorProfile;
}

export const Profile: React.FC<ProfileProps> = ({ profileData }) => {
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
    `${(speciality || '').toUpperCase()}     |   ${experience}YRS`;

  return (
    <View style={styles.container}>
      <SquareCardWithTitle title="Your Profile" containerStyle={{ marginTop: 16 }}>
        <View style={styles.cardView}>
          <View style={{ overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
            {profileData!.profile!.photoUrl ? (
              <Image
                style={styles.imageview}
                source={{
                  uri: profileData!.profile!.photoUrl,
                }}
              />
            ) : (
              <Image
                style={styles.imageview}
                source={require('../../../images/doctor/doctor.png')}
              />
            )}
          </View>
          {profileData!.profile!.isStarDoctor ? <Star style={styles.starIconStyle}></Star> : null}
          <View style={styles.columnContainer}>
            <Text style={styles.drname}>
              {`Dr. ${profileData!.profile!.firstName} ${profileData!.profile!.lastName}`}
            </Text>
            <Text style={styles.drnametext}>
              {formatSpecialityAndExperience(
                profileData!.profile!.speciality,
                profileData!.profile!.experience || ''
              )}
            </Text>
            <View style={styles.understatusline} />
          </View>
          {profileRow('Education', profileData!.profile!.education)}
          {profileRow('Speciality', profileData!.profile!.speciality)}
          {profileRow('Services', profileData!.profile!.services || '')}
          {profileRow('Awards', profileData!.profile!.awards || '')}
          {profileRow('Speaks', (profileData!.profile!.languages || '').split(',').join(', '))}
          {profileRow('MCI Number', profileData!.profile!.registrationNumber)}
          {profileRow(
            'In-person Consult Location',
            [
              profileData!.clinics![0]!.addressLine1,
              profileData!.clinics![0]!.addressLine2,
              profileData!.clinics![0]!.addressLine3,
            ].join(', ')
          )}
        </View>
      </SquareCardWithTitle>
      <StarDoctorsTeam profileData={profileData} />
    </View>
  );
};
