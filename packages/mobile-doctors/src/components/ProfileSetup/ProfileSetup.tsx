import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Availability } from '@aph/mobile-doctors/src/components/ProfileSetup/Availability';
import { Fees } from '@aph/mobile-doctors/src/components/ProfileSetup/Fees';
import { Profile } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/Profile';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { Cancel, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { GET_DOCTOR_PROFILE } from '@aph/mobile-doctors/src/graphql/profiles';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { setProfileFlowDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  footerButtonsContainer: {
    zIndex: -1,
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
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    width: 200,
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
  buttonViewfull: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fc9916',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 12,
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

const headerContent = [
  {
    tab: 'Profile',
    heading: (name: string) => `hi dr. ${name}!`,
    description:
      "It’s great to have you join us!\nHere's what your patients see when they view your profile",
  },
  {
    tab: 'Availability',
    heading: (name: string) => `ok dr. ${name}!`,
    description: 'Now tell us what hours suit you for online \nand in-person consults',
  },
  {
    tab: 'Fees',
    heading: (name: string) => `ok dr. ${name}!`,
    description:
      'Lastly, some money-related matters like \nfees, packages and how you take payments',
  },
];

export interface ProfileSetupProps extends NavigationScreenProps {}

export const ProfileSetup: React.FC<ProfileSetupProps> = (props) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [modelvisible, setmodelvisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const {
    data: { getDoctorProfile },
    error,
    loading,
  } = useQuery(GET_DOCTOR_PROFILE) as any;
  // const {
  //   data: { getDoctorProfile },
  //   error,
  //   loading,
  // } = doctorProfile;
  if (!loading && error) {
    Alert.alert('Error', 'Unable to get the data');
  } else {
    console.log(getDoctorProfile);
  }

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      setPhoneNumberIsValid(isPhoneNumberValid(number));
    } else {
      return false;
    }
  };

  const isPhoneNumberValid = (number: string) => {
    const isValidNumber = !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
    return isValidNumber;
  };

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

  const renderProgressBar = (tabIndex: number, data: DoctorProfile) => (
    <ProfileTabHeader
      title={headerContent[tabIndex].heading(data!.profile.firstName)}
      description={headerContent[tabIndex].description}
      tabs={(data!.profile.isStarDoctor ? headerContent : [headerContent[0], headerContent[1]]).map(
        (content) => content.tab
      )}
      activeTabIndex={tabIndex}
    />
  );
  const renderComponent = (tabIndex: number, data: DoctorProfile) =>
    tabIndex == 0 ? (
      <Profile profileData={data} />
    ) : tabIndex == 1 ? (
      <Availability profileData={data} />
    ) : (
      <Fees profileData={data} />
    );

  const renderFooterButtons = (tabIndex: number, data: DoctorProfile) => {
    const onPressProceed = () => {
      const tabsCount = data!.profile.isStarDoctor ? 3 : 2;
      if (tabIndex < tabsCount - 1) {
        setActiveTabIndex(tabIndex + 1);
      } else {
        setProfileFlowDone(true).finally(() => {
          props.navigation.navigate(AppRoutes.TransitionPage, {
            doctorName: data.profile.firstName,
          });
        });
      }
    };
    return (
      <View style={styles.footerButtonsContainer}>
        {tabIndex == 0 ? (
          <Button
            onPress={() => onPressProceed()}
            title={data!.profile.isStarDoctor ? 'SAVE AND PROCEED' : 'PROCEED'}
            titleTextStyle={styles.buttonTextStyle}
            style={{ width: 240 }}
          />
        ) : (
          <>
            <Button
              onPress={() => setActiveTabIndex(tabIndex - 1)}
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
      <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps="always">
        {renderHeader}
        {loading ? (
          <View style={{ flex: 1, alignSelf: 'center', marginTop: height / 3 }}>
            <ActivityIndicator size="large" color="green" />
          </View>
        ) : (
          !!getDoctorProfile && (
            <>
              {renderProgressBar(activeTabIndex, getDoctorProfile)}
              {renderComponent(activeTabIndex, getDoctorProfile)}
              {renderFooterButtons(activeTabIndex, getDoctorProfile)}
            </>
          )
        )}
      </KeyboardAwareScrollView>
      {modelvisible ? (
        <Overlay isVisible={modelvisible} height={289} width={280} borderRadius={10}>
          <View>
            <TouchableOpacity onPress={() => setmodelvisible(false)}>
              <View style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
                <Cancel />
              </View>
            </TouchableOpacity>
            <Text
              style={{
                color: '#02475b',
                ...theme.fonts.IBMPlexSansSemiBold(36),
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
                style={
                  phoneNumber == '' || phoneNumberIsValid
                    ? styles.buttonViewfull
                    : styles.buttonView
                }
                onPress={() => Alert.alert('Need Help')}
                disabled={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
              />
            </View>
          </View>
        </Overlay>
      ) : null}
    </SafeAreaView>
  );
};
