import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { clearUserData, CheckDelegate } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import React from 'react';
import { Alert, View, AsyncStorage } from 'react-native';
import { NavigationScreenProps, StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { signOut } = useAuth();

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
        title="LOGOUT"
        onPress={() => {
          signOut && signOut();
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
            })
          );
          // Promise.all([clearFirebaseUser && clearFirebaseUser(), clearUserData(), CheckDelegate])
          //   .then(() => {
          //     props.navigation.dispatch(
          //       StackActions.reset({
          //         index: 0,
          //         key: null,
          //         actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
          //       })
          //     );
          //   })
          //   .catch((e) => {
          //     console.log(e);
          //     Alert.alert('Error', 'Something went wrong while signing you out.');
          //   });
        }}
      />
    </View>
  );
};
