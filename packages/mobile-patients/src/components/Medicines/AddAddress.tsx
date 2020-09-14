/**
 * This component is being used for adding as well as updating addresses.
 * Being utilized by Address Book, Medicine Cart, Diagnostics Cart & Upload Prescription Order
 */
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, DropDownProps } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More, EditIconNewOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  DeviceHelper,
  CommonBugFender,
  CommonSetUserBugsnag,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DELETE_PATIENT_ADDRESS,
  SAVE_PATIENT_ADDRESS,
  UPDATE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  deletePatientAddress,
  deletePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientAddress';
import {
  PatientAddressInput,
  PATIENT_ADDRESS_TYPE,
  UpdatePatientAddressInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  savePatientAddress,
  savePatientAddressVariables,
  savePatientAddress_savePatientAddress_patientAddress,
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import {
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  g,
  handleGraphQlError,
  doRequestAndAccessLocationModified,
  formatAddress,
  getFormattedLocation,
  isValidPhoneNumber,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import { useFirstInstallTime } from 'react-native-device-info';

const { height, width } = Dimensions.get('window');
const setCharLen = width < 380 ? 25 : 30; //smaller devices like se, nexus 5
const key = AppConfig.Configuration.GOOGLE_API_KEY;
const { isIphoneX } = DeviceHelper();

const styles = StyleSheet.create({
  buttonViewStyle: {
    width: '30%',
    backgroundColor: 'white',
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  userDetailsOuterView: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
  },
  viewRowStyle: { flexDirection: 'row' },
  userSave: {
    flex: 0.2,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  userSaveText: {
    ...theme.viewStyles.yellowTextStyle,
    ...fonts.IBMPlexSansBold(15),
    textAlign: 'right',
  },
  addressHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  dropDownContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 1,
    width: '100%',
  },
  addressFieldsText: {
    marginTop: 5,
    marginBottom: 10,
  },
  pincodeView: {
    justifyContent: 'space-between',
    flex: 0.45,
    marginRight: '12%',
  },
  addressLabel: {
    color: '#02475b',
    ...fonts.IBMPlexSansMedium(14),
    opacity: 0.7,
  },
  textInputContainerStyle: {
    flex: 1,
    top: Platform.OS == 'ios' ? -6 : -11,
  },
  textInputName: {
    borderBottomWidth: 1,
    paddingBottom: 0,
    color: theme.colors.SHERPA_BLUE,
    opacity: Platform.OS == 'ios' ? 0.6 : 0.5,
    ...theme.fonts.IBMPlexSansMedium(14.75),
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  nameText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    flex: 0.95,
    marginBottom: Platform.OS == 'android' ? '9%' : '7%',
  },
});

export type AddressSource = 'My Account' | 'Upload Prescription' | 'Cart' | 'Diagnostics Cart';

export interface AddAddressProps
  extends NavigationScreenProps<{
    KeyName?: string;
    DataAddress?: getPatientAddressList_getPatientAddressList_addressList;
    addOnly?: boolean;
    source: AddressSource;
    ComingFrom?: string;
  }> {}

type addressOptions = {
  name: PATIENT_ADDRESS_TYPE;
};

const AddressOptions: addressOptions[] = [
  {
    name: PATIENT_ADDRESS_TYPE.HOME,
  },
  {
    name: PATIENT_ADDRESS_TYPE.OFFICE,
  },
  {
    name: PATIENT_ADDRESS_TYPE.OTHER,
  },
];
export const AddAddress: React.FC<AddAddressProps> = (props) => {
  const isEdit = props.navigation.getParam('KeyName') === 'Update';
  const source = props.navigation.getParam('source');
  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');
  const [userId, setuserId] = useState<string>('');
  const [phoneNumber, setphoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(true);
  const [addressLine1, setaddressLine1] = useState<string>('');
  const [areaDetails, setareaDetails] = useState<string>('');
  const [pincode, setpincode] = useState<string>('');
  const [city, setcity] = useState<string>('');
  const [landMark, setlandMark] = useState<string>('');
  const [state, setstate] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [stateCode, setStateCode] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [addressType, setAddressType] = useState<PATIENT_ADDRESS_TYPE>();
  const [optionalAddress, setOptionalAddress] = useState<string>('');
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isStateEdit, setStateEditable] = useState<boolean>(false);
  const [isCityEdit, setCityEditable] = useState<boolean>(false);
  const addOnly = props.navigation.state.params ? props.navigation.state.params.addOnly : false;

  const addressData = props.navigation.getParam('DataAddress');
  const {
    addAddress,
    setDeliveryAddressId,
    setNewAddressAdded,
    addresses,
    setAddresses,
  } = useShoppingCart();
  const {
    addAddress: addDiagnosticAddress,
    setDeliveryAddressId: setDiagnosticAddressId,
    setAddresses: setTestAddresses,
  } = useDiagnosticsCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { locationDetails, pharmacyLocation } = useAppCommonData();

  const isChanged =
    addressData &&
    city === addressData.city &&
    state === addressData.state &&
    pincode === addressData.zipcode &&
    addressLine1 === addressData.addressLine1 &&
    areaDetails === addressData.addressLine2 &&
    landMark === addressData.landmark &&
    addressType === addressData.addressType &&
    optionalAddress === addressData.otherAddressType;

  /** different on what case take it to map  */
  const areFieldsSame =
    isChanged && phoneNumber === addressData?.mobileNumber && userName === addressData?.name;

  const formatCityStateDisplay = (city: string, state: string) => [city, state].join(', ');

  useEffect(() => {
    if (props.navigation.getParam('KeyName') == 'Update' && addressData) {
      console.log('DataAddress', addressData);
      // to avoid duplicate state name & backward compatability of address issue
      const cityState = [addressData.city, addressData.state]
        .filter((item) => item)
        .toString()
        .split(',')
        .map((item) => (item || '').trim())
        .filter((v, i, a) => a.findIndex((t) => t === v) === i)
        .toString()
        .replace(',', ', ');
      // setcity(cityState); //when need to show [city,state] format
      setcity(addressData.city!);
      setstate(addressData.state!);
      setpincode(addressData.zipcode!);
      setaddressLine1(addressData.addressLine1!);
      setareaDetails(addressData.addressLine2!);
      setlandMark(addressData.landmark!);
      setAddressType(addressData.addressType!);
      setOptionalAddress(addressData.otherAddressType!);
      setLatitude(addressData.latitude!);
      setLongitude(addressData.longitude!);
      setStateCode(addressData.stateCode || '');
      setuserName(addressData.name!);
    } else {
      if (!(locationDetails && locationDetails.pincode)) {
        doRequestAndAccessLocationModified()
          .then((response) => {
            if (response) {
              setstate(response.state || '');
              // setcity(`${response.city}, ${response.state}` || ''); //[city,state] format
              setcity(response.city || '');
              setpincode(response.pincode || '');
              setLatitude(response.latitude || 0);
              setLongitude(response.longitude || 0);
              setStateCode(response.stateCode || '');
            }
          })
          .catch((e) => {
            CommonBugFender('AddAddress_doRequestAndAccessLocationModified', e);
          });
      } else {
        const _locationDetails =
          pharmacyLocation && source == 'Cart' ? pharmacyLocation : locationDetails;
        setstate(_locationDetails.state || '');
        // setcity(formatCityStateDisplay(_locationDetails.city, _locationDetails.state)); //[city,state] format
        setcity(_locationDetails.city || '');
        setpincode(_locationDetails.pincode || '');
        setLatitude(_locationDetails.latitude || 0);
        setLongitude(_locationDetails.longitude || 0);
        setStateCode(_locationDetails.stateCode || '');
      }
    }
  }, []);
  const client = useApolloClient();
  const isAddressValid =
    userName &&
    // userName.length > 1 &&
    phoneNumber &&
    phoneNumber.length == 10 &&
    addressLine1 &&
    areaDetails &&
    // addressLine1.length > 1 &&
    pincode &&
    pincode.length === 6 &&
    city &&
    city.length > 1 &&
    state &&
    state.length > 1 &&
    addressType !== undefined &&
    (addressType !== PATIENT_ADDRESS_TYPE.OTHER ||
      (addressType === PATIENT_ADDRESS_TYPE.OTHER && optionalAddress));

  const saveAddress = (addressInput: PatientAddressInput) =>
    client.mutate<savePatientAddress, savePatientAddressVariables>({
      mutation: SAVE_PATIENT_ADDRESS,
      variables: { PatientAddressInput: addressInput },
    });

  const onSavePress = async () => {
    CommonLogEvent(AppRoutes.AddAddress, 'On Save Press clicked');
    if (props.navigation.getParam('KeyName') == 'Update' && addressData) {
      setEditProfile(false);
      if (!isChanged) {
        const finalStateCode =
          AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING[
            state as keyof typeof AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING
          ] || stateCode;
        const updateaddressInput: UpdatePatientAddressInput = {
          id: addressData.id,
          addressLine1: addressLine1,
          addressLine2: areaDetails,
          city: city || '',
          state: state || '',
          zipcode: pincode,
          landmark: landMark,
          mobileNumber: phoneNumber,
          addressType: addressType,
          otherAddressType: optionalAddress,
          latitude: latitude,
          longitude: longitude,
          stateCode: finalStateCode,
          name: userName,
        };
        props.navigation.navigate(AppRoutes.Maps, {
          addressDetails: updateaddressInput,
          KeyName: props.navigation.getParam('KeyName'),
          isChanged: !isChanged,
          addOnly: addOnly,
          source: props.navigation.getParam('source'),
          ComingFrom: props.navigation.getParam('ComingFrom'),
        });
      } else if (!areFieldsSame) {
        saveEditDetails();
      } else {
        props.navigation.goBack();
      }
    } else {
      //from new address (add, pharmacy...,diagnostics)
      const finalStateCode =
        AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING[
          state as keyof typeof AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING
        ] || stateCode;
      const addressInput: Object = {
        id: userId,
        addressLine1: addressLine1,
        addressLine2: areaDetails,
        city: city || '',
        state: state || '',
        /** look for the area details, attribute & name and phone number  ~ mobileNumber*/
        zipcode: pincode,
        landmark: landMark || '',
        mobileNumber: phoneNumber, //with respect to address
        addressType: addressType,
        otherAddressType: optionalAddress,
        latitude: latitude, //from the pincode
        longitude: longitude, //from the pincode
        stateCode: finalStateCode,
        name: userName,
      };
      props.navigation.navigate(AppRoutes.Maps, {
        addressDetails: addressInput,
        KeyName: props.navigation.getParam('KeyName'),
        isChanged: !isChanged,
        addOnly: addOnly,
        source: props.navigation.getParam('source'),
      });
    }
  };

  useEffect(() => {
    if (currentPatient) {
      const _setUserName = addressData?.name! ? addressData?.name : currentPatient.firstName!;
      setuserName(_setUserName);
      setuserId(currentPatient.id);
      if (addressData?.mobileNumber) {
        setphoneNumber(addressData.mobileNumber);
      } else {
        setphoneNumber(currentPatient.mobileNumber.replace('+91', '') || '');
      }
    }
  }, [currentPatient]);

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={
          props.navigation.getParam('KeyName') == 'Update' ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'
        }
        onPressLeftIcon={() => props.navigation.goBack()}
        rightComponent={
          props.navigation.getParam('KeyName') == 'Update' ? (
            <TouchableOpacity
              onPress={() => {
                // console.log(addressData.id);
                // setdisplayoverlay(true);
                setDeleteProfile(true);
              }}
            >
              <More />
            </TouchableOpacity>
          ) : null
        }
      />
    );
  };

  const validateAndSetPincode = (pincode: string) => {
    if (pincode == '' || /^[1-9]{1}\d{0,9}$/.test(pincode)) {
      setpincode(pincode);
      pincode.length == 6 && updateCityStateByPincode(pincode);
    }
  };

  const updateCityStateByPincode = (pincode: string) => {
    const resetValues = (e: Error) => {
      setcity('');
      setstate('');
      setStateCode('');
      setLatitude(0);
      setLongitude(0);
      setStateEditable(true);
      setCityEditable(true);
      CommonBugFender('AddAddress_updateCityStateByPincode', e);
    };
    const pincodeAndAddress = [pincode, addressLine1].filter((v) => (v || '').trim()).join(',');
    getPlaceInfoByPincode(pincodeAndAddress)
      .then(({ data }) => {
        try {
          const addrComponents = data.results[0].address_components || [];
          const latLang = data.results[0].geometry.location || {};
          const response = getFormattedLocation(addrComponents, latLang);
          const city = response.city;
          const state = response.state;
          const finalStateCode =
            AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING[
              state as keyof typeof AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING
            ] || stateCode;

          // setcity(formatCityStateDisplay(city, state)); //[city,state] format
          setcity(city || '');
          setstate(state || '');
          setStateCode(finalStateCode);
          setLatitude(response.latitude!);
          setLongitude(response.longitude!);
          city === '' ? setCityEditable(true) : setCityEditable(false);
          state === '' ? setStateEditable(true) : setStateEditable(false);
        } catch (e) {
          resetValues(e);
        }
      })
      .catch(resetValues);
  };
  const renderAddressOption = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        {AddressOptions.map((option) => (
          <Button
            key={option.name}
            title={option.name}
            style={[
              styles.buttonViewStyle,
              addressType === option.name ? styles.selectedButtonViewStyle : null,
            ]}
            titleTextStyle={
              addressType === option.name
                ? styles.selectedButtonTitleStyle
                : styles.buttonTitleStyle
            }
            onPress={() => setAddressType(option.name)}
          />
        ))}
      </View>
    );
  };

  const _validateAndSetPhoneNumber = (value: string) => {
    if (/^\d+$/.test(value) || value == '') {
      setphoneNumber(value);
      setPhoneNumberIsValid(isValidPhoneNumber(value));
    }
  };

  const validateUserDetails = (comingFrom: string) => {
    let validationMessage = '';
    if (!userName || !/^[A-Za-z]/.test(userName)) {
      validationMessage = 'Enter Valid Name';
    } else if (!phoneNumberIsValid || phoneNumber.length !== 10) {
      validationMessage = 'Enter Valid Mobile Number';
    }
    if (validationMessage) {
      showAphAlert && showAphAlert({ title: 'Alert!', description: validationMessage });
    } else if (comingFrom == 'userdetails') {
      saveEditDetails(); //update the name & number
    } else {
      onSavePress(); //navigate to map as change in address + name & number
    }
  };

  const onUpdateDetails = () => {
    //will save the details in db, only we are coming from edit + all fields are filled
    if (props.navigation.getParam('KeyName') == 'Update' && addressData) {
      setshowSpinner(true);
      CommonLogEvent(AppRoutes.AddAddress, 'On Save Edit clicked');
      if (!areFieldsSame) {
        const finalStateCode =
          AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING[
            state as keyof typeof AppConfig.Configuration.PHARMA_STATE_CODE_MAPPING
          ] || stateCode;
        const updateaddressInputForEdit: UpdatePatientAddressInput = {
          id: addressData.id,
          addressLine1: addressLine1,
          addressLine2: areaDetails,
          city: city || '',
          state: state || '',
          zipcode: pincode,
          landmark: landMark,
          mobileNumber: phoneNumber,
          addressType: addressType,
          otherAddressType: optionalAddress,
          latitude: latitude,
          longitude: longitude,
          stateCode: finalStateCode,
          name: userName,
        };
        console.log(updateaddressInputForEdit, 'updateaddressInputForEdit');
        setshowSpinner(true);
        client
          .mutate<updatePatientAddress, updatePatientAddressVariables>({
            mutation: UPDATE_PATIENT_ADDRESS,
            variables: { UpdatePatientAddressInput: updateaddressInputForEdit },
          })
          .then((_data: any) => {
            try {
              setshowSpinner(false);
              console.log('updateapicalled', _data);
              _navigateToScreen(_data.data.updatePatientAddress.patientAddress, 'fromUpdate');
            } catch (error) {
              CommonBugFender('AddAddress_onSavePress_try', error);
            }
          })
          .catch((e) => {
            CommonBugFender('AddAddress_onSavePress', e);
            setshowSpinner(false);
            handleGraphQlError(e);
          });
        //props.navigation.goBack();
      } else {
        props.navigation.goBack();
      }
    }
  };

  const setUpdatedAddressList = async (
    updatedAddress: savePatientAddress_savePatientAddress_patientAddress,
    keyName: string
  ) => {
    let newAddrList = [];
    if (keyName == 'fromDelete') {
      newAddrList = addresses.filter((item) => item.id != updatedAddress.id);
    } else {
      newAddrList = [
        { ...updatedAddress },
        ...addresses.filter((item) => item.id != updatedAddress.id),
      ];
    }

    setAddresses!(newAddrList);
    setTestAddresses!(newAddrList);
  };

  const _navigateToScreen = (
    addressList: savePatientAddress_savePatientAddress_patientAddress,
    keyName: string
  ) => {
    const screenName = props.navigation.getParam('ComingFrom')!;
    if (screenName != '') {
      setUpdatedAddressList(addressList, keyName);
      props.navigation.pop(1, { immediate: true });
    } else {
      props.navigation.pop(2, { immediate: true });
      props.navigation.push(AppRoutes.AddressBook);
    }
  };

  /** this will save the details */
  const saveEditDetails = () => {
    //if coming from the add section no details would be there
    const noLatLong = latitude == 0 || longitude == 0 ? true : false;
    if (isEdit) {
      //now if mandate fields are empty or not + lat-long
      isAddressValid ? onUpdateDetails() : setEditProfile(false);
    } else {
      //save it locally
      setEditProfile(false);
    }
  };

  const _onFocus = () => {
    setIsFocus(true);
  };

  const _onBlur = () => {
    setIsFocus(false);
  };

  /**view added for the patient's details */
  const renderUserDetails = () => {
    let beforeFocus =
      Platform.OS == 'android' && userName.length > 32
        ? userName.slice(0, setCharLen).concat('...')
        : userName;
    return (
      <View style={styles.userDetailsOuterView}>
        <View style={styles.viewRowStyle}>
          <View style={{ flex: editProfile ? 0.9 : 1, height: 60 }}>
            <View style={styles.viewRowStyle}>
              <Text
                style={{
                  color: editProfile ? theme.colors.LIGHT_BLUE : '#02475b',
                  opacity: editProfile ? 0.6 : 1,
                  ...fonts.IBMPlexSansMedium(14),
                }}
              >
                Name :{' '}
              </Text>
              {!editProfile ? (
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nameText}>
                  {userName}
                </Text>
              ) : (
                <TextInputComponent
                  conatinerstyles={styles.textInputContainerStyle}
                  onChangeText={(userName) =>
                    userName.startsWith(' ') ? null : setuserName(userName)
                  }
                  onFocus={() => _onFocus()}
                  onBlur={() => _onBlur()}
                  value={isFocus ? userName : beforeFocus}
                  editable={editProfile}
                  placeholder={'Full Name'}
                  inputStyle={styles.textInputName}
                />
              )}
            </View>

            <View style={{ flexDirection: 'row', top: Platform.OS == 'ios' ? -8 : -15 }}>
              <Text
                style={{
                  color: editProfile ? theme.colors.LIGHT_BLUE : '#02475b',
                  opacity: editProfile ? 0.6 : 1,
                  ...fonts.IBMPlexSansMedium(14),
                }}
              >
                Phone number :{' '}
              </Text>
              <TextInputComponent
                conatinerstyles={styles.textInputContainerStyle}
                maxLength={10}
                keyboardType="numeric"
                onChangeText={(phoneNumber) => {
                  _validateAndSetPhoneNumber(phoneNumber);
                }}
                value={phoneNumber}
                editable={editProfile}
                placeholder={'Mobile Number'}
                inputStyle={{
                  borderBottomWidth: editProfile ? 1 : 2,
                  paddingBottom: editProfile ? 0 : 3,
                  color: theme.colors.SHERPA_BLUE,
                  opacity: editProfile ? (Platform.OS == 'ios' ? 0.6 : 0.5) : 1,
                  ...theme.fonts.IBMPlexSansMedium(14.75),
                  borderColor: editProfile ? theme.colors.INPUT_BORDER_SUCCESS : 'transparent',
                }}
              />
            </View>
          </View>
          {!editProfile ? (
            <TouchableOpacity
              onPress={() => {
                setEditProfile(true);
              }}
            >
              <EditIconNewOrange />
            </TouchableOpacity>
          ) : (
            <View style={styles.userSave}>
              <TouchableOpacity
                style={{ width: '100%' }}
                onPress={() => {
                  validateUserDetails('userdetails');
                }}
              >
                <Text style={styles.userSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAddressText = () => {
    return (
      <View style={{ marginLeft: 16 }}>
        <Text style={styles.addressHeadingText}>ADDRESS DETAILS</Text>
      </View>
    );
  };

  const renderAddress = () => {
    return (
      <View style={styles.userDetailsOuterView}>
        {/* <TouchableOpacity
          activeOpacity={1}
          // onPress={() => {
          //   setShowPopup(true);
          // }}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.placeholderViewStyle}>
            <Text style={[styles.placeholderTextStyle]}>{userName}</Text>
            <DropdownGreen size="sm" />
          </View>
        </TouchableOpacity> */}
        {showPopup && (
          <DropDown
            cardContainer={styles.dropDownContainer}
            options={(allCurrentPatients || []).map(
              (item) =>
                ({
                  optionText: item.firstName,
                  onPress: () => {
                    CommonLogEvent(AppRoutes.AddAddress, 'Drop Down clicked');
                    setuserName(item.firstName!);
                    setuserId(item.id);
                    setShowPopup(false);
                  },
                } as DropDownProps['options'][0])
            )}
          />
        )}
        {/* <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14) }}>Full Name</Text>
        <TextInputComponent
          value={userName}
          onChangeText={(text) =>
            text.startsWith(' ') || text.startsWith('.')
              ? null
              : (text == '' || /^([a-zA-Z.\s])+$/.test(text)) && setuserName(text)
          }
          placeholder={'Enter full name'}
          inputStyle={{ marginBottom: 10 }}
        />
        <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14) }}>Mobile Number</Text>
        <View
          style={[
            { paddingTop: Platform.OS === 'ios' ? 8 : 8 },
            phoneNumber == '' ? styles.inputValidView : styles.inputView,
          ]}
        >
          <Text style={styles.inputTextStyle}>+91</Text>
          <TextInput
            autoFocus
            style={styles.inputStyle}
            keyboardType="numeric"
            maxLength={10}
            value={phoneNumber}
            placeholder={'Enter mobile number'}
            onChangeText={(phoneNumber) =>
              (phoneNumber == '' || /^[6-9]{1}\d{0,9}$/.test(phoneNumber)) &&
              setphoneNumber(phoneNumber)
            }
          />
        </View> */}
        {/* <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(18),
              color: theme.colors.INPUT_TEXT,
              paddingRight: 6,
              lineHeight: 28,
              paddingTop: Platform.OS === 'ios' ? 0 : 6,
              paddingBottom: Platform.OS === 'ios' ? 5 : 0,
            }}
          >
            +91
          </Text>
          <TextInputComponent
            value={phoneNumber}
            onChangeText={(phoneNumber) =>
              (phoneNumber == '' || /^[6-9]{1}\d{0,9}$/.test(phoneNumber)) &&
              setphoneNumber(phoneNumber)
            }
            placeholder={'Phone Number'}
            maxLength={10}
          />
        </View> */}
        {/**
         * 1. code commented for APP-3922 from here
         */}
        {/* <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14), marginTop: 20 }}>
          Address
        </Text> */}
        {/** 1. House # */}
        <Text style={styles.addressLabel}>*House Number & Apartment/Society</Text>
        <TextInputComponent
          value={addressLine1}
          onChangeText={(addressLine1) => {
            if (addressLine1 == '') {
              setaddressLine1(addressLine1);
            }
            // if (
            //   addressLine1.startsWith(' ') ||
            //   addressLine1.startsWith('.') ||
            //   addressLine1.startsWith(',') ||
            //   addressLine1.startsWith('/') ||
            //   addressLine1.startsWith('-')
            // ) {
            //   return;
            // }!/^[A-Za-z0-9]/

            if (!/^[A-Za-z0-9]/.test(addressLine1)) {
              return;
            }
            if (/^([a-zA-Z0-9/,.-\s])+$/.test(addressLine1)) {
              setaddressLine1(addressLine1);
            }
          }}
          placeholder={'Enter House & Society Details'}
          inputStyle={styles.addressFieldsText}
        />
        <Text style={styles.addressLabel}>*Area Details</Text>
        <TextInputComponent
          value={areaDetails}
          onChangeText={(areaDetails) => {
            if (areaDetails == '') {
              setareaDetails(areaDetails);
            }
            // if (
            //   areaDetails.startsWith(' ') ||
            //   areaDetails.startsWith('.') ||
            //   areaDetails.startsWith(',') ||
            //   areaDetails.startsWith('/') ||
            //   areaDetails.startsWith('-')
            // ) {
            //   return;
            // }
            if (!/^[A-Za-z0-9]/.test(addressLine1)) {
              return;
            }
            if (/^([a-zA-Z0-9/,.-\s])+$/.test(areaDetails)) {
              setareaDetails(areaDetails);
            }
          }}
          placeholder={'Enter Area Details'}
          inputStyle={styles.addressHeadingText}
        />
        <Text style={[styles.addressLabel, { marginTop: '3%' }]}>LandMark</Text>
        <TextInputComponent
          value={landMark}
          onChangeText={(landMark) => (landMark.startsWith(' ') ? null : setlandMark(landMark))}
          placeholder={'Enter LandMark'}
          inputStyle={styles.addressHeadingText}
        />
        <View style={[styles.viewRowStyle, { marginTop: 12 }]}>
          <View style={styles.pincodeView}>
            <Text style={styles.addressLabel}>*Pincode</Text>

            <TextInputComponent
              value={pincode}
              onChangeText={
                (pincode) => validateAndSetPincode(pincode)
                // (pincode == '' || /^[1-9]{1}\d{0,9}$/.test(pincode)) && setpincode(pincode)
              }
              placeholder={'Enter pin code'}
              maxLength={6}
              // textInputprops={{
              //   onSubmitEditing: () => {
              //     if (isAddressValid) {
              //       onSavePress();
              //     }
              //   },
              //   returnKeyType: 'done',
              // }}
            />
          </View>
          <View style={{ flex: 0.55 }}>
            <Text style={styles.addressLabel}>*City</Text>
            <TextInputComponent
              value={city}
              textInputprops={{ editable: isCityEdit }}
              onChangeText={(city) =>
                city.startsWith(' ') || city.startsWith('.') || city.startsWith(',')
                  ? null
                  : (city == '' || /^([a-zA-Z0-9.,\s])+$/.test(city)) && setcity(city)
              }
              maxLength={100}
              placeholder={'City'}
              multiline={false}
            />
          </View>
        </View>
        {/* state*/}
        <Text style={[styles.addressLabel, { marginTop: 12 }]}>*State</Text>
        <TextInputComponent
          value={(state || '').startsWith(',') ? state.replace(', ', '') : state}
          textInputprops={{ editable: isStateEdit }}
          onChangeText={(state) =>
            state.startsWith(' ') || state.startsWith('.')
              ? null
              : (state == '' || /^([a-zA-Z0-9.\s])+$/.test(state)) && setstate(state)
          }
          maxLength={100}
          placeholder={'State'}
          multiline={false}
        />
        <Text style={[styles.addressLabel, { marginTop: 12, marginBottom: 8 }]}>
          Choose nick name for the address
        </Text>
        {renderAddressOption()}
        {addressType === PATIENT_ADDRESS_TYPE.OTHER && (
          <TextInputComponent
            value={optionalAddress}
            onChangeText={(optionalAddress) =>
              optionalAddress.startsWith(' ') || city.startsWith('.')
                ? null
                : (optionalAddress == '' || /^([a-zA-Z0-9.\s])+$/.test(optionalAddress)) &&
                  setOptionalAddress(optionalAddress)
            }
            placeholder={'Enter address type'}
            multiline={false}
          />
        )}
        {/* <TextInputComponent
          value={state}
          onChangeText={(state) =>
            state.startsWith(' ') || state.startsWith('.')
              ? null
              : (state == '' || /^([a-zA-Z0-9.\s])+$/.test(state)) && setstate(state)
          }
          placeholder={'State'}
          textInputprops={{
            onSubmitEditing: () => {
              if (isAddressValid) {
                onSavePress();
              }
            },
            returnKeyType: 'done',
          }}
        /> */}
      </View>
    );
  };
  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};
  const renderDeleteButton = () => {
    return (
      <View
        style={{
          position: 'absolute',
          height: height,
          width: width,
          flex: 1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setDeleteProfile(false);
          }}
        >
          <View
            style={{
              margin: 0,
              height: height,
              width: width,
              backgroundColor: 'transparent',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                //deleteUserProfile();
                setshowSpinner(true);
                setDeleteProfile(false);
                client
                  .mutate<deletePatientAddress, deletePatientAddressVariables>({
                    mutation: DELETE_PATIENT_ADDRESS,
                    variables: { id: addressData?.id },
                    fetchPolicy: 'no-cache',
                  })
                  .then((_data: any) => {
                    console.log(('dat', _data));
                    setDeliveryAddressId!('');
                    setNewAddressAdded!('');
                    setDiagnosticAddressId!('');
                    _navigateToScreen(addressData!, 'fromDelete');
                  })
                  .catch((e) => {
                    CommonBugFender('AddAddress_DELETE_PATIENT_ADDRESS', e);
                    console.log('Error occured while render Delete MedicalOrder', { e });
                    handleGraphQlError(e);
                  })
                  .finally(() => setshowSpinner(false));
              }}
              style={{
                width: 145,
                height: 45,
                marginLeft: width - 165,
                ...Platform.select({
                  ios: {
                    marginTop: isIphoneX() ? height * 0.1 : height * 0.08,
                  },
                  android: {
                    marginTop: height * 0.05,
                  },
                }),
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: 145,
                  height: 45,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...theme.viewStyles.shadowStyle,
                }}
              >
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 16, '#02475b'),
                    backgroundColor: 'white',
                    textAlign: 'center',
                  }}
                >
                  Delete Address
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          {...keyboardVerticalOffset}
        >
          <ScrollView bounces={false}>
            {renderUserDetails()}
            {renderAddressText()}
            {renderAddress()}
            <View style={{ height: Platform.OS == 'ios' ? 60 : 0 }} />
          </ScrollView>
          <View
            style={{
              width: '100%',
              paddingTop: 10,
              height: height === 812 || height === 896 ? 80 : 70,
              alignItems: 'center',
            }}
          >
            <Button
              title={
                props.navigation.getParam('KeyName') == 'Update' || addOnly
                  ? 'SAVE ADDRESS'
                  : 'SAVE & USE'
              }
              style={{ marginHorizontal: 40, width: '70%' }}
              onPress={() => validateUserDetails('save address')}
              disabled={!isAddressValid}
            ></Button>
          </View>
          {/* </StickyBottomComponent> */}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {deleteProfile && isEdit && renderDeleteButton()}
    </View>
  );
};
