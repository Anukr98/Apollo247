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
  DropdownBlue,
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
  ADD_NEW_PROFILE,
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
  getRelations,
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
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { FloatingLabelInputComponent } from '@aph/mobile-patients/src/components/ui/FloatingLabeInputComponent';
import { InputCheckBox } from '@aph/mobile-patients/src/components/ui/InputCheckBox';
import { getOfferCarouselForRegisteration } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addNewProfile,
  addNewProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/addNewProfile';

const { width, height } = Dimensions.get('window');

type genderOptions = {
  name: string;
};

type RelationArray = {
  key: Relation;
  title: string;
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

const relationArray1: RelationArray[] = [
  { key: Relation.ME, title: 'Self' },
  {
    key: Relation.FATHER,
    title: 'Father',
  },
  {
    key: Relation.MOTHER,
    title: 'Mother',
  },
  {
    key: Relation.HUSBAND,
    title: 'Husband',
  },
  {
    key: Relation.WIFE,
    title: 'Wife',
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
    key: Relation.COUSIN,
    title: 'Cousin',
  },
  {
    key: Relation.OTHER,
    title: 'Other',
  },
];

let backPressCount = 0;

export interface SignUpProps extends NavigationScreenProps {
  patient?: getPatientByMobileNumber_getPatientByMobileNumber_patients;
}
const SignUp: React.FC<SignUpProps> = (props) => {
  const [selectedGenderRelationArray, setSelectedGenderRelationArray] = useState<RelationArray[]>(
    getRelations() || relationArray1
  );
  const patient = props.navigation.getParam('patient');
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [genderNotSelectError, setGenderNotSelectError] = useState({
    error: false,
    errorMsg: '',
  });
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailValidation, setEmailValidation] = useState<boolean>(false);
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const [referral, setReferral] = useState<string>('');
  const { signOut, getPatientApiCall } = useAuth();
  const [isValidReferral, setValidReferral] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [showReferralCode, setShowReferralCode] = useState<boolean>(false);
  const [oneApolloRegistrationCalled, setoneApolloRegistrationCalled] = useState<boolean>(false);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState<boolean>(true);
  const isOneTimeUpdate = useRef<boolean>(false);
  const [relation, setRelation] = useState<RelationArray>();
  const client = useApolloClient();
  const [isSignupEventFired, setSignupEventFired] = useState(false);
  const [offers, setOffers] = useState<any>([]);

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

  useEffect(() => {
    const isValidReferralCode = /^[a-zA-Z]{4}[0-9]{4}$/.test(referral);
    setValidReferral(isValidReferralCode);
  }, [referral]);

  useEffect(() => {
    checkPatientData();
    getDeviceCountAPICall();
    getPrefillReferralCode();
    getAllOffersForRegisterations();
  }, []);

  useEffect(() => {
    if (gender.toLowerCase() == Gender.MALE.toLowerCase()) {
      setRelation(undefined);
      const maleRelationArray: RelationArray[] = [
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
      setSelectedGenderRelationArray(maleRelationArray);
    } else if (gender.toLowerCase() == Gender.FEMALE.toLowerCase()) {
      setRelation(undefined);
      const femaleRelationArray: RelationArray[] = [
        { key: Relation.ME, title: 'Self' },
        {
          key: Relation.MOTHER,
          title: 'Mother',
        },
        {
          key: Relation.DAUGHTER,
          title: 'Daughter',
        },
        {
          key: Relation.WIFE,
          title: 'Wife',
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
          key: Relation.GRANDMOTHER,
          title: 'Grandmother',
        },
        {
          key: Relation.GRANDDAUGHTER,
          title: 'Granddaughter',
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
      setSelectedGenderRelationArray(femaleRelationArray);
    } else {
      setSelectedGenderRelationArray(relationArray1);
    }
  }, [gender]);

  useEffect(() => {
    AsyncStorage.setItem('signUp', 'true');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      try {
        if (patient) {
          props.navigation.goBack();
        } else {
          if (backPressCount === 1) {
            BackHandler.exitApp();
          } else {
            backPressCount++;
          }
        }
        return true;
      } catch (e) {
        CommonBugFender('Sign_up_backpressed', e);
      }
    });
    return function cleanup() {
      backHandler.remove();
    };
  }, []);

  const _postWebEngageEvent = () => {
    if (isSignupEventFired) {
      return;
    }
    try {
      const eventAttributes: WebEngageEvents[WebEngageEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient ? currentPatient.id : '',
        'Customer First Name': firstName.trim(),
        'Customer Last Name': lastName.trim(),
        'Date of Birth': currentPatient?.dateOfBirth || Moment(date, 'DD/MM/YYYY').toDate(),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        Email: email.trim(),
        'Mobile Number': currentPatient?.mobileNumber,
      };
      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient ? currentPatient.id : '',
        'Full Name': firstName?.trim() + ' ' + lastName?.trim(),
        DOB: currentPatient?.dateOfBirth || Moment(date, 'DD/MM/YYYY').toDate(),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        'Email ID': email?.trim(),
        'Mobile Number': currentPatient?.mobileNumber,
        'Nav src': 'App login screen',
        'Page Name': 'Signup Screen',
      };
      if (referral) {
        // only send if referral has a value
        eventAttributes['Referral Code'] = referral;
        cleverTapEventAttributes['Referral Code'] = referral;
      }

      const eventFirebaseAttributes: FirebaseEvents[FirebaseEventName.SIGN_UP] = {
        Customer_ID: currentPatient ? currentPatient.id : '',
        Customer_First_Name: firstName.trim(),
        Customer_Last_Name: lastName.trim(),
        Date_of_Birth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        Email: email.trim(),
      };
      if (referral) {
        // only send if referral has a value
        eventFirebaseAttributes['Referral_Code'] = referral;
        postWEGReferralCodeEvent(referral);
      }

      postWebEngageEvent(WebEngageEventName.REGISTRATION_DONE, eventAttributes);
      postCleverTapEvent(CleverTapEventName.REGISTRATION_DONE, cleverTapEventAttributes);
      const appsflyereventAttributes: any = {
        af_customer_user_id: currentPatient ? currentPatient.id : '',
      };
      if (referral) {
        // only send if referral has a value
        appsflyereventAttributes['referral code'] = referral;
      }
      postAppsFlyerEvent(AppsFlyerEventName.REGISTRATION_DONE, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.SIGN_UP, eventFirebaseAttributes);
      setSignupEventFired(true);
    } catch (error) {}
  };

  const handleOpenURLs = async () => {
    try {
      deferredDeepLinkRedirectionData(props.navigation, async () => {
        const event: any = await AsyncStorage.getItem('deeplink');
        const data: any = handleOpenURL(event);
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
      });
    } catch (error) {}
  };

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

  const postAppsFlyerEventAppInstallViaReferral = async (data: any) => {
    const referralData: any = await AsyncStorage.getItem('app_referral_data');
    setRefereeFlagForNewRegisterUser(referralData !== null);
    onCleverTapUserLogin({ ...data?.updatePatient?.patient });
    if (referralData !== null) {
      const { af_referrer_customer_id, campaign, rewardId, shortlink } = JSON.parse(referralData);
      const eventAttribute = {
        referrer_id: af_referrer_customer_id,
        referee_id: currentPatient ? currentPatient.id : '',
        campaign_id: campaign,
        reward_id: rewardId,
        short_link: shortlink,
        device_os: Platform.OS == 'ios' ? 'IOS' : 'ANDROID',
      };
      postAppsFlyerEvent(AppsFlyerEventName.REGISTRATION_REFERRER, eventAttribute);
      AsyncStorage.removeItem('app_referral_data');
      AsyncStorage.setItem('referrerInstall', 'true');
    }
    handleOpenURLs();
  };

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

  const getPrefillReferralCode = async () => {
    const deeplinkReferalCode: any = await AsyncStorage.getItem('deeplinkReferalCode');

    if (deeplinkReferalCode !== null && deeplinkReferalCode !== undefined) {
      setReferral(deeplinkReferalCode);
    }
  };

  const checkPatientData = async () => {
    const storedPatient = await AsyncStorage.getItem(LOGIN_PROFILE);
    const parsedPatient = storedPatient && JSON.parse(storedPatient);
    if (!isOneTimeUpdate.current && (patient || parsedPatient)) {
      isOneTimeUpdate.current = true;
      setFirstName(patient?.firstName || parsedPatient?.firstName);
      setLastName(patient?.lastName || parsedPatient?.lastName);
      const email = patient?.emailAddress || parsedPatient?.emailAddress;
      const trimmedValue = (email || '').trim();
      setEmail(trimmedValue);
      setEmailValidation(isSatisfyEmailRegex(trimmedValue));
      const patientGender = patient?.gender || parsedPatient?.gender || '';
      patientGender?.toUpperCase() !== Gender.OTHER?.toUpperCase() &&
        setGender(_.capitalize(patientGender));
      if (patient?.dateOfBirth || parsedPatient?.dateOfBirth) {
        const formatDate = Moment(patient?.dateOfBirth || parsedPatient?.dateOfBirth).format(
          'DD/MM/YYYY'
        );
        setDate(formatDate);
      }
    }
  };

  const getAllOffersForRegisterations = () => {
    getOfferCarouselForRegisteration().then((res) => {
      if (res?.data.data) {
        let response = res.data.data;
        let responseKeys = Object.keys(response);
        let imageArray = responseKeys.map((item: string) => response[item].image);
        imageArray = imageArray.filter((item) => item != '');
        setOffers([...imageArray]);
      }
    });
  };
  const renderOfferCrousel = () => {
    return (
      <Carousel
        data={offers}
        renderItem={(item: any) => (
          <Image source={{ uri: item.item.toString() }} style={styles.offerCarouselImage} />
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
        label={string.registerationScreenData.referralLabel}
        value={referral}
        onChangeText={(text) => setReferral(text)}
        icon={referral.length > 0 ? <WhiteTickIcon /> : null}
      />
    );
  };

  const renderRelation = () => {
    const relationsData = selectedGenderRelationArray.map((i) => {
      return { key: i.key, value: i.title };
    });

    return (
      <MaterialMenu
        options={relationsData}
        selectedText={relation && relation.key.toString()}
        menuContainerStyle={styles.materialMenuContainer}
        itemContainer={styles.materialItemContainer}
        itemTextStyle={styles.materialItemText}
        selectedTextStyle={styles.materialSelcetedItemText}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedRelation) =>
          setRelation({
            key: selectedRelation.key as Relation,
            title: selectedRelation.value.toString(),
          })
        }
      >
        <View
          style={[
            styles.placeholderViewStyle,
            styles.relationInputContainer,
            { flexDirection: 'row', paddingTop: 20 },
          ]}
        >
          <Text
            style={[
              styles.relationInputLabel,
              {
                fontSize:
                  relation !== undefined
                    ? PixelRatio.getFontScale() * 11
                    : PixelRatio.getFontScale() * 14,

                top: relation !== undefined ? 0 : 20,
              },
            ]}
          >
            {string.registerationScreenData.profileCreatedFor}
          </Text>
          <Text style={styles.relationInput}>{relation !== undefined && relation.title}</Text>
          <View style={[styles.relationDropdownCaret]}>
            <DropdownBlue style={styles.dropdownCaret} />
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderStickyHeader = () => {
    return (
      <View style={styles.stickyHeaderMainContainer}>
        <ApolloLogo style={styles.appLogo} />
        <View style={styles.stickyHeaderTextContainer}>
          <Text style={styles.stickyHeaderMainHeading}>
            {string.registerationScreenData.headerOneHeading}
          </Text>
          <Text style={styles.stickyHeaderSubHeading}>
            {string.registerationScreenData.headerTwoHeading}
          </Text>
        </View>
        <View style={styles.stickyHeaderOfferContain}>{renderOfferCrousel()}</View>
      </View>
    );
  };

  const renderFormAllInputs = () => {
    return (
      <View style={styles.formContainer}>
        <FloatingLabelInputComponent
          label={string.registerationScreenData.firstName}
          onChangeText={(text: string) => _setFirstName(text)}
          value={firstName}
          textInputprops={{
            maxLength: 50,
          }}
        />
        <FloatingLabelInputComponent
          label={string.registerationScreenData.lastName}
          onChangeText={(text: string) => _setlastName(text)}
          value={lastName}
          textInputprops={{
            maxLength: 50,
          }}
        />
        <TouchableOpacity
          activeOpacity={1}
          style={styles.datePickerContainer}
          onPress={() => {
            CommonLogEvent(AppRoutes.SignUp, 'Date picker display');

            Keyboard.dismiss();
            setIsDateTimePickerVisible(true);
          }}
        >
          <Text
            style={[
              styles.dateOfBirthTextLabel,
              {
                fontSize: date !== '' ? 11 : 14,
                top: date !== '' ? -18 : 0,
              },
            ]}
          >
            {string.registerationScreenData.dateofBirth}
          </Text>
          <Text style={styles.dateOfBirth}>{date}</Text>
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
        <View style={styles.selectGenderContainer}>
          {GenderOptions.map((option) => (
            <TouchableOpacity
              style={[
                styles.genderButtonContainer,
                {
                  borderColor: genderNotSelectError.error
                    ? theme.colors.REMOVE_RED
                    : theme.colors.GREEN,
                  backgroundColor: gender === option.name ? theme.colors.GREEN : theme.colors.WHITE,
                },
              ]}
              onPress={() => {
                setGenderNotSelectError({
                  error: false,
                  errorMsg: '',
                });
                CommonLogEvent(AppRoutes.SignUp, 'set gender clicked'), setGender(option.name);
              }}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  {
                    color: genderNotSelectError.error
                      ? theme.colors.REMOVE_RED
                      : gender === option.name
                      ? theme.colors.WHITE
                      : theme.colors.GREEN,
                  },
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {genderNotSelectError.error && (
          <Text style={styles.genderErrorMsgText}>{genderNotSelectError.errorMsg} *</Text>
        )}
        <View style={styles.relationContainer}>{renderRelation()}</View>
        <FloatingLabelInputComponent
          label={string.registerationScreenData.Email}
          onChangeText={(text: string) => _setEmail(text)}
          value={email}
          autoCapitalize="none"
          textInputprops={{
            maxLength: 50,
          }}
        />
        {showReferralCode && renderReferral()}
        <View style={styles.whatsAppOptinContainer}>
          <View style={styles.whatsAppOptinCheckboxContainer}>
            <InputCheckBox
              checked={whatsAppOptIn}
              onClick={() => setWhatsAppOptIn(!whatsAppOptIn)}
            />
            <Text style={styles.whatsAppPersonalisedText}>
              {string.registerationScreenData.personalisedWhatsAppTips}
            </Text>
          </View>
          <View style={{ width: '10%' }}>
            <WhatsAppIcon style={styles.whatsAppIcon} />
          </View>
        </View>
      </View>
    );
  };

  const registerUserForNewAndExisting = async () => {
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
      setGenderNotSelectError({
        error: true,
        errorMsg: 'Please select gender',
      });
    } else if (referral !== '') {
      trimReferral = trimReferral.trim();
    }
    if (validationMessage) {
      if (validationMessage != 'Please select gender') {
        Alert.alert('Error', validationMessage);
      }
    } else {
      setGenderNotSelectError({
        error: false,
        errorMsg: '',
      });
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
        ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
        : null;
      let patientDetails: any = {
        id: mePatient.id,
        // whatsAppOptIn: whatsAppOptIn,  It will use in future, but right now this is not working So I just commented it
        mobileNumber: mePatient.mobileNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        relation: relation == undefined ? Relation.ME : relation.key,
        gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'], //gender.toUpperCase(),
        uhid: '',
        dateOfBirth: formatDate,
        emailAddress: email.trim(),
        referralCode: trimReferral ? trimReferral : null,
        deviceCode: deviceToken,
      };
      let preApolloExistingUser = await AsyncStorage.getItem('preApolloUser');

      if (preApolloExistingUser && preApolloExistingUser === 'true') {
        try {
          let data = await client.mutate<addNewProfile, addNewProfileVariables>({
            mutation: ADD_NEW_PROFILE,
            variables: {
              PatientProfileInput: {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth: formatDate,
                gender:
                  gender === 'Female'
                    ? Gender['FEMALE']
                    : gender === 'Male'
                    ? Gender['MALE']
                    : Gender['OTHER'],
                relation: relation == undefined ? Relation.ME : relation.key,
                emailAddress: email.trim(),
                photoUrl: '',
                mobileNumber: mePatient.mobileNumber,
              },
            },
          });
          patientDetails = {
            id: data?.data?.addNewProfile?.patient?.id || '',
            relation: relation == undefined ? Relation.ME : relation.key, // profile ? profile.relation!.toUpperCase() : '',
            referralCode: trimReferral ? trimReferral : null,
            deviceCode: deviceToken,
          };
        } catch (e) {}
      }
      try {
        client
          .mutate<updatePatient, updatePatientVariables>({
            mutation: UPDATE_PATIENT,
            variables: {
              patientInput: patientDetails,
            },
          })
          .then((data: any) => {
            if (preApolloExistingUser && preApolloExistingUser === 'true') {
              setCurrentPatientId(patientDetails.id);
              AsyncStorage.removeItem('preApolloUser');
            }
            getPatientApiCall(),
              _postWebEngageEvent(),
              AsyncStorage.setItem('userLoggedIn', 'true'),
              AsyncStorage.setItem('signUp', 'false'),
              AsyncStorage.setItem('gotIt', patient ? 'true' : 'false'),
              createOneApolloUser(data?.updatePatient?.patient?.id!),
              postAppsFlyerEventAppInstallViaReferral(data);
          })
          .catch((error) => {
            signOut(),
              AsyncStorage.setItem('userLoggedIn', 'false'),
              AsyncStorage.setItem('multiSignUp', 'false'),
              AsyncStorage.setItem('signUp', 'false'),
              CommonLogEvent(AppRoutes.SignUp, 'Error going back to login'),
              console.log(error, 'EEOOEOE'),
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
              }, 0);
          });
      } catch (e) {}
    }
  };
  const renderStickySaveButton = () => {
    return (
      <StickyBottomComponent position={false}>
        <TouchableOpacity
          disabled={!firstName || !lastName || !date || !relation}
          style={[
            styles.stickySubmitButton,
            {
              backgroundColor:
                !firstName || !lastName || !date || !relation
                  ? theme.colors.BUTTON_ORANGE_DISABLE
                  : theme.colors.BUTTON_ORANGE,
            },
          ]}
          onPress={() => {
            registerUserForNewAndExisting();
          }}
        >
          <Text style={styles.stickySubmitButtonTitle}>SAVE</Text>
        </TouchableOpacity>
      </StickyBottomComponent>
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
          {renderStickyHeader()}
          <ScrollView
            style={styles.container} //extraScrollHeight={50}
            bounces={false}
          >
            {renderFormAllInputs()}
          </ScrollView>
          {renderStickySaveButton()}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {verifyingPhoneNumber ? <Spinner /> : null}
    </View>
  );
};
export default SignUp;

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
    borderBottomWidth: 1,
    paddingTop: 0,
    paddingBottom: 0,
    borderColor: theme.colors.LIGHT_BLUE,
  },
  placeholderTextStyle: {
    color: theme.colors.ASTRONAUT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  dateOfBirthTextLabel: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
    marginLeft: 10,
    fontWeight: '600',
    position: 'absolute',
    opacity: 0.7,
  },
  dateOfBirth: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 10,
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '600',
  },
  offserCrouselGradientContainer: {
    borderColor: theme.colors.LIGHT_GRAY_2,
    borderWidth: 1,
    borderRadius: 5,
  },
  offerCrouselMainContainer: {
    flexDirection: 'row',
  },
  offerCrouselPriceTagContainer: {
    flex: 0.15,
    alignItems: 'center',
  },
  priceTag: {
    width: 30,
    height: 40,
  },
  offerDescriptionContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    flex: 0.9,
  },
  offersFirstLine: {
    color: theme.colors.RED_BROWN,
    fontSize: 17,
    fontWeight: 'bold',
  },
  offersSecondLine: {
    color: theme.colors.RED_BROWN,
    fontSize: 12,
  },
  materialMenuContainer: { alignItems: 'flex-end', marginLeft: width / 2 - 95 },
  materialItemContainer: { height: 44.8, marginHorizontal: 12, width: width / 2 },
  materialItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.ASTRONAUT_BLUE),
    paddingHorizontal: 0,
  },
  materialSelcetedItemText: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_GREEN),
    alignSelf: 'flex-start',
  },
  relationInputLabel: {
    ...theme.fonts.IBMPlexSansMedium(18),
    marginBottom: 10,
    fontWeight: '600',
    paddingLeft: 11,
    color: theme.colors.LIGHT_BLUE,
    position: 'absolute',
    opacity: 0.7,
  },
  relationInput: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 10,
    fontSize: 14,
    marginLeft: 15,
    fontWeight: '600',
  },
  stickyHeaderMainContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  stickyHeaderTextContainer: {
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  stickyHeaderMainHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.LIGHT_BLUE,
  },
  stickyHeaderSubHeading: {
    fontSize: 11,
    color: theme.colors.LIGHT_BLUE,
    marginTop: 2,
    opacity: 0.7,
  },
  stickyHeaderOfferContain: {
    height: 100,
    paddingTop: 10,
    marginBottom: 15,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  datePickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.LIGHT_BLUE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  selectGenderContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  genderButtonContainer: {
    ...theme.fonts.IBMPlexSansMedium(18),
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  genderButtonText: {
    ...theme.fonts.IBMPlexSansMedium(18),
    fontSize: 12,
    fontWeight: '800',
  },
  genderErrorMsgText: {
    color: theme.colors.REMOVE_RED,
    fontSize: PixelRatio.getFontScale() * 11,
    marginTop: 5,
  },
  relationContainer: { marginTop: 10, marginBottom: 10 },
  stickySubmitButton: {
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickySubmitButtonTitle: {
    ...theme.fonts.IBMPlexSansBold(15),
    color: theme.colors.WHITE,
  },
  relationInputContainer: { flexDirection: 'row', paddingTop: 20 },
  relationDropdownCaret: { flex: 1, alignItems: 'flex-end' },
  whatsAppOptinContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -15,
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
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
  },
  offerCarouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  dropdownCaret: {
    width: 10,
    height: 5,
  },
  appLogo: {
    width: 44,
    height: 33,
  },
});
