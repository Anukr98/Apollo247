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
  AsyncStorage,
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
import {
  Relation,
  UpdatePatientInput,
  DEVICE_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updatePatientVariables,
  updatePatient,
  updatePatient_updatePatient_patient,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import moment from 'moment';
import { StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { handleGraphQlError, getRelations } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { TextInputComponent } from './ui/TextInputComponent';
import { db } from '../strings/FirebaseConfig';
import { AppConfig } from '../strings/AppConfig';

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
  const { analytics, signOut, getPatientByPrism } = useAuth();
  const [profiles, setProfiles] = useState<GetCurrentPatients_getCurrentPatients_patients[] | null>(
    []
  );
  const [discriptionText, setDiscriptionText] = useState<string>('');
  const [showText, setShowText] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [referredBy, setReferredBy] = useState<string>();
  const [referral, setReferral] = useState<string>('');
  const [isValidReferral, setValidReferral] = useState<boolean>(false);

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
    if (allCurrentPatients && allCurrentPatients.length) {
      if (!allCurrentPatients[0].relation) allCurrentPatients[0].relation = Relation.ME;
    }
    setProfiles(allCurrentPatients ? allCurrentPatients : []);
    if (allCurrentPatients && allCurrentPatients.length > 0) {
      setShowText(true);
    }
    AsyncStorage.setItem('multiSignUp', 'true');
  }, [allCurrentPatients]);

  // useEffect(() => {
  //   setProfiles(allCurrentPatients ? allCurrentPatients : []);
  //   const length =
  //     profiles &&
  //     (profiles.length == 1 ? profiles.length + ' account' : profiles.length + ' accounts');
  //   const baseString =
  //     'We have found ' +
  //     length +
  //     ' registered with this mobile number. Please tell us who is who ? :)';
  //   setDiscriptionText(baseString);

  //   if (length !== 'undefined accounts') {
  //     setShowText(true);
  //     // console.log('length', length);
  //   }
  //   // console.log('discriptionText', discriptionText);
  //   // console.log('allCurrentPatients', allCurrentPatients);
  // }, [currentPatient, allCurrentPatients, analytics, profiles, discriptionText, showText]);

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
                  // style={styles.placeholderViewStyle}
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
                    console.log('result', result);
                    console.log('result length', result.length);

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
                if (profiles) {
                  const result = profiles.filter((obj) => {
                    return obj.relation == Relation['ME'];
                  });
                  if (result.length === 0) {
                    Alert.alert('Apollo', 'There should be 1 profile with relation set as Me');
                    CommonLogEvent(
                      AppRoutes.MultiSignup,
                      'There should be 1 profile with relation set as Me'
                    );
                  } else if (referral !== '' && !isValidReferral) {
                    Alert.alert('Apollo', 'Enter valid referral code');
                  } else {
                    setVerifyingPhoneNumber(true);

                    try {
                      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
                      const versionInput = {
                        appVersion:
                          Platform.OS === 'ios'
                            ? AppConfig.Configuration.iOS_Version
                            : AppConfig.Configuration.Android_Version,
                        deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
                      };
                      db.ref('ApolloPatientsNewUser/')
                        .push({
                          mobileNumber: storedPhoneNumber,
                          versionInput: versionInput,
                          referralCode: referral ? referral : null,
                          relation: 'true',
                        })
                        .then((data: any) => {
                          //success callback
                          console.log('getPatientByPrismdata ', data);
                        })
                        .catch((error: Error) => {
                          //error callback
                          console.log('getPatientByPrismerror ', error);
                        });
                    } catch (error) {}

                    profiles.forEach(async (profile: updatePatient_updatePatient_patient) => {
                      const patientsDetails: UpdatePatientInput = {
                        id: profile.id || '',
                        relation: Relation[profile.relation!], // profile ? profile.relation!.toUpperCase() : '',
                        referralCode: (profile.relation == Relation.ME && referral) || null,
                      };
                      console.log('patientsDetails', { patientsDetails });
                      CommonLogEvent(AppRoutes.MultiSignup, 'Update API clicked');
                      mutate({
                        variables: {
                          patientInput: patientsDetails,
                        },
                      });
                    });
                  }
                }
              }}
            >
              {data
                ? (setVerifyingPhoneNumber(false),
                  console.log('data', data.updatePatient.patient),
                  getPatientByPrism(),
                  AsyncStorage.setItem('userLoggedIn', 'true'),
                  AsyncStorage.setItem('multiSignUp', 'false'),
                  AsyncStorage.setItem('gotIt', 'false'),
                  CommonLogEvent(AppRoutes.MultiSignup, 'Navigating to Consult Room'),
                  setTimeout(() => {
                    props.navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        key: null,
                        actions: [
                          NavigationActions.navigate({
                            routeName: AppRoutes.ConsultRoom,
                          }),
                        ],
                      })
                    );
                  }, 500))
                : null}
              {error
                ? (setVerifyingPhoneNumber(false),
                  signOut(),
                  handleGraphQlError(error),
                  console.log('updatePatient error', error),
                  AsyncStorage.setItem('userLoggedIn', 'false'),
                  AsyncStorage.setItem('multiSignUp', 'false'),
                  AsyncStorage.setItem('signUp', 'false'),
                  CommonLogEvent(AppRoutes.MultiSignup, 'Navigating to Consult Room'),
                  setTimeout(() => {
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
            maxLength={8}
            label={
              'Do You Have A Referral Code? (Optional)'
              // referredBy
              //   ? `${referredBy} Has Sent You A Referral Code!`
              //   : 'Do You Have A Referral Code? (Optional)'
            }
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
            icon={isValidReferral ? <WhiteTickIcon /> : null}
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
              {renderReferral()}
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
