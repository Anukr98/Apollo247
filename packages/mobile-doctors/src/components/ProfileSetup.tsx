import { Availability } from '@aph/mobile-doctors/src/components/Availability';
import { Fees } from '@aph/mobile-doctors/src/components/Fees';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Profile } from '@aph/mobile-doctors/src/components/Profile';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon, Cancel } from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { setProfileFlowDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { Overlay } from 'react-native-elements';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { GET_DOCTOR_PROFILE } from '@aph/mobile-doctors/src/graphql/profiles';
import { ApolloClient } from 'apollo-client';
import { useQuery } from 'react-apollo-hooks';
const { height, width } = Dimensions.get('window');

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
  buttonview: {
    width: 200,
    height: 40,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_FAILURE,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingBottom: 0,
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
  const [modelvisible, setmodelvisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);

  const { data, error, loading } = useQuery(GET_DOCTOR_PROFILE, {
    variables: { mobileNumber: '1234567890' },
  });
  if (error) {
    Alert.alert('Error', 'Unable to get the data');
  }
  const renderHeader = (
    <Header
      rightIcons={[
        {
          icon: <RoundIcon />,
          onPress: () => setmodelvisible(true),
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
  const renderComponent = (tabIndex: number, data: any) =>
    tabIndex == 0 ? (
      <Profile profileData={data} />
    ) : tabIndex == 1 ? (
      <Availability profileData={data} />
    ) : (
      <Fees profileData={data} />
    );
  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      // if (number.length == 10) {
      setPhoneNumberIsValid(isPhoneNumberValid(number));
      // }
    } else {
      return false;
    }
  };
  const isPhoneNumberValid = (number: string) => {
    const isValidNumber =
      // (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
      !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
    return isValidNumber;
  };
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
        {!data.getDoctorProfile ? (
          <View style={{ flex: 1, alignSelf: 'center', marginTop: height / 3 }}>
            <ActivityIndicator size="large" color="green" />
          </View>
        ) : (
          <>
            {renderProgressBar(activeTabIndex)}
            {renderComponent(activeTabIndex, data)}
            {renderFooterButtons(activeTabIndex)}
          </>
        )}
      </ScrollView>

      {modelvisible ? (
        <View>
          <Overlay isVisible={modelvisible} height={289} width={280} borderRadius={10}>
            <TouchableOpacity onPress={() => setmodelvisible(false)}>
              <View style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
                <Cancel />
              </View>
            </TouchableOpacity>
            <Text
              style={{
                color: '#02475b',
                ...theme.fonts.IBMPlexSansBold(36),
                marginLeft: 16,
                marginBottom: 8,
              }}
            >
              need help?
            </Text>
            <Text
              style={{
                color: '#0087ba',
                ...theme.fonts.IBMPlexSansMedium(16),
                marginLeft: 16,
                marginRight: 16,
              }}
            >
              You can request a call back for us to resolve your issue ASAP
            </Text>
            <View
              style={[
                { height: 56, paddingTop: 20, marginBottom: 20, marginLeft: 16, marginRight: 16 },
                phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
              ]}
            >
              <Text style={styles.inputTextStyle}>{string.LocalStrings.numberPrefix}</Text>
              <TextInput
                autoFocus
                style={styles.inputStyle}
                keyboardType="numeric"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(value) => validateAndSetPhoneNumber(value)}
              />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Button
                title={'CALL ME'}
                titleTextStyle={styles.buttonTextStyle}
                style={styles.buttonview}
              />
            </View>
          </Overlay>
        </View>
      ) : null}
    </SafeAreaView>
  );
};
