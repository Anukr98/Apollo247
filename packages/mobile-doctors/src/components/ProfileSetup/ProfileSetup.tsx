import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Availability } from '@aph/mobile-doctors/src/components/ProfileSetup/Availability';
import { Fees } from '@aph/mobile-doctors/src/components/ProfileSetup/Fees';
import { Profile } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/Profile';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ApploLogo, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { SAVE_DOCTOR_DEVICE_TOKEN } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { DoctorType, DOCTOR_DEVICE_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  saveDoctorDeviceToken,
  saveDoctorDeviceTokenVariables,
} from '@aph/mobile-doctors/src/graphql/types/saveDoctorDeviceToken';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { setProfileFlowDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  AsyncStorage,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import firebase from 'react-native-firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

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
  const {
    setDoctorDetails: setDoctorDetailsToContext,
    doctorDetails,
    getDoctorDetailsApi,
  } = useAuth();
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);

  const fireBaseFCM = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      console.log('enabled', enabled);
      callDeviceTokenAPI();
    } else {
      // user doesn't have permission
      console.log('not enabled');
      try {
        await firebase.messaging().requestPermission();
        console.log('authorized');

        // User has authorised
      } catch (error) {
        // User has rejected permissions
        CommonBugFender('FireBaseFCM_ProfileSetup', error);
        console.log('not enabled error', error);
      }
    }
  };

  useEffect(() => {
    fireBaseFCM();
  });

  useEffect(() => {
    setLoading(false);
    if (!doctorDetails) {
      setLoading(true);
      getDoctorDetailsApi &&
        getDoctorDetailsApi()
          .catch((err) => {
            CommonBugFender('GetDoctor_Details_Api_ProfileSetup', err);
            props.navigation.replace(AppRoutes.Login);
          })
          .finally(() => {
            setLoading(false);
          });
    }
  }, [doctorDetails]);

  const callDeviceTokenAPI = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        console.log('token', token);
        if (token !== deviceToken2.deviceToken) {
          const input = {
            deviceType: Platform.OS === 'ios' ? DOCTOR_DEVICE_TYPE.IOS : DOCTOR_DEVICE_TYPE.ANDROID,
            deviceToken: token,
            deviceOS: Platform.OS === 'ios' ? '' : '',
            doctorId: doctorDetails ? doctorDetails.id : '',
          };
          console.log('input', input);

          if (doctorDetails && !deviceTokenApICalled) {
            setDeviceTokenApICalled(true);
            client
              .mutate<saveDoctorDeviceToken, saveDoctorDeviceTokenVariables>({
                mutation: SAVE_DOCTOR_DEVICE_TOKEN,
                variables: {
                  SaveDoctorDeviceTokenInput: input,
                },
              })
              .then((data: any) => {
                console.log('APICALLED', data.data.saveDoctorDeviceToken.deviceToken.deviceToken);
                AsyncStorage.setItem(
                  'deviceToken',
                  JSON.stringify(data.data.saveDoctorDeviceToken.deviceToken.deviceToken)
                );
              })
              .catch((e: string) => {
                CommonBugFender('Save_Doctor_Device_Token', e);
                console.log('Error occured while calling device token', e);
              });
          }
        }
      });
  };
  useEffect(() => {
    // setLoading(true);
    // client
    //   .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
    //   .then((_data) => {
    //     const result = _data.data.getDoctorDetails;
    //     console.log('getDoctorProfile', _data!);
    //     try {
    //       setDoctorDetails(result);
    //       setDoctorDetailsToContext && setDoctorDetailsToContext(result);
    //     } catch (e) {
    //       console.log('Unable to set DoctorDetails');
    //     }
    //     setGetDoctorProfile(result);
    //     setLoading(false);
    //   })
    //   .catch((e) => {
    //     setLoading(false);
    //     const error = JSON.parse(JSON.stringify(e));
    //     console.log('Error occured while fetching Doctor profile', error);
    //   });
  }, []);

  // const [
  //   getDoctorProfile,
  //   setGetDoctorProfile,
  // ] = useState<GetDoctorDetails_getDoctorDetails | null>(null);

  const onReload = () => {
    setReloading(true);
    getDoctorDetailsApi &&
      getDoctorDetailsApi()
        .then((res) => {
          console.log(res);
          setReloading(false);
        })
        .catch((error) => {
          console.log(error);
          CommonBugFender('Get_Doctor_Details_reload', e);
          setReloading(false);
        });
    // client
    //   .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
    //   .then((_data) => {
    //     const result = _data.data.getDoctorDetails;
    //     setGetDoctorProfile(result);
    //     console.log('GET_DOCTOR_DETAILS', result);
    //     setReloading(false);
    //   })
    //   .catch((e) => {
    //     console.log('Error occured while adding Doctor', e);
    //     CommonBugFender('GET_DOCTOR_DETAILS', e);
    //     setReloading(false);
    //     Alert.alert('Error', 'Error occured while reloading data');
    //   });
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
          onPress: () => setmodelvisible(true),
        },
      ]}
    />
  );

  const renderProgressBar = (tabIndex: number, data: GetDoctorDetails_getDoctorDetails) => (
    <ProfileTabHeader
      title={headerContent[tabIndex].heading(data!.lastName)}
      description={headerContent[tabIndex].description}
      tabs={(data!.doctorType == DoctorType.PAYROLL
        ? [headerContent[0], headerContent[1]]
        : headerContent
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
      const tabsCount = data!.doctorType == DoctorType.PAYROLL ? 2 : 3;
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
            title={
              data!.doctorType == 'STAR_APOLLO'
                ? strings.buttons.save_proceed
                : strings.buttons.proceed
            }
            titleTextStyle={styles.buttonTextStyle}
            style={{ width: 240 }}
          />
        ) : (
          <>
            <Button
              onPress={onPressBack}
              title={strings.buttons.back}
              titleTextStyle={styles.buttonTextStyle}
              variant="white"
              style={[styles.buttonStyle, { marginRight: 16 }]}
            />
            <Button
              onPress={onPressProceed}
              title={
                data!.doctorType == 'STAR_APOLLO'
                  ? strings.buttons.save_proceed
                  : strings.buttons.proceed
              }
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
        <NeedHelpCard onPress={() => setmodelvisible(false)} />
        {/* <NeedHelpCard
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
            <Text style={styles.inputTextStyle}>{string.login.numberPrefix}</Text>
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
        </NeedHelpCard> */}
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
            !!doctorDetails && (
              <>
                {renderProgressBar(activeTabIndex, doctorDetails)}
                {renderComponent(activeTabIndex, doctorDetails)}
                {renderFooterButtons(activeTabIndex, doctorDetails)}
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
