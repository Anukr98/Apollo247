import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import {
  DropdownGreen,
  Mascot,
  WhiteTickIcon,
  Gift,
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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { TextInputComponent } from './ui/TextInputComponent';
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
import { FirebaseEventName, FirebaseEvents } from '../helpers/firebaseEvents';
import { useApolloClient } from 'react-apollo-hooks';
import { getDeviceTokenCount } from '../helpers/clientCalls';
import {
  createOneApolloUser,
  createOneApolloUserVariables,
} from '@aph/mobile-patients/src/graphql/types/createOneApolloUser';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';

const { width, height } = Dimensions.get('window');

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
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: '#01475b',
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
});

type currentProfiles = {
  firstName: string;
  id: string;
  lastName: string;
  mobileNumber: string;
  gender: string;
  uhid: string;
  relation?: string;
};

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
  const [showText, setShowText] = useState<boolean>(false);
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
        setShowText(true);
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

  const renderUserForm = (
    allCurrentPatients: GetCurrentPatients_getCurrentPatients_patients | null,
    i: number
  ) => {
    if (allCurrentPatients)
      return (
        <View>
          <View
            style={{
              marginTop: 12,
              borderRadius: 5,
              backgroundColor: '#f7f8f5',
              padding: 16,
              paddingBottom: 6,
            }}
          >
            <View style={{ flex: 1 }}></View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomColor: 'rgba(2,71,91, 0.3)',
                borderBottomWidth: 0.5,
                paddingBottom: 8,
              }}
            >
              <Text style={styles.idTextStyle}>{i + 1}.</Text>
              <Text style={styles.idTextStyle}>{allCurrentPatients.uhid}</Text>
            </View>
            <Text style={styles.nameTextStyle}>
              {allCurrentPatients.firstName} {allCurrentPatients.lastName}
            </Text>
            {allCurrentPatients.gender || allCurrentPatients.dateOfBirth ? (
              <Text
                style={[
                  styles.idTextStyle,
                  { textTransform: 'capitalize', color: theme.colors.SHERPA_BLUE },
                ]}
              >
                {allCurrentPatients.gender}{' '}
                {allCurrentPatients.dateOfBirth && allCurrentPatients.gender ? '| ' : ''}
                {moment(allCurrentPatients.dateOfBirth).format('DD MMMM YYYY')}
              </Text>
            ) : null}
            <View style={{ marginTop: 10 }}>
              <View style={{ paddingTop: 5, paddingBottom: 10 }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.MultiSignup, 'show popup for relation checking');
                    setShowPopup(true);
                    setRelationIndex(i);
                  }}
                >
                  <View style={styles.placeholderViewStyle}>
                    <Text
                      style={[
                        styles.placeholderTextStyle,
                        allCurrentPatients.relation ? null : styles.placeholderStyle,
                      ]}
                    >
                      {allCurrentPatients.relation
                        ? allCurrentPatients.relation.replace(
                            /\w+/g,
                            (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()
                          )
                        : 'Relation'}
                    </Text>
                    <DropdownGreen size="sm" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    return null;
  };
  const isDisabled = () => {
    const filteredProfiles = profiles ? profiles.filter((obj) => obj.relation) : [];
    if (profiles && profiles.length === filteredProfiles.length) {
      return false;
    }
    return true;
  };

  type RelationArray = {
    key: Relation;
    title: string;
  };

  const Options2: RelationArray[] = [
    {
      title: 'Me',
      key: Relation.ME,
    },
    {
      title: 'Mother',
      key: Relation.MOTHER,
    },
    {
      title: 'Father',
      key: Relation.FATHER,
    },
    {
      title: 'Sister',
      key: Relation.SISTER,
    },
    {
      title: 'Brother',
      key: Relation.BROTHER,
    },
    {
      title: 'Cousin',
      key: Relation.COUSIN,
    },
    {
      title: 'Wife',
      key: Relation.WIFE,
    },
    {
      title: 'Husband',
      key: Relation.HUSBAND,
    },
  ];
  const Options = getRelations('Me') || Options2;
  const Popup = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => (
        CommonLogEvent(AppRoutes.MultiSignup, 'Hide popup clicked'), setShowPopup(false)
      )}
    >
      <View
        style={{
          width: 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          marginTop: Platform.OS === 'ios' ? 10 : 8,
          marginBottom: Platform.OS === 'ios' ? 16 : 30,
        }}
      >
        <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          {Options.map(({ title, key }) => (
            <View style={styles.textViewStyle}>
              <Text
                style={styles.textStyle}
                onPress={() => {
                  if (profiles) {
                    profiles[relationIndex].relation = Relation[key];
                    const result = profiles.filter((obj) => {
                      return obj.relation == Relation['ME'];
                    });

                    if (result.length > 1) {
                      profiles[relationIndex].relation = null;
                      Alert.alert('Apollo', 'Me is already choosen for another profile.');
                      CommonLogEvent(
                        AppRoutes.MultiSignup,
                        'Me is already choosen for another profile.'
                      );
                    }

                    setProfiles(profiles);
                    setShowPopup(false);
                    CommonLogEvent(AppRoutes.MultiSignup, 'Select the relations for the profile');
                  }
                }}
              >
                {title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );

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
      if (referral) {
        // only send if referral has a value
        eventAttributes['Referral Code'] = referral;
        postWEGReferralCodeEvent(referral);
      }

      postWebEngageEvent(WebEngageEventName.REGISTRATION_DONE, eventAttributes);

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
      pushTheView(props.navigation, routeName, id ? id : undefined, isCall, undefined, mediaSource);
    } catch (error) {}
  };

  const renderButtons = () => {
    return (
      <StickyBottomComponent>
        <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
          {(mutate, { loading, data, error }) => (
            <Button
              style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
              title={'SUBMIT'}
              disabled={isDisabled()}
              onPress={async () => {
                Keyboard.dismiss();
                let trimReferral = referral;
                if (profiles) {
                  if (referral !== '') {
                    trimReferral = trimReferral.trim();
                  }
                  setVerifyingPhoneNumber(true);

                  profiles.forEach(async (profile: updatePatient_updatePatient_patient) => {
                    const patientsDetails: UpdatePatientInput = {
                      id: profile.id,
                      relation: Relation[profile.relation!], // profile ? profile.relation!.toUpperCase() : '',
                      referralCode: trimReferral || null,
                      deviceCode: deviceToken,
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
                  });
                }
              }}
            >
              {data
                ? (getPatientApiCall(),
                  AsyncStorage.setItem('userLoggedIn', 'true'),
                  AsyncStorage.setItem('multiSignUp', 'false'),
                  AsyncStorage.setItem('gotIt', 'false'),
                  onCleverTapUserLogin(data?.updatePatient?.patient),
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
      </StickyBottomComponent>
    );
  };

  const renderReferral = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.SKY_BLUE,
          marginHorizontal: -20,
          paddingVertical: 20,
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
          <Gift style={{ marginRight: 20, marginTop: 12 }} />
          <TextInputComponent
            maxLength={25}
            label={'Do You Have A Referral Code? (Optional)'}
            labelStyle={{ ...theme.viewStyles.text('M', 14, '#ffffff'), marginBottom: 12 }}
            placeholder={'Enter referral code'}
            placeholderTextColor={'rgba(255,255,255,0.6)'}
            inputStyle={{
              borderColor: theme.colors.WHITE,
              color: theme.colors.WHITE,
            }}
            conatinerstyles={{ width: '78%' }}
            value={referral}
            onChangeText={(text) => setReferral(text)}
            icon={referral.length > 0 ? <WhiteTickIcon /> : null}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <MenuProvider customStyles={{ menuProviderWrapper: { flex: 1 } }}>
          <KeyboardAwareScrollView style={styles.container} bounces={false}>
            <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
              <ApolloLogo />
            </View>

            <Card
              cardContainer={{
                marginHorizontal: 0,
                marginTop: 20,
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.4,
                backgroundColor: theme.colors.WHITE,
              }}
              headingTextStyle={{ paddingBottom: 20 }}
              heading={string.login.welcome_text}
              description={
                showText
                  ? 'We have found ' +
                    ((profiles || []).length == 1
                      ? (profiles || []).length + ' account'
                      : (profiles || []).length + ' accounts') +
                    ' registered with this mobile number. Please tell us who is who ? :)'
                  : string.login.multi_signup_desc
              }
              descriptionTextStyle={{ paddingBottom: 50 }}
            >
              <View style={styles.mascotStyle}>
                <Mascot />
              </View>
              {profiles &&
                profiles.map((allCurrentPatients, i: number) => (
                  <View key={i}>{renderUserForm(allCurrentPatients, i)}</View>
                ))}
              {showReferralCode && renderReferral()}
              <View style={{ height: 80 }} />
            </Card>
          </KeyboardAwareScrollView>
          {renderButtons()}
        </MenuProvider>
        {showPopup && Popup()}
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View
          style={{
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
          }}
        >
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
