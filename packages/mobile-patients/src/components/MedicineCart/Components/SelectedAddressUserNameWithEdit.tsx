/**
 * This component is being used for updating user name on review cart section
 *
 */
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { EditIconNewOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { UPDATE_PATIENT_ADDRESS } from '@aph/mobile-patients/src/graphql/profiles';

import { UpdatePatientAddressInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';

import {
  updatePatientAddress,
  updatePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatientAddress';

import { handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

const { width } = Dimensions.get('window');
const setCharLen = width < 380 ? 25 : 30; //smaller devices like se, nexus 5

export const SelectedAddressUserNameWithEdit: React.FC<{
  address: getPatientAddressList_getPatientAddressList_addressList;
}> = ({ address }) => {
  const [userName, setUserName] = useState<string>('');
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [editName, setEditName] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { addresses = [], setAddresses } = useShoppingCart();

  useEffect(() => {
    setUserName(address.name || '');
  }, [address.name]);
  const client = useApolloClient();

  const validateUserDetails = (comingFrom: string) => {
    if (userName === address.name) {
      // name not changed
      setEditName(false);
      return;
    }
    let validationMessage = '';
    if (!userName || !/^[A-Za-z]/.test(userName)) {
      validationMessage = 'Enter Valid Name';
    }
    if (validationMessage) {
      showAphAlert!({
        title: 'Alert!',
        description: validationMessage,
        onPressOk: () => {
          hideAphAlert!();
        },
      });
    } else {
      setEditName(false);
      CommonLogEvent(AppRoutes.EditAddress, 'On Save Press clicked');
      onUpdateDetails();
    }
  };
  const onUpdateDetails = () => {
    setShowSpinner(true);
    CommonLogEvent(AppRoutes.EditAddress, 'On Save Edit clicked');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __typename, addressType, createdDate, updatedDate, ...add } = address;
    const updateAddressInputForEdit: UpdatePatientAddressInput = {
      ...add,
      name: userName,
    };
    setShowSpinner(true);
    client
      .mutate<updatePatientAddress, updatePatientAddressVariables>({
        mutation: UPDATE_PATIENT_ADDRESS,
        variables: { UpdatePatientAddressInput: updateAddressInputForEdit },
      })
      .then((_data: any) => {
        try {
          if (_data?.data?.updatePatientAddress?.patientAddress?.id)
            addresses.forEach((ad, index) => {
              if (ad.id === _data?.data?.updatePatientAddress?.patientAddress?.id) {
                addresses[index] = _data?.data?.updatePatientAddress?.patientAddress;
                setAddresses!([...addresses]);
                return;
              }
            });
          setShowSpinner(false);
        } catch (error) {
          CommonBugFender('EditAddress_onSavePress_try', error);
        }
      })
      .catch((e) => {
        CommonBugFender('EditAddress_onSavePress', e);
        setShowSpinner(false);
        setEditName(true);
        handleGraphQlError(e);
      });
  };

  const _onFocus = () => {
    setIsFocus(true);
  };

  const _onBlur = () => {
    setIsFocus(false);
  };

  const renderUserName = () => {
    let beforeFocus =
      Platform.OS == 'android' && userName.length > 32
        ? userName.slice(0, setCharLen).concat('...')
        : userName;
    return (
      <View style={{ marginTop: 10, marginBottom: 5 }}>
        <Text
          style={{
            color: editName ? theme.colors.LIGHT_BLUE : theme.colors.SHERPA_BLUE,
            opacity: 1,
            ...fonts.IBMPlexSansSemiBold(14),
          }}
        >
          Bill To*:
        </Text>
        <View style={[styles.viewRowStyle, editName && styles.viewRowStyleSelected]}>
          <View style={[{ height: 20 }, editName ? { flex: 1 } : { paddingRight: 10 }]}>
            {!editName ? (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: theme.colors.SHERPA_BLUE,
                  marginBottom: Platform.OS == 'android' ? '9%' : '0%',
                  ...theme.fonts.IBMPlexSansMedium(14),
                }}
              >
                {userName}
              </Text>
            ) : (
              <TextInputComponent
                conatinerstyles={{ flex: 1, paddingTop: -16, paddingBottom: -16 }}
                onChangeText={(userName) =>
                  userName.startsWith(' ') ? null : setUserName(userName)
                }
                onFocus={() => _onFocus()}
                onBlur={() => _onBlur()}
                value={isFocus ? userName : beforeFocus}
                editable={editName}
                placeholder={'Full Name'}
                inputStyle={styles.textInputName}
                autoFocus
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  validateUserDetails('userName');
                }}
              />
            )}
          </View>
          {!editName ? (
            <TouchableOpacity
              onPress={() => {
                setEditName(true);
              }}
            >
              <EditIconNewOrange style={{ height: 15, width: 15 }} />
            </TouchableOpacity>
          ) : (
            <View style={styles.userSave}>
              {showSpinner ? (
                <ActivityIndicator />
              ) : (
                <TouchableOpacity
                  style={{ width: '100%' }}
                  onPress={() => {
                    Keyboard.dismiss();
                    validateUserDetails('userName');
                  }}
                >
                  <Text style={styles.userSaveText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {editName ? (
          <Text
            style={{
              marginHorizontal: 2,
              ...theme.fonts.IBMPlexSansRegular(10),
              lineHeight: 13,
              color: theme.colors.PACIFIC_BLUE,
            }}
          >
            This bill will be prepared against this name.
          </Text>
        ) : null}
      </View>
    );
  };

  return renderUserName();
};

const styles = StyleSheet.create({
  viewRowStyle: {
    flexDirection: 'row',
  },
  viewRowStyleSelected: {
    borderColor: theme.colors.LIGHT_BLUE,
    borderBottomWidth: 1,
    marginBottom: 3,
  },
  userSave: {
    flex: 0.2,
  },
  userSaveText: {
    ...theme.viewStyles.yellowTextStyle,
    ...fonts.IBMPlexSansMedium(15),
    textAlign: 'right',
  },

  textInputName: {
    paddingBottom: 0,
    color: theme.colors.SHERPA_BLUE,
    opacity: Platform.OS == 'ios' ? 0.6 : 0.5,
    ...theme.fonts.IBMPlexSansMedium(14.75),
    borderColor: theme.colors.LIGHT_BLUE,
    borderBottomWidth: 0,
  },
});
