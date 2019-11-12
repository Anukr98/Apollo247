import React, { useEffect, useState } from 'react';
import { useAllCurrentPatients, useAuth } from '../../hooks/authHooks';
import { MaterialMenu } from './MaterialMenu';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme/theme';
import { DropdownGreen } from './Icons';
import { GetCurrentPatients_getCurrentPatients_patients } from '../../graphql/types/GetCurrentPatients';
import { Relation, Gender } from '../../graphql/types/globalTypes';

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
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

export interface ProfileListProps {
  selectedProfile?: GetCurrentPatients_getCurrentPatients_patients;
  setDisplayAddProfile: (args0: boolean) => void;
  saveUserChange: boolean;
  defaultText?: string;
  placeholderViewStyle?: StyleProp<ViewStyle>;
  placeholderTextStyle?: StyleProp<TextStyle>;
}

export const ProfileList: React.FC<ProfileListProps> = (props) => {
  const {
    placeholderViewStyle,
    placeholderTextStyle,
    defaultText,
    saveUserChange,
    selectedProfile,
    setDisplayAddProfile,
  } = props;
  const addString = 'ADD NEW PROFILE';
  const { getPatientApiCall } = useAuth();

  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();
  const { width, height } = Dimensions.get('window');

  const [profile, setProfile] = useState<
    GetCurrentPatients_getCurrentPatients_patients | undefined
  >(saveUserChange ? selectedProfile || currentPatient! : undefined);
  const [profileArray, setProfileArray] = useState<
    GetCurrentPatients_getCurrentPatients_patients[] | null
  >(allCurrentPatients);

  const pickerData =
    (profileArray &&
      profileArray!.map((i) => {
        return { key: i.id, value: i.firstName || i.lastName || '' };
      })) ||
    [];

  useEffect(() => {
    getPatientApiCall();
    const getDataFromTree = async () => {
      const storeVallue = await AsyncStorage.getItem('selectUserId');
      console.log('storeVallue', storeVallue);
      setCurrentPatientId(storeVallue);
    };
    getDataFromTree();
  }, []);

  useEffect(() => {
    setProfileArray(addNewProfileText(profileArray!, selectedProfile));
    setProfile(selectedProfile);
  }, [profileArray!, selectedProfile]);

  const addNewProfileText = (
    data: GetCurrentPatients_getCurrentPatients_patients[],
    newEntry?: GetCurrentPatients_getCurrentPatients_patients
  ) => {
    let pArray = data;
    if (newEntry) {
      pArray.pop();
      pArray.push(newEntry);
    }
    if (data.find((item) => item.id.includes(addString)) === undefined) {
      pArray.push({
        __typename: 'Patient',
        id: addString,
        mobileNumber: addString,
        firstName: addString,
        lastName: addString,
        relation: Relation.ME,
        uhid: addString,
        gender: Gender.OTHER,
        dateOfBirth: addString,
        emailAddress: addString,
      });
    }
    return pArray;
  };

  const renderPicker = () => {
    return (
      <MaterialMenu
        options={pickerData}
        defaultOptions={[]}
        selectedText={profile && profile!.id}
        menuContainerStyle={{
          alignItems: 'flex-end',
          marginTop: 16,
          marginLeft: width / 2 - 95,
        }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        lastTextStyle={{
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
          if (selectedUser.key === 'ADD NEW PROFILE') setDisplayAddProfile(true);
          else {
            profileArray &&
              profileArray!.map((i) => {
                if (selectedUser.key === i.id) {
                  setProfile(i);
                }
              });
          }
          saveUserChange &&
            (setCurrentPatientId!(selectedUser!.key),
            AsyncStorage.setItem('selectUserId', selectedUser!.key));
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={[styles.placeholderViewStyle, placeholderViewStyle]}>
            <Text
              style={[
                styles.placeholderTextStyle,
                placeholderTextStyle,
                ,
                profile !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {profile !== undefined ? profile.firstName : defaultText || 'Select User'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };
  return renderPicker();
};
