import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SAVE_PATIENT_ADDRESS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  savePatientAddress,
  savePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  g,
  handleGraphQlError,
  aphConsole,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
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
import { PatientAddressInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  pinCodeServiceabilityApi,
  getPlaceInfoByPincode,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { DropDown, DropDownProps } from '@aph/mobile-patients/src/components/ui/DropDown';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
const { height } = Dimensions.get('window');

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
});

export interface AddAddressProps extends NavigationScreenProps {}

export const AddAddress: React.FC<AddAddressProps> = (props) => {
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

  const addOnly = props.navigation.state.params ? props.navigation.state.params.addOnly : false;

  const { addAddress, setDeliveryAddressId } = useShoppingCart();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

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
    state.length > 1;

  const saveAddress = (addressInput: PatientAddressInput) =>
    client.mutate<savePatientAddress, savePatientAddressVariables>({
      mutation: SAVE_PATIENT_ADDRESS,
      variables: { PatientAddressInput: addressInput },
    });

  const onSavePress = async () => {
    setshowSpinner(true);
    const addressInput = {
      patientId: userId,
      addressLine1: addressLine1,
      addressLine2: '',
      city: city,
      state: state,
      zipcode: pincode,
      landmark: landMark,
      mobileNumber: phoneNumber,
    };

    try {
      const [saveAddressResult, pinAvailabilityResult] = await Promise.all([
        saveAddress(addressInput),
        pinCodeServiceabilityApi(pincode),
      ]);

      setshowSpinner(false);
      // const address = saveAddressResult.data!.savePatientAddress.patientAddress!;
      const address = g(saveAddressResult.data, 'savePatientAddress', 'patientAddress')!;
      addAddress && addAddress(address);

      if (pinAvailabilityResult.data.Availability || addOnly) {
        setDeliveryAddressId && setDeliveryAddressId(address.id || '');
        props.navigation.goBack();
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
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
        title={'ADD NEW ADDRESS'}
        onPressLeftIcon={() => props.navigation.goBack()}
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
      .then(({ data }) => {
        aphConsole.log({ data });
        const results = g(data, 'results') || [];
        if (results.length == 0) return;
        const addrComponents = results[0].address_components || [];
        const city = (
          addrComponents.find(
            (item) =>
              item.types.indexOf('locality') > -1 ||
              item.types.indexOf('administrative_area_level_2') > -1
          ) || {}
        ).long_name;
        const state = (
          addrComponents.find((item) => item.types.indexOf('administrative_area_level_1') > -1) ||
          {}
        ).long_name;
        setcity(city || '');
        setstate(state || '');
      })
      .catch((e) => {
        aphConsole.error({ e });
      });
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
                    setuserName(item.firstName!);
                    setuserId(item.id);
                    setShowPopup(false);
                  },
                } as DropDownProps['options'][0])
            )}
          />
        )}
        <TextInputComponent
          value={userName}
          onChangeText={(text) =>
            text.startsWith(' ') || text.startsWith('.')
              ? null
              : (text == '' || /^([a-zA-Z.\s])+$/.test(text)) && setuserName(text)
          }
          placeholder={'Name'}
        />
        <TextInputComponent
          value={phoneNumber}
          onChangeText={(phoneNumber) =>
            (phoneNumber == '' || /^[6-9]{1}\d{0,9}$/.test(phoneNumber)) &&
            setphoneNumber(phoneNumber)
          }
          placeholder={'Phone Number'}
          maxLength={10}
        />
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
          placeholder={'Address Line 1'}
        />
        <TextInputComponent
          value={pincode}
          onChangeText={
            (pincode) => validateAndSetPincode(pincode)
            // (pincode == '' || /^[1-9]{1}\d{0,9}$/.test(pincode)) && setpincode(pincode)
          }
          placeholder={'Pincode'}
          maxLength={6}
        />
        <TextInputComponent
          value={landMark}
          onChangeText={(landMark) => (landMark.startsWith(' ') ? null : setlandMark(landMark))}
          placeholder={'Land Mark (optional)'}
        />
        <TextInputComponent
          value={city}
          onChangeText={(city) =>
            city.startsWith(' ') || city.startsWith('.')
              ? null
              : (city == '' || /^([a-zA-Z0-9.\s])+$/.test(city)) && setcity(city)
          }
          placeholder={'City'}
        />
        <TextInputComponent
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
        />
      </View>
    );
  };
  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }} {...keyboardVerticalOffset}>
          <ScrollView bounces={false}>{renderAddress()}</ScrollView>
          {/* <StickyBottomComponent defaultBG> */}
          <View
            style={{
              width: '100%',
              paddingTop: 10,
              height: height === 812 || height === 896 ? 80 : 70,
              alignItems: 'center',
            }}
          >
            <Button
              title={addOnly ? 'SAVE' : 'SAVE & USE'}
              style={{ marginHorizontal: 40, width: '70%' }}
              onPress={onSavePress}
              disabled={!isAddressValid}
            ></Button>
          </View>
          {/* </StickyBottomComponent> */}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
