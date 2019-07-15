import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, Alert } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { theme } from 'app/src/theme/theme';
import { Header } from 'app/src/components/ui/Header';
import { TabBar } from 'app/src/components/TabBar';
import { Button } from 'app/src/components/ui/Button';
import { RoundIcon, Star } from 'app/src/components/ui/Icons';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  profileName: {
    ...theme.fonts.IBMPlexSansSemiBold(28),
    color: '#02475b',
    marginTop: 16,
  },
  profileDescription: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  statusBarline: {
    width: '100%',
    backgroundColor: '#f0f4f5',
    marginTop: 20,
    opacity: 0.5,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 2.5,
      }
    ),
  },
  understatusline: {
    width: '95%',
    backgroundColor: '#02475b',
    marginTop: 11,
    opacity: 0.3,
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
  yourprofiletext: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    marginBottom: 16,
  },

  buttonView: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fc9916',
    width: 240,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },

  cardview: {
    margin: 0,
    backgroundColor: '#ffffff',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 10,
    overflow: 'hidden',
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
});

type ProfileData = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  experience: string;
  speciality: string;
  isStarDoctor: boolean;
  education: string;
  services: string;
  languages: string;
  city: string;
  awards: string;
  mcinumber: string;
  inpersonconsult: string;
  designation: string;
};
export interface ProfilePageProps extends NavigationScreenProps {}

export const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const profileObject: ProfileData = {
    firstName: 'Sujane',
    lastName: 'Smith',
    mobileNumber: '1234567890',
    experience: '7',
    speciality: 'Gynacology',
    isStarDoctor: true,
    education: 'MBBS',
    services: 'Consultations, Surgery',
    languages: 'English,Hindi,Telgu',
    city: 'Hyderabad',
    awards: 'Ramon Magsaysay Award',
    mcinumber: '1234',
    inpersonconsult: '20 Orchard Avenue, Hiranandani, PowaiMumbai 400076',
    designation: 'GENERAL PHYSICIAN',
  };

  const profileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={{ flexDirection: 'column', marginLeft: 16 }}>
        <Text style={styles.education}>{title}</Text>
        <Text style={styles.educationtext}>{description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />

      <SafeAreaView style={styles.container}>
        <ScrollView bounces={false}>
          <View style={{ backgroundColor: '#fff' }}>
            <Header
              rightIcons={[
                {
                  icon: <RoundIcon />,
                  onPress: () => Alert.alert('click'),
                },
              ]}
            />
            <View style={{ marginHorizontal: 20 }}>
              <View>
                <Text style={styles.profileName}>hi {profileObject.firstName}</Text>
                <Text style={styles.profileDescription}>
                  It’s great to have you join us!{'\n'}Here’s what your patients see when they{' '}
                  {'\n'}
                  view your profile
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statusBarline} />
          <View style={{ flex: 1, backgroundColor: '#f7f7f7', height: 700 }}>
            <View style={{ margin: 20, height: 605, borderRadius: 10 }}>
              <Text style={styles.yourprofiletext}>Your Profile</Text>

              <View style={styles.cardview}>
                <Image
                  style={styles.imageview}
                  source={{
                    uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
                  }}
                />
                {profileObject.isStarDoctor ? (
                  <Star
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 141 - 28,
                    }}
                  ></Star>
                ) : null}

                <View style={{ flexDirection: 'column', marginLeft: 16 }}>
                  <Text style={styles.drname}>
                    {profileObject.firstName}
                    {profileObject.lastName}
                  </Text>
                  <Text style={styles.drnametext}>
                    {profileObject.designation} | {profileObject.experience} YRS
                  </Text>
                  <View style={styles.understatusline} />
                </View>
                {profileRow('Education', profileObject.education)}
                {profileRow('Speciality', profileObject.speciality)}
                {profileRow('Services', profileObject.services)}
                {profileRow('Awards', profileObject.awards)}
                {profileRow('Speaks', profileObject.languages)}
                {profileRow('MCI Number', profileObject.mcinumber)}
                {profileRow('In-person Consult Location', profileObject.inpersonconsult)}
              </View>
            </View>
          </View>
          <View style={styles.statusBarBg} />
          <View>
            <View style={{ backgroundColor: '#f7f7f7' }}>
              <Text
                style={{
                  width: 284,
                  height: 20,
                  fontFamily: 'IBMPlexSans',
                  fontSize: 16,
                  fontWeight: '600',
                  fontStyle: 'normal',
                  letterSpacing: 0.07,
                  color: '#02475b',
                  margin: 20,
                }}
              >
                Your Star Doctors Team (2)
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 30 }}>
            <Button
              title={profileObject.isStarDoctor ? 'SAVE AND PROCEED' : 'PROCEED'}
              titleTextStyle={styles.titleTextStyle}
              style={styles.buttonView}
              //onPress={() => props.navigation.push(AppRoutes.OnBoardingPage)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
