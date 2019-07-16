import { Availability } from '@aph/mobile-doctors/src/components/Availability';
import { Fees } from '@aph/mobile-doctors/src/components/Fees';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Profile } from '@aph/mobile-doctors/src/components/Profile';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { setProfileFlowDone } from '@aph/mobile-doctors/src/helpers/localStorage';

const styles = StyleSheet.create({
  footerButtonsContainer: {
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  buttonStyle: {
    width: 152,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
  },
});

export type ProfileData = {
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
  uri: string;
  starDoctorTeam: {
    firstName: string;
    lastName: string;
    experience: string;
    typeOfConsult: string;
    inviteStatus: boolean;
    speciality: string;
    education: string;
    services: string;
    designation: string;
    uri: string;
  }[];
};

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
  uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
  starDoctorTeam: [
    {
      firstName: 'Dr. Rakhi Sharma',
      lastName: 'Mcmarrow',
      experience: '7',
      typeOfConsult: '24/7',
      inviteStatus: false,
      speciality: 'Gynacology',
      education: 'MBBS',
      services: 'Consultations, Surgery',
      designation: 'GENERAL PHYSICIAN',
      uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
    },
    {
      firstName: 'Dr. Jayanth Reddy',
      lastName: 'Carter',
      experience: '7',
      typeOfConsult: '24/7',
      inviteStatus: true,
      speciality: 'Gynacology',
      education: 'MBBS',
      services: 'Consultations, Surgery',
      designation: 'GENERAL PHYSICIAN',
      uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
    },
  ],
};

const headerContent = [
  {
    tab: 'Profile',
    heading: (name: string) => `hi dr. ${name}!`,
    description:
      "It’s great to have you join us! Here's what your patients see when they view your profile",
  },
  {
    tab: 'Availibility',
    heading: (name: string) => `ok dr. ${name}!`,
    description: 'Now tell us what hours suit you for online and in-person consults',
  },
  {
    tab: 'Fees',
    heading: (name: string) => `ok dr. ${name}!`,
    description: 'Lastly, some money-related matters like fees, packages and how you take payments',
  },
];

export interface ProfileSetupProps extends NavigationScreenProps {}

export const ProfileSetup: React.FC<ProfileSetupProps> = (props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const renderHeader = (
    <Header
      rightIcons={[
        {
          icon: <RoundIcon />,
          onPress: () => Alert.alert('click'),
        },
      ]}
    />
  );
  const renderProgressBar = (tabIndex: number) => (
    <ProfileTabHeader
      title={headerContent[tabIndex].heading(profileObject.firstName)}
      description={headerContent[tabIndex].description}
      tabs={(profileObject.isStarDoctor ? headerContent : [headerContent[0], headerContent[1]]).map(
        (content) => content.tab
      )}
      activeTabIndex={tabIndex}
    />
  );
  const renderComponent = (tabIndex: number) =>
    tabIndex == 0 ? (
      <Profile profileObject={profileObject} />
    ) : tabIndex == 1 ? (
      <Availability profileData={profileObject} />
    ) : (
      <Fees />
    );
  const renderFooterButtons = (tabIndex: number) => {
    const onPressProceed = () => {
      const tabsCount = profileObject.isStarDoctor ? 3 : 2;
      if (activeTabIndex < tabsCount - 1) {
        setActiveTabIndex(activeTabIndex + 1);
      } else {
        setProfileFlowDone(true).finally(() => {
          props.navigation.navigate(AppRoutes.TransitionPage);
        });
      }
    };
    return (
      <View style={styles.footerButtonsContainer}>
        {activeTabIndex == 0 ? (
          <Button
            onPress={() => onPressProceed()}
            title={profileObject.isStarDoctor ? 'SAVE AND PROCEED' : 'PROCEED'}
            titleTextStyle={styles.buttonTextStyle}
            style={{ width: 240 }}
          />
        ) : (
          <>
            <Button
              onPress={() => setActiveTabIndex(activeTabIndex - 1)}
              title="BACK"
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonStyle, { marginRight: 16 }]}
            />
            <Button
              onPress={() => onPressProceed()}
              title={'SAVE AND PROCEED'}
              titleTextStyle={styles.buttonTextStyle}
              style={styles.buttonStyle}
            />
          </>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <ScrollView bounces={false}>
        {renderHeader}
        {renderProgressBar(activeTabIndex)}
        {renderComponent(activeTabIndex)}
        {renderFooterButtons(activeTabIndex)}
      </ScrollView>
    </SafeAreaView>
  );
};
