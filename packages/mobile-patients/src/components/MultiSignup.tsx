import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import {
  DropdownGreen,
  Mascot,
  WhiteTickIcon,
  Gift,
  WhatsAppIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  ScrollView,
  Platform,
  PixelRatio,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Relation, UpdatePatientInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updatePatientVariables,
  updatePatient,
  updatePatient_updatePatient_patient,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { UPDATE_PATIENT, CREATE_ONE_APOLLO_USER } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import moment from 'moment';
import { StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getRelations,
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWEGReferralCodeEvent,
  g,
  setFirebaseUserId,
  onCleverTapUserLogin,
  postCleverTapEvent,
  getAge,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import AsyncStorage from '@react-native-community/async-storage';
import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import DeviceInfo from 'react-native-device-info';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { useApolloClient } from 'react-apollo-hooks';
import { getDeviceTokenCount } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  createOneApolloUser,
  createOneApolloUserVariables,
} from '@aph/mobile-patients/src/graphql/types/createOneApolloUser';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { FlatList } from 'react-native-gesture-handler';
import { InputCheckBox } from '@aph/mobile-patients/src/components/ui/InputCheckBox';

let backPressCount = 0;

export interface MultiSignupProps extends NavigationScreenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
  const [relationIndex, setRelationIndex] = useState<number>(0);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const { signOut, getPatientApiCall } = useAuth();
  const [profiles, setProfiles] = useState<GetCurrentPatients_getCurrentPatients_patients[] | null>(
    []
  );
  const [discriptionText, setDiscriptionText] = useState<string>('');
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [referredBy, setReferredBy] = useState<string>();
  const [referral, setReferral] = useState<string>('');
  const [isValidReferral, setValidReferral] = useState<boolean>(false);
  const [allCurrentPatients, setAllCurrentPatients] = useState<any>();
  const [isSignupEventFired, setSignupEventFired] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [showReferralCode, setShowReferralCode] = useState<boolean>(false);
  const [oneApolloRegistrationCalled, setoneApolloRegistrationCalled] = useState<boolean>(false);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState<boolean>(true);
  const [selectedUser, setUserSelected] = useState<any>(null);
  const [userContactNumber, setUserContactNumber] = useState<string>('');

  useEffect(() => {
    const isValidReferralCode = /^[a-zA-Z]{4}[0-9]{4}$/.test(referral);
    setValidReferral(isValidReferralCode);
  }, [referral]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      try {
        if (backPressCount === 1) {
          BackHandler.exitApp();
        } else {
          backPressCount++;
        }
        return true;
      } catch (e) {
        CommonBugFender('Multi_Sign_up_backpressed', e);
      }
    });
    return function cleanup() {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem || 'null');

      const callByPrism: any = await AsyncStorage.getItem('callByPrism');
      let allPatients;

      if (callByPrism === 'true') {
        allPatients =
          item && item.data && item.data.getCurrentPatients
            ? item.data.getCurrentPatients.patients
            : null;
      } else {
        allPatients =
          item && item.data && item.data.getPatientByMobileNumber
            ? item.data.getPatientByMobileNumber.patients
            : null;
      }

      setAllCurrentPatients(allPatients);

      if (allPatients && allPatients.length) {
        if (!allPatients[0].relation) allPatients[0].relation = Relation.ME;
      }
      setProfiles(allPatients ? allPatients : []);
      if (allPatients && allPatients.length > 0) {
        setUserContactNumber(allPatients[0]?.mobileNumber || '');
      }
      AsyncStorage.setItem('multiSignUp', 'true');
    }

    fetchData();
    getPrefillReferralCode();
  }, []);

  const getPrefillReferralCode = async () => {
    const deeplinkReferalCode: any = await AsyncStorage.getItem('deeplinkReferalCode');
    if (deeplinkReferalCode !== null && deeplinkReferalCode !== undefined) {
      setReferral(deeplinkReferalCode);
    }
  };

  useEffect(() => {
    getDeviceCountAPICall();
  }, []);

  const client = useApolloClient();

  async function createOneApolloUser(patientId: string) {
    setoneApolloRegistrationCalled(true);
    if (!oneApolloRegistrationCalled) {
      try {
        const response = await client.mutate<createOneApolloUser, createOneApolloUserVariables>({
          mutation: CREATE_ONE_APOLLO_USER,
          variables: { patientId: patientId },
        });
      } catch (error) {
        CommonBugFender('oneApollo Registration', error);
      }
    }
  }

  const getDeviceCountAPICall = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    setDeviceToken(uniqueId);

    getDeviceTokenCount(client, uniqueId.trim())
      .then(({ data }: any) => {
        if (parseInt(data.data.getDeviceCodeCount.deviceCount, 10) < 2) {
          setShowReferralCode(true);
        } else {
          setShowReferralCode(false);
          setReferral('');
        }
      })
      .catch((e) => {});
  };
  const isDisabled = () => {
    if (selectedUser && selectedUser != '') {
      return false;
    }
    return true;
  };

  const fireUserLoggedInEvent = (mePatient: any, type: 'Registration' | 'Login') => {
    setFirebaseUserId(mePatient.primaryUhid);
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.USER_LOGGED_IN] = {
      Type: type,
      userId: mePatient.id,
    };
    postFirebaseEvent(FirebaseEventName.USER_LOGGED_IN, firebaseAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.USER_LOGGED_IN, firebaseAttributes);
  };

  const _postWebEngageEvent = (patient: updatePatient_updatePatient_patient) => {
    try {
      if (isSignupEventFired) {
        return;
      }
      fireUserLoggedInEvent(patient, 'Registration');
      const { firstName, lastName, dateOfBirth: date, gender, emailAddress: email } = patient;
      const eventAttributes: WebEngageEvents[WebEngageEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient ? currentPatient.id : '',
        'Customer First Name': (firstName || '')!.trim(),
        'Customer Last Name': (lastName || '')!.trim(),
        'Date of Birth':
          currentPatient?.dateOfBirth || date ? moment(date, 'DD/MM/YYYY').toDate() : '',
        Gender: gender!,
        Email: (email || '').trim(),
        'Mobile Number': currentPatient?.mobileNumber,
      };
      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient?.id,
        'Full Name': (firstName || '')!.trim() + ' ' + (lastName || '')!.trim(),
        DOB: currentPatient?.dateOfBirth || date ? moment(date, 'DD/MM/YYYY').toDate() : undefined,
        Gender: gender!,
        'Email ID': email?.trim(),
        'Mobile Number': currentPatient?.mobileNumber,
        'Nav src': 'App login screen',
        'Page Name': 'Multi Signup Screen',
      };
      if (referral) {
        // only send if referral has a value
        eventAttributes['Referral Code'] = referral;
        cleverTapEventAttributes['Referral Code'] = referral;
        postWEGReferralCodeEvent(referral);
      }

      postWebEngageEvent(WebEngageEventName.REGISTRATION_DONE, eventAttributes);
      postCleverTapEvent(CleverTapEventName.REGISTRATION_DONE, cleverTapEventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.REGISTRATION_DONE] = {
        'customer id': currentPatient ? currentPatient.id : '',
      };
      if (referral) {
        // only send if referral has a value
        appsflyereventAttributes['referral code'] = referral;
      }
      postAppsFlyerEvent(AppsFlyerEventName.REGISTRATION_DONE, appsflyereventAttributes);

      const eventFirebaseAttributes: FirebaseEvents[FirebaseEventName.SIGN_UP] = {
        Customer_ID: currentPatient ? currentPatient.id : '',
        Customer_First_Name: (firstName || '')!.trim(),
        Customer_Last_Name: (lastName || '')!.trim(),
        Date_of_Birth: date ? moment(date, 'DD/MM/YYYY').toDate() : '',
        Gender: gender!,
        Email: (email || '').trim(),
      };
      if (referral) {
        // only send if referral has a value
        eventFirebaseAttributes['Referral_Code'] = referral;
      }

      postFirebaseEvent(FirebaseEventName.SIGN_UP, eventFirebaseAttributes);
      setSignupEventFired(true);
    } catch (error) {}
  };

  const handleOpenURLs = async () => {
    try {
      const event: any = await AsyncStorage.getItem('deeplink');
      const data = handleOpenURL(event);
      const { routeName, id, isCall, timeout, mediaSource } = data;
      pushTheView(
        props.navigation,
        routeName,
        id ? id : undefined,
        isCall,
        undefined,
        undefined,
        mediaSource
      );
    } catch (error) {}
  };

  const renderReferral = () => {
    return (
      <View style={styles.referralMainContainer}>
        <Text style={styles.referralHeadingText}>{string.multiSignupScreen.haveAReferralCode}</Text>
        <TextInputComponent
          maxLength={25}
          placeholder={string.multiSignupScreen.enterReferralCodeOptional}
          placeholderTextColor={theme.colors.LIGHT_BLUE_DOWN}
          inputStyle={styles.referralTextInputStyle}
          conatinerstyles={{ width: '80%' }}
          value={referral}
          onChangeText={(text) => setReferral(text)}
          icon={referral.length > 0 ? <WhiteTickIcon /> : null}
        />
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.stickyButtonMainContainer}>
        <View style={styles.stickyTextContainer}>
          <Text style={styles.stickyText}>{string.multiSignupScreen.cannotFindName}</Text>
        </View>
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity
            style={styles.addProfileBtnContainer}
            onPress={() => {
              AsyncStorage.setItem('preApolloUser', 'true');
              props.navigation.navigate(AppRoutes.SignUp);
            }}
          >
            <Text style={styles.addProfileBtnTitle}>{string.multiSignupScreen.addProfile}</Text>
          </TouchableOpacity>
          <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
            {(mutate, { loading, data, error }) => (
              <Button
                style={styles.confirmBtnContainer}
                title={string.multiSignupScreen.confirm}
                titleTextStyle={styles.confirmBtnText}
                disabled={isDisabled()}
                onPress={async () => {
                  Keyboard.dismiss();
                  let trimReferral = referral;
                  if (profiles) {
                    if (referral !== '') {
                      trimReferral = trimReferral.trim();
                    }
                    setVerifyingPhoneNumber(true);

                    let profileToUpdate = profiles.filter(
                      (profile: updatePatient_updatePatient_patient) => profile.id === selectedUser
                    )[0];

                    const patientsDetails: UpdatePatientInput = {
                      id: profileToUpdate.id,
                      relation: Relation.ME, // profile ? profile.relation!.toUpperCase() : '',
                      referralCode: trimReferral || null,
                      deviceCode: deviceToken,
                      whatsappOptIn: whatsAppOptIn,
                    };

                    CommonLogEvent(AppRoutes.MultiSignup, 'Update API clicked');
                    mutate({
                      variables: {
                        patientInput: patientsDetails,
                      },
                    }).then((_data) => {
                      try {
                        const { data } = _data as { data: updatePatient };
                        const patient = g(data, 'updatePatient', 'patient')!;
                        if (patient.relation == Relation.ME) {
                          setCurrentPatientId(patient.id);
                          AsyncStorage.setItem('selectUserId', patient.id);
                          AsyncStorage.setItem('selectUserUHId', patient.uhid!);
                          _postWebEngageEvent(patient);
                        }
                      } catch (error) {
                        CommonLogEvent(
                          AppRoutes.MultiSignup,
                          `Error occured while sending webEngage event (${WebEngageEventName.REGISTRATION_DONE}) for PRISM profiles.`
                        );
                      }
                    });
                  }
                }}
              >
                {data
                  ? (getPatientApiCall(),
                    AsyncStorage.setItem('userLoggedIn', 'true'),
                    AsyncStorage.setItem('multiSignUp', 'false'),
                    AsyncStorage.setItem('gotIt', 'false'),
                    onCleverTapUserLogin(!whatsAppOptIn ? data?.updatePatient?.patient : {...data?.updatePatient?.patient, 'Msg-whatsapp': true}),
                    createOneApolloUser(data?.updatePatient?.patient?.id!),
                    handleOpenURLs())
                  : null}
                {error
                  ? (signOut(),
                    AsyncStorage.setItem('userLoggedIn', 'false'),
                    AsyncStorage.setItem('multiSignUp', 'false'),
                    AsyncStorage.setItem('signUp', 'false'),
                    CommonLogEvent(AppRoutes.MultiSignup, 'Navigating back to Login'),
                    setTimeout(() => {
                      setVerifyingPhoneNumber(false),
                        props.navigation.dispatch(
                          StackActions.reset({
                            index: 0,
                            key: null,
                            actions: [
                              NavigationActions.navigate({
                                routeName: AppRoutes.Login,
                              }),
                            ],
                          })
                        );
                    }, 0))
                  : null}
              </Button>
            )}
          </Mutation>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.stickyHeaderMainContainer}>
        <ApolloLogo style={styles.headerLogo} />
        <View style={styles.headerHeadingContainer}>
          <Text style={styles.headerHeadingOne}>
            {string.multiSignupScreen.choosePrimaryProfile}
          </Text>
          <Text style={styles.headerHeadingTwo}>{userContactNumber}</Text>
        </View>
      </View>
    );
  };

  const renderUserItem = (item: any, index: number) => {
    return (
      <TouchableOpacity
        onPress={() => setUserSelected(item.id)}
        style={[
          styles.itemMainContainer,
          {
            backgroundColor: selectedUser == item.id ? '#32cd9469' : theme.colors.WHITE,
          },
        ]}
      >
        <View style={styles.itemSubContainer}>
          <View style={styles.radioInputContainer}>
            {selectedUser == item.id && <View style={styles.radioInputCircleToggle} />}
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <View style={styles.userOtherInfoContainer}>
            <Text
              style={[
                styles.userDetails,
                {
                  marginRight: 20,
                },
              ]}
            >
              AGE: {getAge(item.dateOfBirth)}
            </Text>
            <Text style={styles.userDetails}>GENDER: {item.gender}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderExistingAccount = () => {
    return (
      <View>
        <FlatList
          data={profiles || []}
          renderItem={({ item, index }) => renderUserItem(item, index)}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderWhatsAppOptIn = () => {
    return (
      <View style={styles.whatsAppOptinContainer}>
        <View style={styles.whatsAppOptinCheckboxContainer}>
          <InputCheckBox checked={whatsAppOptIn} onClick={() => setWhatsAppOptIn(!whatsAppOptIn)} />
          <Text style={styles.whatsAppPersonalisedText}>
            {string.registerationScreenData.personalisedWhatsAppTips}
          </Text>
        </View>
        <View style={{ width: '10%' }}>
          <WhatsAppIcon style={styles.whatsAppIcon} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView style={styles.container} bounces={false}>
          {renderHeader()}
          <ScrollView>
            {renderExistingAccount()}
            {showReferralCode && renderReferral()}
            {renderWhatsAppOptIn()}
          </ScrollView>
        </KeyboardAwareScrollView>
        {renderButtons()}
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View style={styles.loadingSpinner}>
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
  mascotStyle: {
    position: 'absolute',
    top: -32,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  idTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.INPUT_TEXT,
  },
  nameTextStyle: {
    paddingTop: 15,
    paddingBottom: 8,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    textTransform: 'capitalize',
  },
  textStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: theme.colors.GRAY_TWO,
    marginHorizontal: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  whatsAppOptinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  whatsAppOptinCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 2,
  },
  whatsAppIcon: {
    height: 22,
    width: 22,
    resizeMode: 'contain',
  },
  whatsAppPersonalisedText: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.LIGHT_BLUE,
  },
  referralMainContainer: {
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    alignItems: 'center',
    paddingVertical: 20,
  },
  referralHeadingText: {
    ...theme.fonts.IBMPlexSansBold(16),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 20,
  },
  referralTextInputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    borderColor: theme.colors.LIGHT_BLUE,
    backgroundColor: theme.colors.WHITE,
    textAlign: 'center',
    flex: 1,
  },
  stickyButtonMainContainer: {
    width: '100%',
  },
  stickyTextContainer: {
    backgroundColor: theme.colors.LIGHT_WHITE_GRAY,
    alignItems: 'center',
    paddingVertical: 8,
  },
  stickyText: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  stickyButtonContainer: {
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  addProfileBtnContainer: {
    borderWidth: 1,
    borderColor: theme.colors.BUTTON_ORANGE,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 5,
  },
  addProfileBtnTitle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.BUTTON_ORANGE,
  },
  confirmBtnContainer: {
    backgroundColor: theme.colors.BUTTON_ORANGE,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 5,
  },
  confirmBtnText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.WHITE,
  },
  stickyHeaderMainContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomColor: theme.colors.LIGHT_GRAY_3,
    borderBottomWidth: 1,
  },
  headerLogo: {
    width: 43,
    height: 32,
    marginBottom: 14,
  },
  headerHeadingContainer: {
    alignItems: 'center',
  },
  headerHeadingOne: {
    ...theme.fonts.IBMPlexSansMedium(12),
    fontSize: 12,
    color: theme.colors.MULTISIGNUP_HEADING_BLUE,
  },
  headerHeadingTwo: {
    ...theme.fonts.IBMPlexSansMedium(12),
    fontSize: 12,
    color: theme.colors.MULTISIGNUP_HEADING_BLUE,
    fontWeight: 'bold',
  },
  itemMainContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 72,
    borderBottomColor: theme.colors.LIGHT_GRAY_2,
    borderBottomWidth: 1,
  },
  itemSubContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInputContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.BLACK_COLOR,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInputCircleToggle: {
    width: 10,
    height: 10,
    backgroundColor: theme.colors.BLACK_COLOR,
    borderRadius: 5,
  },
  textContainer: {
    height: '100%',
    justifyContent: 'center',
    flex: 4,
  },
  userName: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: theme.colors.LIGHT_BLUE,
    fontSize: PixelRatio.getFontScale() * 15,
  },
  userOtherInfoContainer: {
    flexDirection: 'row',
  },
  userDetails: {
    ...theme.fonts.IBMPlexSansMedium(11),
    color: theme.colors.SHERPA_BLUE,
    fontSize: PixelRatio.getFontScale() * 11,
  },
  loadingSpinner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.2)',
    alignSelf: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 3,
    zIndex: 3,
  },
});
