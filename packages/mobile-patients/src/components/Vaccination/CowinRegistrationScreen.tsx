import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';

import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import DeviceInfo from 'react-native-device-info';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  DashedLine,
  DropdownGreen,
  OrderPlacedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '../ui/Spinner';
import { CountDownTimer } from '@aph/mobile-patients/src/components/ui/CountDownTimer';

import {
  dataSavedUserID,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  getAge,
  isValidPhoneNumber,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import RNFetchBlob from 'rn-fetch-blob';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  BackHandler,
  Text,
  Modal,
  Alert,
  PixelRatio,
} from 'react-native';
import {
  COWIN_GENDER,
  COWIN_GOVT_PHOTO_ID,
  Gender,
  OperationType,
  Relation,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import { Spinner } from '../ui/Spinner';
import { colors } from '../../theme/colors';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { buildVaccineApolloClient } from '../Vaccination/VaccinationApolloClient';
import {
  cowinRegistration,
  cowinRegistrationVariables,
} from '../../graphql/types/cowinRegistration';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

import { COWIN_REGISTRATION } from '@aph/mobile-patients/src/graphql/profiles';

const styles = StyleSheet.create({
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
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
  buttonViewStyle: {
    width: '30%',
    marginRight: 16,
    backgroundColor: 'white',
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  plainLine: {
    width: '110%',
    height: 1,
    marginTop: 20,
    marginHorizontal: -16,
    marginBottom: 5,
  },
  proceedButton: {
    width: 200,
    marginHorizontal: 40,
    marginTop: 24,
  },
  submitButton: {
    width: 250,
    marginHorizontal: 40,
    marginTop: 24,
    marginBottom: 10,
  },
  centeredView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  requestSubmissionTitle: {
    ...theme.viewStyles.text('M', 16, '#00B38E'),
    marginTop: 16,
    textAlign: 'center',
  },
  requestSubmisionMessage: {
    ...theme.viewStyles.text('R', 12, '#67919D'),
    marginTop: 9,
    textAlign: 'center',
  },
  orangeCTA: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.APP_YELLOW,
  },

  errorText: {
    ...theme.viewStyles.text('R', 10, '#f00'),
  },
});

type genderOptions = {
  name: Gender;
  title: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: Gender.MALE,
    title: 'Male',
  },
  {
    name: Gender.FEMALE,
    title: 'Female',
  },
  {
    name: Gender.OTHER,
    title: 'Others',
  },
];

export interface CowinRegistrationScreenProps extends NavigationScreenProps<{}> {}

export const CowinRegistrationScreen: React.FC<CowinRegistrationScreenProps> = (props) => {
  const [name, setName] = useState<string>('');
  const [birthYearText, setBirthYearText] = useState<string>('');
  const [birthYear, setBirthYear] = useState<number>(0);
  const [gender, setGender] = useState<Gender>();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedPhotoIdType, setSelectedPhotoIdType] = useState<any>();
  const [photoIDNumber, setPhotoIDNumber] = useState<string>();
  const [enteredOTPText, setEnteredOTPText] = useState<string>('');
  const [isOTPSent, setOTPSent] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [obtainedTxId, setObtainedTxnId] = useState<string>('');
  const [beneficiaryReferenceId, setBeneficiaryReferenceId] = useState<string>('');
  const [showOTPVerifiedAlert, setShowOTPVerifiedAlert] = useState<boolean>(false);
  const [showResentTimer, setShowResentTimer] = useState<boolean>(true);

  const [nameErrorText, setNameErrorText] = useState<string>('');
  const [birthYearErrorText, setBirthYearErrorText] = useState<string>('');
  const [phoneNumberErrorText, setPhoneNumberErrorText] = useState<string>('');
  const [photoIdNumberErrorText, setPhotoIdNumberErrorText] = useState<string>('');

  const pixelRatio = PixelRatio.get();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);

  useEffect(() => {
    setName(currentPatient?.firstName + ' ' + currentPatient?.lastName);
    let year = currentPatient?.dateOfBirth?.split('-')[0] || '0';
    setBirthYearText(year);
    if (year != undefined && year != '' && Number.parseInt(year) > 0) {
      setBirthYear(Number.parseInt(year));
    }
    setGender(currentPatient?.gender);
    setPhoneNumber(currentPatient?.mobileNumber);
  }, []);

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title="COWIN REGISTRATION"
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderGender = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        {GenderOptions.map((option) => {
          return (
            <Button
              key={option.name}
              title={option.title}
              style={[
                styles.buttonViewStyle,
                gender === option.name ? styles.selectedButtonViewStyle : null,
              ]}
              titleTextStyle={
                gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
              }
              onPress={() => {
                setGender(option.name);
              }}
            />
          );
        })}
      </View>
    );
  };

  const renderPhotoIdType = () => {
    return (
      <MaterialMenu
        options={[
          { key: COWIN_GOVT_PHOTO_ID.AADHAAR_CARD, value: 'Aadhaar Card' },
          { key: COWIN_GOVT_PHOTO_ID.DRIVING_LICENSE, value: 'Driving License' },
          { key: COWIN_GOVT_PHOTO_ID.PAN_CARD, value: 'PAN Card' },
          { key: COWIN_GOVT_PHOTO_ID.PASSPORT, value: 'Passport' },
          { key: COWIN_GOVT_PHOTO_ID.PENSION_PASSBOOK, value: 'Pension Passbook' },
          { key: COWIN_GOVT_PHOTO_ID.NPR_SMART_CARD, value: 'NPR Smart Card' },
          { key: COWIN_GOVT_PHOTO_ID.VOTER_ID, value: 'Voter ID' },
          { key: COWIN_GOVT_PHOTO_ID.UNIQUE_DISABILITY_ID, value: 'Unique Disability ID' },
        ]}
        selectedText={selectedPhotoIdType && selectedPhotoIdType.key.toString()}
        menuContainerStyle={{ width: '80%' }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(photoIdType) => {
          setSelectedPhotoIdType(photoIdType);
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                ,
                selectedPhotoIdType !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {selectedPhotoIdType !== undefined
                ? selectedPhotoIdType.value
                : 'Please choose photo ID Type ?'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderForm = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          padding: 16,
          marginTop: 18,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <Text style={[{ ...theme.viewStyles.text('M', 17, colors.SHERPA_BLUE) }]} numberOfLines={2}>
          Hi:)
        </Text>
        <Text
          style={{
            ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE),
            marginTop: 18,
          }}
        >
          Registration on CoWIN is mandatory, Apollo247 will help complete the registration for you
          or link an existing CoWIN registration with Apollo247. Please verify the following
          information:
        </Text>

        <DashedLine style={styles.plainLine} />
        <Text
          style={[{ ...theme.viewStyles.text('M', 17, '#0087BA'), marginTop: 5 }]}
          numberOfLines={2}
        >
          Your Details:
        </Text>

        <TextInputComponent
          label={'Full Name (As per Govt. ID)'}
          value={name}
          editable={true}
          onChangeText={(name) => {
            setName(name);

            if (name.length >= 3) {
              setNameErrorText('');
            } else {
              setNameErrorText('Please check your name. It must be according to Govt. ID ');
            }
          }}
          placeholder={'Enter your full name'}
        />

        {nameErrorText ? <Text style={styles.errorText}>{nameErrorText} </Text> : null}

        <TextInputComponent
          label={'Birth Year'}
          value={birthYearText}
          editable={true}
          textInputprops={{ maxLength: 4, keyboardType: 'numeric' }}
          onChangeText={(year) => {
            setBirthYearText(year);

            if (year != undefined && year != '' && Number.parseInt(year) > 0) {
              if (Number.parseInt(year) >= 1900 && Number.parseInt(year) <= moment().year()) {
                setBirthYear(Number.parseInt(year));
                setBirthYearErrorText('');
              } else {
                setBirthYearErrorText(
                  'Please check your year of birth. It must be according to Govt. ID'
                );
              }
            }
          }}
          placeholder={'Enter your year of birth'}
        />
        {birthYearErrorText ? <Text style={styles.errorText}>{birthYearErrorText} </Text> : null}

        <TextInputComponent label={'Gender'} noInput={true} />
        {renderGender()}

        <TextInputComponent
          label={'Phone number'}
          value={phoneNumber}
          editable={true}
          textInputprops={{ maxLength: 13, keyboardType: 'phone-pad' }}
          onChangeText={(phoneNumber) => {
            setPhoneNumber(phoneNumber);
            if (phoneNumber.startsWith('+91')) {
              phoneNumber = phoneNumber.replace('+91', '');
            }

            if (phoneNumber.length < 10 || !isValidPhoneNumber(phoneNumber)) {
              setPhoneNumberErrorText('Please check entered mobile phone number.');
            } else {
              setPhoneNumberErrorText('');
            }
          }}
          placeholder={'Enter your mobile phone number'}
        />

        {phoneNumberErrorText ? (
          <Text style={styles.errorText}>{phoneNumberErrorText} </Text>
        ) : null}

        <Text style={{ ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE), marginVertical: 14 }}>
          Your Photo Id will be verified at the time of your vaccination appointment. Please provide
          the details of the Photo Id you will carry for vaccination.
        </Text>

        <TextInputComponent label={'Photo Id Type'} noInput={true} />
        {renderPhotoIdType()}

        <TextInputComponent
          label={'Photo ID Number'}
          value={photoIDNumber}
          editable={true}
          onChangeText={(photoIDNumber) => {
            setPhotoIDNumber(photoIDNumber.toUpperCase());
            if (photoIDNumber.length > 3) {
              setPhotoIdNumberErrorText('');
            } else {
              setPhotoIdNumberErrorText(
                'Please check your photo ID number . It must be according to Govt. ID '
              );
            }
          }}
          placeholder={'Enter number as per selected document'}
        />

        {photoIdNumberErrorText ? (
          <Text style={styles.errorText}>{photoIdNumberErrorText} </Text>
        ) : null}
      </View>
    );
  };

  const disableVerifyButton = () => {
    if (name == undefined || name == '' || name.length <= 3) {
      return true;
    }

    if (
      birthYearText == undefined ||
      birthYearText == '' ||
      birthYear == 0 ||
      Number.parseInt(birthYearText) < 1900 ||
      Number.parseInt(birthYearText) > moment().year()
    ) {
      return true;
    }

    if (gender == undefined) {
      return true;
    }

    if (phoneNumber == undefined || phoneNumber == '') {
      return true;
    }

    if (phoneNumber.includes('+91')) {
      if (phoneNumber.length != 13) {
        return true;
      }
    } else {
      if (!isValidPhoneNumber(phoneNumber)) {
        return true;
      }
    }

    if (
      selectedPhotoIdType == undefined ||
      selectedPhotoIdType.value == undefined ||
      selectedPhotoIdType.value == ''
    ) {
      return true;
    }

    if (photoIDNumber == undefined || photoIDNumber == '') {
      return true;
    }
  };

  const disableSubmitOTPButton = () => {
    if (enteredOTPText == undefined || enteredOTPText == '' || enteredOTPText.length < 6) {
      return true;
    }
  };

  const onVerifyButtonPressed = () => {
    generateCowinRegistrationOTP();
  };

  const generateCowinRegistrationOTP = () => {
    setVerifyLoading(true);

    const cowinRegistrationDetails = {
      operationType: OperationType.GENERATE_OTP,
      mobileNumber: phoneNumber,
      name: name,
      gender_id:
        gender == Gender.MALE
          ? COWIN_GENDER.MALE
          : gender == Gender.FEMALE
          ? COWIN_GENDER.FEMALE
          : COWIN_GENDER.OTHERS,
      birth_year: birthYear.toString(),
      photo_id_type: selectedPhotoIdType.key || '',
      photo_id_number: photoIDNumber || '',
      uhid: currentPatient?.uhid,
      otp: '',
      txnId: '',
    };

    apolloVaccineClient
      .mutate<cowinRegistration, cowinRegistrationVariables>({
        mutation: COWIN_REGISTRATION,
        variables: { cowinRegistration: cowinRegistrationDetails },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response?.data?.cowinRegistration?.code == 200) {
          if (
            response?.data?.cowinRegistration?.response != undefined &&
            response?.data?.cowinRegistration?.response?.txnId != undefined &&
            response?.data?.cowinRegistration?.response?.txnId != ''
          ) {
            setObtainedTxnId(response?.data?.cowinRegistration?.response?.txnId);
            setOTPSent(true);
          } else {
            showAlertMessage('Alert! ', 'Unable to fetch transaction ID reach server');
          }
        } else {
          showAlertMessage(
            'Alert! ',
            'Something went wrong.' + response?.data?.cowinRegistration?.message
          );
        }
      })
      .catch((error) => {
        showAlertMessage(
          'Alert! ',
          'Unable to connect to server. Please check you internet connection.'
        );
      })
      .finally(() => {
        setVerifyLoading(false);
      });
  };

  const onSubmitOTPPressed = () => {
    verifyCowinRegistrationOTP();
  };

  const verifyCowinRegistrationOTP = () => {
    setVerifyLoading(true);

    const cowinVerificationDetails = {
      operationType: OperationType.VERIFY_OTP,
      mobileNumber: phoneNumber,
      name: name,
      gender_id:
        gender == Gender.MALE
          ? COWIN_GENDER.MALE
          : gender == Gender.FEMALE
          ? COWIN_GENDER.FEMALE
          : COWIN_GENDER.OTHERS,
      birth_year: birthYear.toString(),
      photo_id_type: selectedPhotoIdType.key || '',
      photo_id_number: photoIDNumber || '',
      uhid: currentPatient?.uhid,
      otp: enteredOTPText,
      txnId: obtainedTxId,
    };

    apolloVaccineClient
      .mutate<cowinRegistration, cowinRegistrationVariables>({
        mutation: COWIN_REGISTRATION,
        variables: { cowinRegistration: cowinVerificationDetails },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response?.data?.cowinRegistration?.code == 200) {
          setBeneficiaryReferenceId(
            response?.data?.cowinRegistration?.response?.beneficiary_reference_id || ''
          );
          //show success dialog
          setShowOTPVerifiedAlert(true);
        } else {
          showAlertMessage('Alert! ', response?.data?.cowinRegistration?.message || '');
        }
      })
      .catch((error) => {
        showAlertMessage(
          'Alert! ',
          'Unable to connect to server. Please check you internet connection.'
        );
      })
      .finally(() => {
        setVerifyLoading(false);
      });
  };

  const showAlertMessage = (title: string, message: string) => {
    showAphAlert &&
      showAphAlert({
        title: title,
        unDismissable: true,
        description: message,
        onPressOk: () => {
          hideAphAlert!();
        },
      });
  };

  const renderOTPVerfiedSuccessDialog = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOTPVerifiedAlert}
        onRequestClose={() => {
          setShowOTPVerifiedAlert(false);
        }}
        onDismiss={() => {
          setShowOTPVerifiedAlert(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, pixelRatio <= 2 ? { margin: 40 } : { margin: 60 }]}>
            <OrderPlacedIcon />
            <Text style={styles.requestSubmissionTitle}>Registration complete !</Text>
            <Text style={styles.requestSubmisionMessage}>
              You have been successfully registered on CoWIN
            </Text>
            <Text
              style={[
                styles.requestSubmisionMessage,
                { ...theme.viewStyles.text('M', 13, '#67919D') },
              ]}
            >
              REF ID : {beneficiaryReferenceId}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowOTPVerifiedAlert(false);
                props.navigation.goBack();
              }}
            >
              <Text style={[styles.orangeCTA, { marginTop: 10 }]}>OKAY!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderFooter = () => {
    return (
      <View
        style={{
          marginHorizontal: 20,
          marginVertical: 12,
          alignContent: 'center',
          alignItems: 'center',
          marginBottom: 37,
        }}
      >
        <Text style={{ ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE) }}>
          In case you have already registered on CoWIN, we will not be able to change your details.
        </Text>

        <Button
          title={string.vaccineBooking.verify_title}
          style={styles.proceedButton}
          onPress={() => {
            onVerifyButtonPressed();
          }}
          disabled={disableVerifyButton()}
        />

        <Text style={{ ...theme.viewStyles.text('R', 12, '#979797'), marginTop: 24 }}>
          Your ID card information is only being forwarded to CoWIN. Rest assured, Apollo247 will
          not be storing this sensitive information anywhere on its system.
        </Text>
      </View>
    );
  };

  const renderOtpCard = () => {
    return (
      <View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            padding: 16,
            marginTop: 18,
            marginHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE),
              marginTop: 18,
            }}
          >
            An OTP has been sent to XXX XXX 9999
          </Text>

          <TextInputComponent
            label={'OTP'}
            value={enteredOTPText}
            editable={true}
            textInputprops={{ maxLength: 6, keyboardType: 'numeric' }}
            onChangeText={(otp) => {
              setEnteredOTPText(otp);
            }}
            placeholder={'Enter the OTP'}
          />

          {
            <TouchableOpacity
              activeOpacity={1}
              onPress={
                showResentTimer
                  ? () => {}
                  : () => {
                      setOTPSent(false);
                      onVerifyButtonPressed();
                    }
              }
              style={{ width: '50%' }}
            >
              <Text
                style={[
                  {
                    ...theme.viewStyles.text(
                      'M',
                      12,
                      colors.SHERPA_BLUE,
                      showResentTimer ? 0.5 : 1
                    ),
                  },
                ]}
              >
                Resend OTP
                {showResentTimer && ' '}
                {showResentTimer && (
                  <CountDownTimer
                    timer={180}
                    style={{
                      color: theme.colors.LIGHT_BLUE,
                    }}
                    onStopTimer={() => {
                      setShowResentTimer(false);
                    }}
                  />
                )}
              </Text>
            </TouchableOpacity>
          }
        </View>
        <View style={{ marginHorizontal: 20, alignItems: 'center' }}>
          <Text
            style={{
              ...theme.viewStyles.text('R', 12, '#979797'),
              marginTop: 12,
              marginHorizontal: 10,
            }}
          >
            There might be some delay in receiving the OTP due to heavy traffic.
          </Text>
          <Button
            title={string.vaccineBooking.submit_title}
            style={styles.submitButton}
            onPress={() => {
              onSubmitOTPPressed();
            }}
            disabled={disableSubmitOTPButton()}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container]}>
        {renderHeader(props)}

        <KeyboardAvoidingView behavior={undefined} style={{ flex: 1 }}>
          <ScrollView style={{ backgroundColor: '#f7f8f5' }}>
            {isOTPSent ? (
              renderOtpCard()
            ) : (
              <>
                {renderForm()}
                {renderFooter()}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {verifyLoading ? <Spinner /> : null}
      {showOTPVerifiedAlert && renderOTPVerfiedSuccessDialog()}
    </View>
  );
};
