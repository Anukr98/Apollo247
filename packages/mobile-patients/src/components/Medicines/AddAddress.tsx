import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SAVE_PATIENT_ADDRESS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  savePatientAddress,
  savePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GraphQLError } from 'graphql';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
const { width, height } = Dimensions.get('window');

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
  const { addAddress, setDeliveryAddressId } = useShoppingCart();
  const client = useApolloClient();

  const onSavePress = () => {
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
    client
      .mutate<savePatientAddress, savePatientAddressVariables>({
        mutation: SAVE_PATIENT_ADDRESS,
        variables: { PatientAddressInput: addressInput },
      })
      .then(({ data }) => {
        const address = g(data, 'savePatientAddress', 'patientAddress');
        addAddress && addAddress(address!);
        setDeliveryAddressId && setDeliveryAddressId((address && address.id) || '');
        props.navigation.goBack();
      })
      .catch((e: GraphQLError[]) => {});
  };

  useEffect(() => {
    if (currentPatient) {
      setuserName(currentPatient.firstName!);
      setuserId(currentPatient.id);
    }
    console.log('currentPatient', currentPatient);
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

  const renderAddress = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          margin: 20,
          padding: 16,
        }}
      >
        <TouchableOpacity activeOpacity={1}
          onPress={() => {
            setShowPopup(true);
          }}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.placeholderViewStyle}>
            <Text style={[styles.placeholderTextStyle]}>{userName}</Text>
            <DropdownGreen size="sm" />
          </View>
        </TouchableOpacity>
        <TextInputComponent
          value={phoneNumber}
          onChangeText={(phoneNumber) =>
            /^[6-9]{1}\d{0,9}$/.test(phoneNumber) && setphoneNumber(phoneNumber)
          }
          placeholder={'Phone Number'}
          maxLength={10}
        />
        <TextInputComponent
          value={addressLine1}
          onChangeText={(addressLine1) => setaddressLine1(addressLine1)}
          placeholder={'Address Line 1'}
        />
        <TextInputComponent
          value={pincode}
          onChangeText={(pincode) => setpincode(pincode)}
          placeholder={'Pincode'}
          maxLength={6}
        />
        <TextInputComponent
          value={landMark}
          onChangeText={(landMark) => setlandMark(landMark)}
          placeholder={'Land Mark'}
        />
        <TextInputComponent
          value={city}
          onChangeText={(city) => setcity(city)}
          placeholder={'City'}
        />
        <TextInputComponent
          value={state}
          onChangeText={(state) => setstate(state)}
          placeholder={'State'}
        />
      </View>
    );
  };

  const Popup = () => (
    <TouchableOpacity activeOpacity={1}
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
      onPress={() => setShowPopup(true)}
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
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        {allCurrentPatients &&
          allCurrentPatients.map((item) => (
            <View key={item.id} style={styles.textViewStyle}>
              <Text
                style={styles.textStyle}
                onPress={() => {
                  setuserName(item.firstName!);
                  setuserId(item.id);
                  setShowPopup(true);
                }}
              >
                {item.firstName}
              </Text>
            </View>
          ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderAddress()}
        <StickyBottomComponent defaultBG>
          <Button
            title={'SAVE & USE'}
            style={{ flex: 1, marginHorizontal: 40 }}
            onPress={onSavePress}
            disabled={addressLine1.length === 0 && pincode.length !== 6}
          ></Button>
        </StickyBottomComponent>
        {showPopup && Popup()}
      </SafeAreaView>
    </View>
  );
};
