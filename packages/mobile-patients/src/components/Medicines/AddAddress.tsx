import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, DropDownProps } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  SAVE_PATIENT_ADDRESS,
  UPDATE_PATIENT_ADDRESS,
  DELETE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  PatientAddressInput,
  PATIENT_ADDRESS_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  savePatientAddress,
  savePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  g,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  CommonLogEvent,
  DeviceHelper,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Remove, RemoveIcon, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  deletePatientAddress,
  deletePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientAddress';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
const { height, width } = Dimensions.get('window');
const key = AppConfig.Configuration.GOOGLE_API_KEY;
const { isIphoneX } = DeviceHelper();

const styles = StyleSheet.create({
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
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingTop: Platform.OS === 'ios' ? 0 : 6,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
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
});

export interface AddAddressProps extends NavigationScreenProps {
  KeyName?: any;
  DataAddress?: any;
}

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
  console.log('KeyName', props.navigation.getParam('KeyName'));
  const isEdit = props.navigation.getParam('KeyName') === 'Update';
  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');
  const [userId, setuserId] = useState<string>('');
  const [phoneNumber, setphoneNumber] = useState<string>('');
  const [addressLine1, setaddressLine1] = useState<string>('');
  const [pincode, setpincode] = useState<string>('');
  const [city, setcity] = useState<string>('');
  const [landMark, setlandMark] = useState<string>('');
  const [state, setstate] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [addressType, setAddressType] = useState<PATIENT_ADDRESS_TYPE>();
  const [optionalAddress, setOptionalAddress] = useState<string>('');
  const addOnly: boolean = props.navigation.state.params
    ? props.navigation.state.params.addOnly
    : false;
  const addressData = props.navigation.getParam('DataAddress');

  const { addAddress, setDeliveryAddressId } = useShoppingCart();
  const { addAddress: addA, setDeliveryAddressId: setD } = useDiagnosticsCart();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const isChanged =
    addressData &&
    city === addressData.city &&
    state === addressData.state &&
    pincode === addressData.zipcode &&
    addressLine1 === addressData.addressLine1 &&
    addressType === addressData.addressType &&
    optionalAddress === addressData.otherAddressType;

  useEffect(() => {
    if (props.navigation.getParam('KeyName') == 'Update') {
      console.log('DataAddress', addressData);
      setcity(addressData.city);
      setstate(addressData.state);
      setpincode(addressData.zipcode);
      setaddressLine1(addressData.addressLine1);
      setAddressType(addressData.addressType);
      setOptionalAddress(addressData.otherAddressType);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position, 'position');
          const searchstring = position.coords.latitude + ',' + position.coords.longitude;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${key}`;
          //   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
          Axios.get(url)
            .then((obj) => {
              console.log(obj, 'geocode obj');
              try {
                if (
                  obj.data.results.length > 0 &&
                  obj.data.results[0].address_components.length > 0
                ) {
                  const address = obj.data.results[0].address_components[0].short_name;
                  console.log(address, 'address obj');
                  const addrComponents = obj.data.results[0].address_components || [];
                  const city = (
                    addrComponents.find(
                      (item: any) =>
                        item.types.indexOf('locality') > -1 ||
                        item.types.indexOf('administrative_area_level_2') > -1
                    ) || {}
                  ).long_name;
                  const state = (
                    addrComponents.find(
                      (item: any) => item.types.indexOf('administrative_area_level_1') > -1
                    ) || {}
                  ).long_name;
                  setstate(state || '');
                  const pincode = (
                    addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) || {}
                  ).long_name;

                  setpincode(pincode || '');

                  let val = city.concat(', ').concat(state);

                  setpincode(pincode || '');
                  //setcity(obj.data.results[0].formatted_address || '');
                  setcity(val);
                  console.log(obj.data.results[0].formatted_address, 'val obj');
                  //setcurrentLocation(address.toUpperCase());
                  // AsyncStorage.setItem(
                  //   'location',
                  //   JSON.stringify({
                  //     latlong: obj.data.results[0].geometry.location,
                  //     name: address.toUpperCase(),
                  //   })
                  // );
                }
              } catch {}
            })
            .catch((error) => {
              console.log(error, 'geocode error');
            });
        },
        (error) => {
          console.log(error.code, error.message, 'getCurrentPosition error');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }
  }, []);
  const client = useApolloClient();
  const isAddressValid =
    userName &&
    // userName.length > 1 &&
    phoneNumber &&
    phoneNumber.length == 10 &&
    addressLine1 &&
    // addressLine1.length > 1 &&
    pincode &&
    pincode.length == 6 &&
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
    setshowSpinner(true);
    CommonLogEvent(AppRoutes.AddAddress, 'On Save Press clicked');
    if (props.navigation.getParam('KeyName') == 'Update') {
      if (!isChanged) {
        const updateaddressInput = {
          id: addressData.id,
          addressLine1: addressLine1,
          addressLine2: '',
          city: city,
          state: state,
          zipcode: pincode,
          landmark: landMark,
          mobileNumber: phoneNumber,
          addressType: addressType,
          otherAddressType: optionalAddress,
        };
        console.log(updateaddressInput, 'updateaddressInput');
        setshowSpinner(true);
        client
          .mutate<updatePatientAddress, updatePatientAddressVariables>({
            mutation: UPDATE_PATIENT_ADDRESS,
            variables: { UpdatePatientAddressInput: updateaddressInput },
          })
          .then((_data: any) => {
            try {
              setshowSpinner(false);
              console.log('updateapicalled', _data);
              props.navigation.pop(2, { immediate: true });
              props.navigation.push(AppRoutes.AddressBook);
            } catch (error) {}
          })
          .catch((e: any) => {
            setshowSpinner(false);
            const error = JSON.parse(JSON.stringify(e));
            console.log('Error occured while updateapicalled', error);
          });
        //props.navigation.goBack();
      } else {
        props.navigation.goBack();
      }
    } else {
      const addressInput = {
        patientId: userId,
        addressLine1: addressLine1,
        addressLine2: '',
        city: city,
        state: state,
        zipcode: pincode,
        landmark: landMark,
        mobileNumber: phoneNumber,
        addressType: addressType,
        otherAddressType: optionalAddress,
      };
      console.log(addressInput, 'addressInput');
      try {
        const [saveAddressResult, pinAvailabilityResult] = await Promise.all([
          saveAddress(addressInput),
          addOnly ? null : pinCodeServiceabilityApi(pincode),
        ]);

        setshowSpinner(false);
        // const address = saveAddressResult.data!.savePatientAddress.patientAddress!;
        const address = g(saveAddressResult.data, 'savePatientAddress', 'patientAddress')!;
        addAddress && addAddress(address);
        addA!(address);

        if ((pinAvailabilityResult && pinAvailabilityResult.data.Availability) || addOnly) {
          setDeliveryAddressId && setDeliveryAddressId(address.id || '');
          setD!(address.id || '');
          props.navigation.goBack();
        } else {
          setDeliveryAddressId && setDeliveryAddressId('');
          setD!(address.id || '');

          showAphAlert!({
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.',
            onPressOk: () => {
              props.navigation.goBack();
              hideAphAlert!();
            },
          });
        }
      } catch (error) {
        setshowSpinner(false);
        handleGraphQlError(error);
      }
    }
  };

  useEffect(() => {
    if (currentPatient) {
      setuserName(currentPatient.firstName!);
      setuserId(currentPatient.id);
      setphoneNumber(currentPatient.mobileNumber.replace('+91', '') || '');
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
                console.log(addressData.id, !displayoverlay);
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
    aphConsole.log('updateCityStateByPincode');
    getPlaceInfoByPincode(pincode)
      .then(({ data }: any) => {
        try {
          aphConsole.log({ data });

          const results = g(data, 'results') || [];
          console.log(results, 'results');
          if (results.length == 0) return;
          console.log(results[0].geometry.location.lat);
          console.log(results[0].geometry.location.lng);
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${results[0].geometry.location.lat},${results[0].geometry.location.lng}&key=${key}`;
          //   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchstring}&sensor=true&key=${key}`;
          Axios.get(url)
            .then((obj) => {
              console.log(obj, 'geocode obj');
              try {
                if (
                  obj.data.results.length > 0 &&
                  obj.data.results[0].address_components.length > 0
                ) {
                  const address = obj.data.results[0].address_components[0].short_name;
                  console.log(address, 'address obj');
                  const addrComponents = obj.data.results[0].address_components || [];
                  const city = (
                    addrComponents.find(
                      (item: any) =>
                        item.types.indexOf('locality') > -1 ||
                        item.types.indexOf('administrative_area_level_2') > -1
                    ) || {}
                  ).long_name;
                  const state = (
                    addrComponents.find(
                      (item: any) => item.types.indexOf('administrative_area_level_1') > -1
                    ) || {}
                  ).long_name;
                  let val = city.concat(', ').concat(state);
                  // setcity(obj.data.results[0].formatted_address || '');
                  setcity(val);
                  setstate(state || '');
                  console.log(obj.data.results[0].formatted_address, 'val obj');
                  //setcurrentLocation(address.toUpperCase());
                  // AsyncStorage.setItem(
                  //   'location',
                  //   JSON.stringify({
                  //     latlong: obj.data.results[0].geometry.location,
                  //     name: address.toUpperCase(),
                  //   })
                  // );
                }
              } catch {}
            })
            .catch((error) => {
              console.log(error, 'geocode error');
            });
          //if (results.length == 0) return;
          // const addrComponents = results[0].address_components || [];
          // const city = (
          //   addrComponents.find(
          //     (item) =>
          //       item.types.indexOf('locality') > -1 ||
          //       item.types.indexOf('administrative_area_level_2') > -1
          //   ) || {}
          // ).long_name;
          // const state = (
          //   addrComponents.find((item) => item.types.indexOf('administrative_area_level_1') > -1) ||
          //   {}
          // ).long_name;
          // let val = city.concat(', ').concat(state);
          // setcity(val || '');
          // setstate(state || '');
        } catch (error) {}
      })
      .catch((e) => {
        aphConsole.error({ e });
      });
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
  const renderAddress = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          margin: 20,
          padding: 16,
        }}
      >
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
            cardContainer={{ position: 'absolute', top: 10, zIndex: 1, width: '100%' }}
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
        <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14), marginTop: 20 }}>
          Address
        </Text>
        <TextInputComponent
          value={addressLine1}
          onChangeText={(addressLine1) => {
            if (addressLine1 == '') {
              setaddressLine1(addressLine1);
            }
            if (
              addressLine1.startsWith(' ') ||
              addressLine1.startsWith('.') ||
              addressLine1.startsWith(',') ||
              addressLine1.startsWith('-')
            ) {
              return;
            }
            if (/^([a-zA-Z0-9,.-\s])+$/.test(addressLine1)) {
              setaddressLine1(addressLine1);
            }
          }}
          placeholder={'Flat / Door / Plot Number, Building'}
          inputStyle={{ marginTop: 5, marginBottom: 10 }}
        />
        <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14) }}>Pin Code</Text>
        <TextInputComponent
          value={pincode}
          onChangeText={
            (pincode) => validateAndSetPincode(pincode)
            // (pincode == '' || /^[1-9]{1}\d{0,9}$/.test(pincode)) && setpincode(pincode)
          }
          placeholder={'Enter pin code'}
          maxLength={6}
          textInputprops={{
            onSubmitEditing: () => {
              if (isAddressValid) {
                onSavePress();
              }
            },
            returnKeyType: 'done',
          }}
        />
        {/* <TextInputComponent
          value={landMark}
          onChangeText={(landMark) => (landMark.startsWith(' ') ? null : setlandMark(landMark))}
          placeholder={'Land Mark (optional)'}
        /> */}
        <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14) }}>Area / Locality</Text>
        <TextInputComponent
          value={city}
          onChangeText={(city) =>
            city.startsWith(' ') || city.startsWith('.')
              ? null
              : (city == '' || /^([a-zA-Z0-9.\s])+$/.test(city)) && setcity(city)
          }
          placeholder={'Enter area / locality name'}
          multiline={true}
        />
        <Text style={{ color: '#02475b', ...fonts.IBMPlexSansMedium(14), marginBottom: 8 }}>
          Address Type{' '}
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
            multiline={true}
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
                setDeleteProfile(false);
                client
                  .mutate<deletePatientAddress, deletePatientAddressVariables>({
                    mutation: DELETE_PATIENT_ADDRESS,
                    variables: { id: addressData.id },
                    fetchPolicy: 'no-cache',
                  })
                  .then((_data: any) => {
                    console.log(('dat', _data));
                    props.navigation.push(AppRoutes.AddressBook);
                  })
                  .catch((e) => {
                    const error = JSON.parse(JSON.stringify(e));
                    const errorMessage = error && error.message;
                    console.log(
                      'Error occured while render Delete MedicalOrder',
                      errorMessage,
                      error
                    );
                    Alert.alert('Error', errorMessage);
                  });
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: 145,
                  height: 45,
                  marginLeft: width - 165,
                  ...Platform.select({
                    ios: {
                      marginTop: isIphoneX ? height * 0.1 : height * 0.08,
                    },
                    android: {
                      marginTop: height * 0.05,
                    },
                  }),
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

        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }} {...keyboardVerticalOffset}>
          <ScrollView bounces={false}>{renderAddress()}</ScrollView>
          {/* <StickyBottomComponent defaultBG> */}

          {/* {displayoverlay ? (
            <Button
              title="Delete Address"
              style={{
                position: 'absolute',
                width: 159,
                height: 58,
                backgroundColor: '#ffffff',
                top: -5,
                shadowColor: colors.SHADOW_GRAY,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                marginLeft: width / 2,
              }}
              titleTextStyle={{ color: '#02475b', ...theme.fonts.IBMPlexSansMedium(18) }}
              onPress={() => setdisplayoverlay(false)}
            />
          ) : null} */}
          <View
            style={{
              width: '100%',
              paddingTop: 10,
              height: height === 812 || height === 896 ? 80 : 70,
              alignItems: 'center',
            }}
          >
            <Button
              title={props.navigation.getParam('KeyName') == 'Update' ? 'SAVE' : 'SAVE & USE'}
              style={{ marginHorizontal: 40, width: '70%' }}
              onPress={onSavePress}
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
