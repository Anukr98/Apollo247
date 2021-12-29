import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import {
  Gift,
  Mascot,
  WhiteTickIcon,
  BackArrow,
  WhatsAppIcon,
  PriceTagIcon,
  CalendarIcon,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  UPDATE_PATIENT,
  CREATE_ONE_APOLLO_USER,
  INSERT_REFEREE_DATA_TO_REFERRER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  Gender,
  Relation,
  UpdatePatientInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updatePatient,
  updatePatientVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  postWEGReferralCodeEvent,
  onCleverTapUserLogin,
  postCleverTapEvent,
  deferredDeepLinkRedirectionData,
  setRefereeFlagForNewRegisterUser,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  ProductPageViewedSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { default as Moment, default as moment } from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PixelRatio,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { getDeviceTokenCount } from '@aph/mobile-patients/src/helpers/clientCalls';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  createOneApolloUser,
  createOneApolloUserVariables,
} from '@aph/mobile-patients/src/graphql/types/createOneApolloUser';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import _ from 'lodash';
import { LOGIN_PROFILE } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { CheckBox } from 'react-native-elements';
import Carousel from 'react-native-snap-carousel';
import { LinearGradientComponent } from '../ui/LinearGradientComponent';
import { MaterialMenu } from '../ui/MaterialMenu';
import { FloatingLabelInputComponent } from '../ui/FloatingLabeInputComponent';

type genderOptions = {
  name: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: 'Male',
  },
  {
    name: 'Female',
  },
  {
    name: 'Others',
  },
];

let backPressCount = 0;

export interface SignUpProps extends NavigationScreenProps {
  patient?: getPatientByMobileNumber_getPatientByMobileNumber_patients;
}
export const SignUpNew: React.FC<SignUpProps> = (props) => {
  const patient = props.navigation.getParam('patient');
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailValidation, setEmailValidation] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const [referral, setReferral] = useState<string>('');
  const { signOut, getPatientApiCall } = useAuth();
  const [isValidReferral, setValidReferral] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [showReferralCode, setShowReferralCode] = useState<boolean>(false);
  const [oneApolloRegistrationCalled, setoneApolloRegistrationCalled] = useState<boolean>(false);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState<boolean>(false);
  const isOneTimeUpdate = useRef<boolean>(false);

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};

  const isSatisfyingNameRegex = (value: string) =>
    value == ' '
      ? false
      : value == '' || /^[a-zA-Z]+((['’ ][a-zA-Z])?[a-zA-Z]*)*$/.test(value)
      ? true
      : false;
  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const isSatisfyEmailRegex = (value: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
    setEmailValidation(isSatisfyEmailRegex(trimmedValue));
  };

  const _setFirstName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setlastName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setLastName(value);
    } else {
      return false;
    }
  };

  const renderOfferCrousel = () => {
    return (
      <Carousel
        data={[1, 2, 3, 4]}
        renderItem={({ item }) => (
          <LinearGradientComponent
            startOffset={{ x: 0, y: 1 }}
            endOffset={{ x: 1, y: 0 }}
            colors={['#F3ECD9', '#FFE8AD']}
            style={{
              borderColor: theme.colors.LIGHT_GRAY_2,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flex: 0.15,
                  alignItems: 'center',
                }}
              >
                <PriceTagIcon
                  style={{
                    width: 30,
                    height: 40,
                  }}
                />
              </View>
              <View
                style={{
                  paddingVertical: 12,
                  alignItems: 'center',
                  flex: 0.9,
                }}
              >
                <Text
                  style={{
                    color: '#A15D59',
                    fontSize: 17,
                    fontWeight: 'bold',
                  }}
                >
                  Flat 25% off + ₹100 cashback
                </Text>
                <Text
                  style={{
                    color: '#A15D59',
                    fontSize: 12,
                  }}
                >
                  On first medicine order
                </Text>
              </View>
            </View>
          </LinearGradientComponent>
        )}
        sliderWidth={Dimensions.get('window').width}
        itemWidth={Dimensions.get('window').width - 70}
      />
    );
  };

  const renderReferral = () => {
    return (
      <FloatingLabelInputComponent
        maxLength={25}
        label={'Do You Have A Referral Code? (Optional)'}
        value={referral}
        onChangeText={(text) => setReferral(text)}
        icon={referral.length > 0 ? <WhiteTickIcon /> : null}
      />
    );
  };

  const renderRelation = () => {
    const selectedGenderRelationArray = [
      { key: Relation.ME, title: 'Self' },
      {
        key: Relation.FATHER,
        title: 'Father',
      },
      {
        key: Relation.SON,
        title: 'Son',
      },
      {
        key: Relation.HUSBAND,
        title: 'Husband',
      },
      {
        key: Relation.BROTHER,
        title: 'Brother',
      },
      {
        key: Relation.SISTER,
        title: 'Sister',
      },
      {
        key: Relation.GRANDFATHER,
        title: 'Grandfather',
      },
      {
        key: Relation.GRANDSON,
        title: 'Grandson',
      },
      {
        key: Relation.COUSIN,
        title: 'Cousin',
      },
      {
        key: Relation.OTHER,
        title: 'Other',
      },
    ];
    const relationsData = selectedGenderRelationArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    const { width, height } = Dimensions.get('window');
    const relation = { title: '' };
    return (
      <MaterialMenu
        options={relationsData}
        selectedText={''}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedRelation) => {}}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                {
                  color: theme.colors.LIGHT_BLUE,
                  fontSize: 13,
                  marginBottom: 10,
                  marginLeft: 10,
                  fontWeight: '600',
                },
              ]}
            >
              Profile Created For
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          {...keyboardVerticalOffset}
        >
          <View
            style={{
              alignItems: 'center',
              paddingTop: 40,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.LIGHT_GRAY_3,
            }}
          >
            <ApolloLogo />
            <View
              style={{
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: theme.colors.LIGHT_BLUE,
                }}
              >
                Create Profile
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.LIGHT_BLUE,
                }}
              >
                You are a step away from unlocking exclusive offers!
              </Text>
            </View>
            <View
              style={{
                height: 100,
                paddingTop: 10,
              }}
            >
              {renderOfferCrousel()}
            </View>
          </View>
          <ScrollView
            style={styles.container} //extraScrollHeight={50}
            bounces={false}
          >
            <View
              style={{
                paddingHorizontal: 30,
              }}
            >
              <FloatingLabelInputComponent
                label={'First Name'}
                onChangeText={(text: string) => _setFirstName(text)}
                value={firstName}
                textInputprops={{
                  maxLength: 50,
                }}
              />
              <FloatingLabelInputComponent
                label={'Last Name'}
                onChangeText={(text: string) => _setlastName(text)}
                value={lastName}
                textInputprops={{
                  maxLength: 50,
                }}
                labelStyle={{
                  fontSize: PixelRatio.getFontScale() * 14,
                  color: '#02475b',
                  fontWeight: '500',
                }}
                inputStyle={{
                  borderBottomColor: '#02475B',
                  borderBottomWidth: 1,
                }}
              />
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#02475b',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
                onPress={() => {
                  CommonLogEvent(AppRoutes.SignUp, 'Date picker display');

                  Keyboard.dismiss();
                  setIsDateTimePickerVisible(true);
                }}
              >
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(18),
                    color: '#02475b',
                    fontSize: date !== '' ? 11 : 14,
                    marginLeft: 10,
                    fontWeight: '600',
                    position: 'absolute',
                    top: date !== '' ? -18 : 0,
                  }}
                >
                  Date Of Birth (DD/MM/YY)
                </Text>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(18),
                    color: '#02475b',
                    marginBottom: 10,
                    fontSize: 14,
                    marginLeft: 10,
                    fontWeight: '600',
                  }}
                >
                  {date}
                </Text>
                <CalendarIcon />
              </TouchableOpacity>
              <DatePicker
                date={
                  date
                    ? moment(date, 'DD/MM/YYYY').toDate()
                    : moment()
                        .subtract(25, 'years')
                        .toDate()
                }
                isDateTimePickerVisible={isDateTimePickerVisible}
                handleDatePicked={(date) => {
                  setIsDateTimePickerVisible(false);
                  const formatDate = Moment(date).format('DD/MM/YYYY');
                  setDate(formatDate);
                  Keyboard.dismiss();
                }}
                hideDateTimePicker={() => {
                  setIsDateTimePickerVisible(false);
                  Keyboard.dismiss();
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  paddingTop: 20,
                  justifyContent: 'space-between',
                }}
              >
                {GenderOptions.map((option) => (
                  <TouchableOpacity
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(18),
                      borderColor: theme.colors.GREEN,
                      borderWidth: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 28,
                      borderRadius: 10,
                      backgroundColor: gender === option.name ? theme.colors.GREEN : '#fff',
                    }}
                    onPress={() => {
                      CommonLogEvent(AppRoutes.SignUp, 'set gender clicked'),
                        setGender(option.name);
                    }}
                  >
                    <Text
                      style={{
                        ...theme.fonts.IBMPlexSansMedium(18),
                        fontSize: 12,
                        color: gender === option.name ? '#fff' : theme.colors.GREEN,
                        fontWeight: '800',
                      }}
                    >
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={{
                  marginTop: 25,
                }}
              >
                {renderRelation()}
              </View>
              <FloatingLabelInputComponent
                label={'Email (Optional)'}
                onChangeText={(text: string) => {}}
                value={firstName}
                textInputprops={{
                  maxLength: 50,
                }}
              />

              {renderReferral()}
            </View>
          </ScrollView>
          <StickyBottomComponent position={false}>
            <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
              {(mutate, { loading, data, error }) => (
                <Button
                  title={'SAVE'}
                  style={{ width: '100%', borderRadius: 0 }}
                  titleTextStyle={{
                    fontSize: 15,
                  }}
                  disabled={!firstName || !lastName || !date || !gender}
                  onPress={async () => {
                    Keyboard.dismiss();
                    CommonLogEvent(AppRoutes.SignUp, 'Sign button clicked');
                    let validationMessage = '';
                    let trimReferral = referral;
                    if (!(firstName && isSatisfyingNameRegex(firstName.trim()))) {
                      validationMessage = 'Enter valid first name';
                    } else if (!(lastName && isSatisfyingNameRegex(lastName.trim()))) {
                      validationMessage = 'Enter valid last name';
                    } else if (!date) {
                      validationMessage = 'Enter valid date of birth';
                    } else if (email) {
                      if (!emailValidation) {
                        validationMessage = 'Enter valid email';
                      }
                    } else if (!gender) {
                      validationMessage = 'Please select gender';
                    } else if (referral !== '') {
                      trimReferral = trimReferral.trim();
                    }
                    if (validationMessage) {
                      Alert.alert('Error', validationMessage);
                    } else {
                      setVerifyingPhoneNumber(true);
                      const formatDate = Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

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

                      const mePatient = allPatients
                        ? allPatients.find((patient: any) => patient.relation === Relation.ME) ||
                          allPatients[0]
                        : null;

                      const patientsDetails: UpdatePatientInput = {
                        id: mePatient.id,
                        // whatsAppOptIn: whatsAppOptIn,  It will use in future, but right now this is not working So I just commented it
                        // mobileNumber: mePatient.mobileNumber,
                        // firstName: firstName.trim(),
                        // lastName: lastName.trim(),
                        // relation: Relation.ME,
                        // gender:
                        //   gender === 'Female'
                        //     ? Gender['FEMALE']
                        //     : gender === 'Male'
                        //     ? Gender['MALE']
                        //     : Gender['OTHER'], //gender.toUpperCase(),
                        // uhid: '',
                        // dateOfBirth: formatDate,
                        // emailAddress: email.trim(),
                        // referralCode: trimReferral ? trimReferral : null,
                        // deviceCode: deviceToken,
                      };
                      mutate({
                        variables: {
                          patientInput: patientsDetails,
                        },
                      });
                    }
                  }}
                >
                  {error
                    ? (signOut(),
                      AsyncStorage.setItem('userLoggedIn', 'false'),
                      AsyncStorage.setItem('multiSignUp', 'false'),
                      AsyncStorage.setItem('signUp', 'false'),
                      CommonLogEvent(AppRoutes.SignUp, 'Error going back to login'),
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
        </KeyboardAvoidingView>
      </SafeAreaView>
      {verifyingPhoneNumber ? <Spinner /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
});
