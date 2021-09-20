import React, { useEffect, useState } from 'react';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Dimensions, View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DropdownGreen, LinkedUhidIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { Relation, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '../ShoppingCartProvider';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { g } from '../../helpers/helperFunctions';
import { useAppCommonData } from '../AppCommonDataProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  phrNotificationCountApi,
  updatePatientAppVersion,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { HEALTH_CREDITS } from '../../utils/AsyncStorageKey';

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
  lastContainerStyle: {
    height: 38,
    borderBottomWidth: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  lastTextStyle: {
    alignSelf: 'flex-start',
    paddingBottom: 5,
    textTransform: 'uppercase',
    ...theme.viewStyles.text('M', 12, '#fc9916'),
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 13, '#00b38e'),
    alignSelf: 'flex-start',
  },
});

export interface ProfileListProps {
  selectedProfile?: GetCurrentPatients_getCurrentPatients_patients;
  /** @deprecated Avoid using this prop, it'll be removed in future. */
  setDisplayAddProfile?: (args0: boolean) => void;
  saveUserChange: boolean;
  defaultText?: string;
  childView?: Element;
  placeholderViewStyle?: StyleProp<ViewStyle>;
  placeholderTextStyle?: StyleProp<TextStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
  addStringValue?: string;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  /** @deprecated Not using this prop anymore. */
  unsetloaderDisplay?: boolean;
  showList?: boolean;
  menuHidden?: () => void;
  onProfileChange?: (profile: GetCurrentPatients_getCurrentPatients_patients) => void;
  screenName?: string;
  editProfileCallback?: (patient: any) => void;
  showProfilePic?: boolean;
  cleverTapProfileClickEvent?: () => void;
  cleverTapEventForAddMemberClick?: () => void;
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
    showProfilePic,
  } = props;
  const addString = '+ADD MEMBER';
  const addBoolen = false;
  const { getPatientApiCall } = useAuth();
  const shopCart = useShoppingCart();
  const diagCart = useDiagnosticsCart();
  const { setDoctorJoinedChat } = useAppCommonData();
  const {
    allCurrentPatients,
    setCurrentPatientId,
    currentPatient,
    profileAllPatients,
  } = useAllCurrentPatients();
  const { width, height } = Dimensions.get('window');
  const client = useApolloClient();

  const [profile, setProfile] = useState<
    GetCurrentPatients_getCurrentPatients_patients | undefined
  >(saveUserChange ? selectedProfile || currentPatient! : undefined);
  const [profileArray, setProfileArray] = useState<
    GetCurrentPatients_getCurrentPatients_patients[] | null
  >(allCurrentPatients);

  const { isUHID, setPhrNotificationData, setPhrSession } = useAppCommonData();

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
        return {
          key: i.id,
          value: titleCase(i.firstName || i.lastName || ''),
          isPrimary: i.isUhidPrimary,
          uhid: i.uhid,
          photoUrl: i.photoUrl,
          relation: titleCase(i.relation || ''),
        };
      })) ||
    [];
  const moveSelectedToTop = () => {
    if (profile !== undefined) {
      const patientLinkedProfiles = [
        pickerData.find((item) => item.uhid === profile!.uhid),
        ...pickerData.filter((item) => item.uhid !== profile!.uhid),
      ];
      return patientLinkedProfiles;
    }
    return pickerData;
  };
  useEffect(() => {
    if (isUHID) {
      isUHID.map(async (el: any) => {
        try {
          const selectedUHID = await AsyncStorage.getItem('selectUserUHId');

          if (el === selectedUHID) {
            const profilePatients = profileAllPatients.filter((obj: any) => {
              return obj.isUhidPrimary === true;
            });

            props.onProfileChange && props.onProfileChange(profilePatients[0]!);
            profile && setProfile(profilePatients[0]);

            setCurrentPatientId!(g(profilePatients[0], 'id')),
              AsyncStorage.setItem('selectUserId', g(profilePatients[0], 'id')),
              AsyncStorage.setItem('selectUserUHId', g(profilePatients[0], 'uhid')),
              AsyncStorage.setItem(HEALTH_CREDITS, ''),
              setAddressList(g(profilePatients[0], 'id'));
          }
        } catch (error) {}
      });
    }
  }, [isUHID]);

  useEffect(() => {
    const getDataFromTree = async () => {
      const storeVallue = await AsyncStorage.getItem('selectUserId');
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
        AsyncStorage.setItem('selectUserUHId', currentPatient!.uhid),
          AsyncStorage.setItem(HEALTH_CREDITS, ''),
          setAddressList(currentPatient!.id);
      }
    };

    if (!currentPatient) {
      getPatientApiCall();
    }
    getDataFromTree();
  }, [!currentPatient]);

  useEffect(() => {
    if (currentPatient) {
      setProfile(currentPatient);
      updatePatientAppVersion(client, currentPatient);
    }
  }, [currentPatient]);

  useEffect(() => {
    setProfileArray(addNewProfileText(profileAllPatients!));
  }, [profileAllPatients]);

  useEffect(() => {
    setProfileArray(addNewProfileText(profileArray!, profile));
  }, [profileArray!, profile]);

  const setAddressList = (key: string) => {
    shopCart.setDeliveryAddressId!('');
    diagCart.setDeliveryAddressId!('');
    shopCart.setAddresses!([]);
    diagCart.setAddresses!([]);
    setDoctorJoinedChat!(false);
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
        athsToken: addString,
        referralCode: addString,
        isLinked: addBoolen,
        isUhidPrimary: addBoolen,
        primaryUhid: addString,
        primaryPatientId: addString,
        whatsAppMedicine: null,
        whatsAppConsult: null,
      });
    }
    return pArray;
  };

  const callPhrNotificationApi = async (currentPatient: any) => {
    phrNotificationCountApi(client, currentPatient || '')
      .then((newRecordsCount) => {
        if (newRecordsCount) {
          setPhrNotificationData &&
            setPhrNotificationData(
              newRecordsCount! as getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount
            );
        }
      })
      .catch((error) => {
        CommonBugFender('SplashcallPhrNotificationApi', error);
      });
  };

  const renderPicker = () => {
    const usersList = moveSelectedToTop();
    return (
      <MaterialMenu
        showProfilePic={showProfilePic}
        showMenu={props.showList}
        menuHidden={() => {
          props.menuHidden && props.menuHidden();
        }}
        options={usersList[0] === undefined ? pickerData : usersList}
        profileClickCleverTapEvent={() =>
          props.cleverTapProfileClickEvent && props.cleverTapProfileClickEvent()
        }
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
        itemContainer={{
          height: showProfilePic ? 70.8 : 44.8,
          marginHorizontal: 12,
          width: width / 2,
        }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 13, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={styles.selectedTextStyle}
        lastTextStyle={!showProfilePic && styles.lastTextStyle}
        bottomPadding={{ paddingBottom: props.showProfilePic ? 0 : 20 }}
        lastContainerStyle={showProfilePic ? { borderBottomWidth: 0 } : styles.lastContainerStyle}
        onPress={(selectedUser) => {
          if (selectedUser.key === addString) {
            props.cleverTapEventForAddMemberClick && props.cleverTapEventForAddMemberClick();
            const pfl = profileArray!.find((i) => selectedUser.key === i.id);
            props.onProfileChange && props.onProfileChange(pfl!);
            props.navigation.navigate(AppRoutes.EditProfile, {
              isEdit: false,
              isPoptype: true,
              mobileNumber: currentPatient && currentPatient!.mobileNumber,
              screenName: props.screenName,
              goBackCallback: props.editProfileCallback,
            });
            setDisplayAddProfile && setDisplayAddProfile(true);
          } else {
            const pfl = profileArray!.find((i) => selectedUser.key === i.id);
            props.onProfileChange && props.onProfileChange(pfl!);
            profileArray && setProfile(pfl);
            if (pfl?.id) {
              callPhrNotificationApi(pfl?.id);
              setPhrSession?.('');
            }
          }
          saveUserChange &&
            selectedUser.key !== addString &&
            (setCurrentPatientId!(selectedUser!.key),
            AsyncStorage.setItem('selectUserId', selectedUser!.key),
            AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid),
            AsyncStorage.setItem(HEALTH_CREDITS, ''),
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
              {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                <LinkedUhidIcon
                  style={{ width: 22, height: 20, marginLeft: 5, marginTop: 2 }}
                  resizeMode={'contain'}
                />
              ) : null}
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
