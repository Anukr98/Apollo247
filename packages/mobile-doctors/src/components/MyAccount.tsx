import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { clearUserData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { Alert, View, SafeAreaView } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { useApolloClient } from 'react-apollo-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import { DELETE_DOCTOR_DEVICE_TOKEN } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  deleteDoctorDeviceToken,
  deleteDoctorDeviceTokenVariables,
} from '@aph/mobile-doctors/src/graphql/types/deleteDoctorDeviceToken';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { clearFirebaseUser, doctorDetails } = useAuth();
  const client = useApolloClient();
  const { setLoading } = useUIElements();

  const deleteDeviceToken = async () => {
    const deviceToken = JSON.parse((await AsyncStorage.getItem('deviceToken')) || '');
    setLoading && setLoading(true);
    client
      .mutate<deleteDoctorDeviceToken, deleteDoctorDeviceTokenVariables>({
        mutation: DELETE_DOCTOR_DEVICE_TOKEN,
        variables: {
          doctorId: doctorDetails && doctorDetails.id,
          deviceToken: deviceToken,
        },
      })
      .then((data) => {
        Promise.all([clearFirebaseUser && clearFirebaseUser(), clearUserData()])
          .then(() => {
            setLoading && setLoading(false);
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
              })
            );
          })
          .catch((e) => {
            setLoading && setLoading(false);
            console.log(e);
            Alert.alert(strings.common.error, strings.login.signout_error);
          });
      })
      .catch((error) => {
        setLoading && setLoading(false);
        Alert.alert(strings.common.error, strings.login.signout_error);
      });
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          containerStyle={{ height: 50 }}
          leftIcons={[
            {
              icon: <BackArrow />,
              onPress: () => props.navigation.pop(),
            },
          ]}
          headerText={strings.account.settings}
        />
        <View
          style={{
            flex: 1,

            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            style={{ width: '80%' }}
            title={strings.buttons.logout}
            onPress={() => {
              deleteDeviceToken();
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
