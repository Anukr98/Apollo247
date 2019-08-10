import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Availability } from '@aph/mobile-doctors/src/components/ProfileSetup/Availability';
import { Fees } from '@aph/mobile-doctors/src/components/ProfileSetup/Fees';
import { Profile } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/Profile';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon, ApploLogo } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';

import {
  GetDoctorProfile,
  GetDoctorProfile_getDoctorProfile,
} from '@aph/mobile-doctors/src/graphql/types/getDoctorProfile';

import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';

import { setProfileFlowDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useRef, useState, useEffect } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import { GET_DOCTOR_PROFILE } from '@aph/mobile-doctors/src/graphql/profiles';
import { GET_DOCTOR_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import { useQuery } from 'react-apollo-hooks';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { useApolloClient } from 'react-apollo-hooks';
//import { isMobileNumberValid } from '@aph/universal/src/aphValidators';

const isMobileNumberValid = (n: string) => true;
const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  footerButtonsContainer: {
    zIndex: -1,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '92%',
  },
  buttonStyle: {
    width: '46%',
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
    margin: 1.5,
  },
  buttonView: {
    borderRadius: 10,
    width: 200,
    backgroundColor: '#fc9916',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        marginTop: -25,
        marginLeft: 40,
        marginRight: 30,
        marginBottom: 16,
      },
      android: {
        marginTop: -25,
        marginBottom: 16,
      },
    }),
  },
  buttonViewLess: {
    justifyContent: 'center',
    borderRadius: 10,
    width: 200,
    height: 40,
    backgroundColor: '#fc9916',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        marginTop: -25,
        marginLeft: 40,
        marginRight: 30,
        marginBottom: 16,
      },
      android: {
        marginTop: -25,
        marginBottom: 16,
      },
    }),
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
    width: '90%',
    paddingBottom: 0,
    marginLeft: 20,
  },
  bottomDescription: {
    color: '#890000',
    ...theme.fonts.IBMPlexSansMedium(12),
    bottom: 5,
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
    marginBottom: 5,
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
    marginLeft: 20,
  },
});

const headerContent = [
  {
    tab: 'Profile',
    heading: (name: string) => `hi dr. ${name.toLowerCase()}!`,
    description:
      "It’s great to have you join us!\nHere's what your patients see when they\nview your profile",
  },
  {
    tab: 'Availability',
    heading: (name: string) => `ok dr. ${name.toLowerCase()}!`,
    description: 'Now tell us what hours suit you for online \nand in-person consults',
  },
  {
    tab: 'Fees',
    heading: (name: string) => `ok dr. ${name.toLowerCase()}!`,
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
  const [isReloading, setReloading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const client = useApolloClient();

  // useEffect(()=>{
  //   props.navigation.addListener((''))
  // })

  useEffect(() => {
    setLoading(true);
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then((_data) => {
        const result = _data.data.getDoctorDetails;
        console.log('getDoctorProfile', _data!);

        setGetDoctorProfile(result);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.log('Error occured while adding Doctor', e);
      });
  }, []);

  const fetchProfileData = (isReload: boolean) => {
    isReload ? setReloading(true) : setLoading(true);
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS })
      .then((_data) => {
        console.log('getDoctorProfile', _data!);
        const result = _data.data.getDoctorDetails;
        setGetDoctorProfile(result);
        isReload ? setReloading(false) : setLoading(false);
      })
      .catch((e) => {
        isReload ? setReloading(false) : setLoading(false);
        console.log('Error occured while adding Doctor', e);
      });
  };

  // const { data, error, loading } = useQuery<GetDoctorDetails, GetDoctorDetails_getDoctorDetails>(
  //   GET_DOCTOR_DETAILS
  // );
  const [
    getDoctorProfile,
    setGetDoctorProfile,
  ] = useState<GetDoctorDetails_getDoctorDetails | null>(null);
  // const {
  //   data: { getDoctorProfile },
  //   error,
  //   loading,
  // } = doctorProfile;
  // if (!loading) {
  //   console.log('getDoctorProfileerror');
  //   Alert.alert('Error', 'Unable to get the data');
  // } else {
  //   console.log('getDoctorProfile', getDoctorProfile!);
  // }

  const onReload = (func: () => Promise<void>) => {
    setReloading(true);
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS })
      .then((_data) => {
        const result = _data.data.getDoctorDetails;
        setGetDoctorProfile(result);
        console.log('GET_DOCTOR_DETAILS', result);
        setReloading(false);
      })
      .catch((e) => {
        console.log('Error occured while adding Doctor', e);
        setReloading(false);
        Alert.alert('Error', 'Error occured while reloading data');
      });
  };

  const renderHeader = (
    <Header
      leftIcons={[
        {
          icon: <ApploLogo />,
          // onPress: () => props.navigation.push(AppRoutes.TabBar),
        },
      ]}
      rightIcons={[
        {
          icon: <RoundIcon />,
          onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment), //setmodelvisible(true),
        },
      ]}
    />
  );

  const renderProgressBar = (tabIndex: number, data: GetDoctorDetails_getDoctorDetails) => (
    <ProfileTabHeader
      title={headerContent[tabIndex].heading(data!.lastName)}
      description={headerContent[tabIndex].description}
      tabs={(data!.doctorType == 'STAR_APOLLO' || data!.doctorType == 'APOLLO'
        ? headerContent
        : [headerContent[0], headerContent[1]]
      ).map((content) => content.tab)}
      activeTabIndex={tabIndex}
    />
  );
  const renderComponent = (tabIndex: number, data: GetDoctorDetails_getDoctorDetails) =>
    tabIndex == 0 ? (
      <Profile
        profileData={data}
        scrollViewRef={scrollViewRef.current!}
        onReload={() => onReload()}
      />
    ) : tabIndex == 1 ? (
      <Availability profileData={data} />
    ) : (
      <Fees profileData={data} />
    );

  const renderFooterButtons = (tabIndex: number, data: GetDoctorDetails_getDoctorDetails) => {
    const onPressProceed = () => {
      const tabsCount = data!.doctorType == 'STAR_APOLLO' || data!.doctorType == 'APOLLO' ? 3 : 2;
      if (tabIndex < tabsCount - 1) {
        setActiveTabIndex(tabIndex + 1);
        scrollViewRef.current && scrollViewRef.current.scrollToPosition(0, 0, false);
      } else {
        setProfileFlowDone(true).finally(() => {
          props.navigation.replace(AppRoutes.TransitionPage, {
            doctorName: data.lastName,
            DoctorId: data.id,
          });
        });
      }
    };
    const onPressBack = () => {
      setActiveTabIndex(tabIndex - 1);
      scrollViewRef.current && scrollViewRef.current.scrollToPosition(0, 0, false);
    };
    return (
      <View style={styles.footerButtonsContainer}>
        {tabIndex == 0 ? (
          <Button
            onPress={onPressProceed}
            title={data!.doctorType == 'STAR_APOLLO' ? 'SAVE AND PROCEED' : 'PROCEED'}
            titleTextStyle={styles.buttonTextStyle}
            style={{ width: 240 }}
          />
        ) : (
          <>
            <Button
              onPress={onPressBack}
              title="BACK"
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonStyle, { marginRight: 16 }]}
            />
            <Button
              onPress={onPressProceed}
              title={data!.doctorType == 'STAR_APOLLO' ? 'SAVE AND PROCEED' : 'PROCEED'}
              titleTextStyle={styles.buttonTextStyle}
              style={styles.buttonStyle}
            />
          </>
        )}
      </View>
    );
  };
  const moveNextPage = () => {
    setmodelvisible(false);
    props.navigation.push(AppRoutes.NeedHelpDonePage);
  };
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

  const renderNeedHelpModal = () => {
    return modelvisible ? (
      <View>
        <NeedHelpCard
          onPress={() => setmodelvisible(false)}
          heading="need help?"
          description="You can request a call back for us to resolve your issue ASAP"
        >
          <View
            style={[
              { height: 56 },
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
          <View
            style={{
              height: 50,
              width: '100%',
              paddingVertical: 10,
              overflow: 'hidden',
              marginLeft: 20,
            }}
          >
            <Text
              style={
                phoneNumber == '' || phoneNumberIsValid
                  ? styles.bottomValidDescription
                  : styles.bottomDescription
              }
            >
              {phoneNumber == '' || phoneNumberIsValid ? null : string.LocalStrings.wrong_number}
            </Text>
          </View>

          <Button
            title={'CALL ME'}
            titleTextStyle={styles.buttonTextStyle}
            style={
              phoneNumber == '' || phoneNumberIsValid ? styles.buttonViewLess : styles.buttonView
            }
            onPress={() => moveNextPage()}
            disabled={
              phoneNumberIsValid && phoneNumber.length === 10 && isMobileNumberValid(phoneNumber)
                ? false
                : true
            }
          />
        </NeedHelpCard>
      </View>
    ) : null;
  };
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          ref={(ref) => (scrollViewRef.current = ref)}
          bounces={false}
        >
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
        {renderNeedHelpModal()}
      </SafeAreaView>
      {isReloading && <Loader fullScreen flex1 />}
    </View>
  );
};
