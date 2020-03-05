import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { clearUserData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { Alert, View } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { clearFirebaseUser } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        style={{ width: '80%' }}
        title={strings.buttons.logout}
        onPress={() => {
          // signOut && signOut();
          // props.navigation.dispatch(
          //   StackActions.reset({
          //     index: 0,
          //     key: null,
          //     actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
          //   })
          // );
          Promise.all([clearFirebaseUser && clearFirebaseUser(), clearUserData()])
            .then(() => {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
                })
              );
            })
            .catch((e) => {
              console.log(e);
              Alert.alert(strings.common.error, strings.login.signout_error);
            });
        }}
      />
    </View>
  );
};
