import React, { useEffect, useState } from 'react';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Dimensions, View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { Relation, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '../../graphql/types/getPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from '../../graphql/profiles';
import { useShoppingCart } from '../ShoppingCartProvider';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';
import { useUIElements } from '../UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  placeholderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 6,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    maxWidth: '95%',
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

export interface ProfileListProps {
  selectedProfile?: GetCurrentPatients_getCurrentPatients_patients;
  setDisplayAddProfile?: (args0: boolean) => void;
  saveUserChange: boolean;
  defaultText?: string;
  childView?: Element;
  placeholderViewStyle?: StyleProp<ViewStyle>;
  placeholderTextStyle?: StyleProp<TextStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
  addStringValue?: string;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  unsetloaderDisplay?: boolean;
  showList?: boolean;
  menuHidden?: () => void;
  onProfileChange?: (profile: GetCurrentPatients_getCurrentPatients_patients) => void;
}

export const ProfileList: React.FC<ProfileListProps> = (props) => {
  const {
    placeholderViewStyle,
    placeholderTextStyle,
    defaultText,
    saveUserChange,
    selectedProfile,
    setDisplayAddProfile,
    listContainerStyle,
    unsetloaderDisplay,
  } = props;
  const addString = 'ADD MEMBER';
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();
  const shopCart = useShoppingCart();
  const diagCart = useDiagnosticsCart();
  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();
  const { loading, setLoading } = useUIElements();
  const { width, height } = Dimensions.get('window');

  const [profile, setProfile] = useState<
    GetCurrentPatients_getCurrentPatients_patients | undefined
  >(saveUserChange ? selectedProfile || currentPatient! : undefined);
  const [profileArray, setProfileArray] = useState<
    GetCurrentPatients_getCurrentPatients_patients[] | null
  >(allCurrentPatients);
  const [isAddressCalled, setAddressCalled] = useState<boolean>(false);

  const titleCase = (str: string) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  };

  const pickerData =
    (profileArray &&
      profileArray!.map((i) => {
        return { key: i.id, value: titleCase(i.firstName || i.lastName || '') };
      })) ||
    [];

  useEffect(() => {
    // AsyncStorage.removeItem('selectUserId');
    const getDataFromTree = async () => {
      const storeVallue = await AsyncStorage.getItem('selectUserId');
      console.log('storeVallue : uuh', storeVallue, currentPatient);
      if (storeVallue) {
        setCurrentPatientId(storeVallue);
        storeVallue &&
          ((currentPatient && currentPatient!.id !== storeVallue) ||
            currentPatient === null ||
            shopCart.addresses!.length === 0 ||
            diagCart.addresses!.length === 0) &&
          setAddressList(storeVallue);
      } else if (currentPatient) {
        AsyncStorage.setItem('selectUserId', currentPatient!.id);
        setAddressList(currentPatient!.id);
      }
    };

    if (!currentPatient) {
      getPatientApiCall();
    }
    getDataFromTree();
  }, [!currentPatient]);

  useEffect(() => {
    currentPatient && setProfile(currentPatient);
  }, [currentPatient]);

  useEffect(() => {
    setProfileArray(addNewProfileText(allCurrentPatients!));
    if (allCurrentPatients) {
      setLoading && setLoading(false);
    }
  }, [allCurrentPatients]);

  useEffect(() => {
    setProfileArray(addNewProfileText(profileArray!, profile));
  }, [profileArray!, profile]);

  const setAddressList = (key: string) => {
    unsetloaderDisplay ? null : setLoading && setLoading(true);
    if (!isAddressCalled) {
      setAddressCalled(true);
      client
        .query<getPatientAddressList, getPatientAddressListVariables>({
          query: GET_PATIENT_ADDRESS_LIST,
          variables: { patientId: key },
          fetchPolicy: 'no-cache',
        })
        .then(
          ({
            data: {
              getPatientAddressList: { addressList },
            },
          }) => {
            console.log(addressList, 'addresslidt');

            shopCart.setDeliveryAddressId && shopCart.setDeliveryAddressId('');
            diagCart.setDeliveryAddressId && diagCart.setDeliveryAddressId('');
            shopCart.setAddresses && shopCart.setAddresses(addressList!);
            diagCart.setAddresses && diagCart.setAddresses(addressList!);
            unsetloaderDisplay ? null : setLoading && setLoading(false);
            setAddressCalled(false);
          }
        )
        .catch((e) => {
          CommonBugFender('ProfileList_setAddressList', e);

          unsetloaderDisplay ? null : setLoading && setLoading(false);
          setAddressCalled(false);
        });
      // .finally(() => {

      // });
    }
  };

  const isNewEntry = (
    data: GetCurrentPatients_getCurrentPatients_patients[],
    val: GetCurrentPatients_getCurrentPatients_patients
  ) => {
    return data && data.find((item) => item.id.includes(val.id)) === undefined;
  };

  const addNewProfileText = (
    data: GetCurrentPatients_getCurrentPatients_patients[],
    newEntry?: GetCurrentPatients_getCurrentPatients_patients
  ) => {
    let pArray = data || [];
    if (pArray === []) {
      getPatientApiCall();
    }
    if (newEntry && isNewEntry(pArray, newEntry)) {
      pArray.pop();
      pArray.push(newEntry);
    }
    if (pArray.find((item) => item.id.includes(addString)) === undefined) {
      pArray.push({
        __typename: 'Patient',
        id: addString,
        mobileNumber: addString,
        firstName: addString,
        lastName: addString,
        relation: Relation.OTHER,
        uhid: addString,
        gender: Gender.OTHER,
        dateOfBirth: addString,
        emailAddress: addString,
        photoUrl: addString,
        patientMedicalHistory: null,
      });
    }
    return pArray;
  };

  const renderPicker = () => {
    return (
      <MaterialMenu
        showMenu={props.showList}
        menuHidden={() => {
          props.menuHidden && props.menuHidden();
        }}
        options={pickerData}
        defaultOptions={[]}
        selectedText={profile && profile!.id}
        menuContainerStyle={[
          {
            alignItems: 'flex-end',
            marginTop: 16,
            marginLeft: width / 2 - 95,
          },
          listContainerStyle,
        ]}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        lastTextStyle={{
          alignSelf: 'flex-end',
          paddingBottom: 5,
          textTransform: 'uppercase',
          ...theme.viewStyles.text('B', 13, '#fc9916'),
        }}
        bottomPadding={{ paddingBottom: 20 }}
        lastContainerStyle={{
          height: 38,
          borderBottomWidth: 0,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
        onPress={(selectedUser) => {
          if (selectedUser.key === addString) {
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: false,
              isPoptype: true,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
            });
            setDisplayAddProfile && setDisplayAddProfile(true);
          } else {
            const pfl = profileArray!.find((i) => selectedUser.key === i.id);
            props.onProfileChange && props.onProfileChange(pfl!);
            profileArray && setProfile(pfl);
          }
          saveUserChange &&
            selectedUser.key !== addString &&
            (setCurrentPatientId!(selectedUser!.key),
            AsyncStorage.setItem('selectUserId', selectedUser!.key),
            setAddressList(selectedUser!.key));
        }}
      >
        {props.childView ? (
          props.childView
        ) : (
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={[styles.placeholderViewStyle, placeholderViewStyle]}>
              <Text
                style={[
                  styles.placeholderTextStyle,
                  placeholderTextStyle,
                  ,
                  profile !== undefined ? null : styles.placeholderStyle,
                ]}
                numberOfLines={1}
              >
                {profile !== undefined ? profile.firstName : defaultText || 'Select User'}
              </Text>
              <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                <DropdownGreen />
              </View>
            </View>
          </View>
        )}
      </MaterialMenu>
    );
  };
  return renderPicker();
};
