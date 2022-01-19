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
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { getPatientAddressList_getPatientAddressList_addressList } from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export const SelectedAddressUserNameWithEdit: React.FC<{
  address: getPatientAddressList_getPatientAddressList_addressList;
}> = ({ address }) => {
  const [userName, setUserName] = useState<string>('');
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
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

  const renderUserName = () => {
    return (
      <View style={styles.main}>
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
              <Text numberOfLines={1} style={styles.userNameStyle}>
                {userName}
              </Text>
            ) : (
              <TextInputComponent
                conatinerstyles={styles.input}
                onChangeText={(userName) =>
                  userName.startsWith(' ') ? null : setUserName(userName)
                }
                value={userName}
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
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
              onPress={() => {
                setEditName(true);
              }}
            >
              <EditIconNewOrange style={styles.editIcon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.userSave}>
              {showSpinner ? (
                <ActivityIndicator />
              ) : (
                <TouchableOpacity
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
  main: { marginTop: 10, marginBottom: 5 },
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
  userNameStyle: {
    color: theme.colors.SHERPA_BLUE,
    marginBottom: Platform.OS == 'android' ? '9%' : '0%',
    ...theme.fonts.IBMPlexSansMedium(14),
    maxWidth: Dimensions.get('screen').width - 80,
  },
  editIcon: { height: 15, width: 15 },
  input: { flex: 1, paddingTop: -16, paddingBottom: -16 },
});
