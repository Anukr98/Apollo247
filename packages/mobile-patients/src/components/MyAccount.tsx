import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import React from 'react';
import { View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { signOut } = useAuth();

  return (
    <View
      style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}
    >
      <Button
        title="LOGOUT"
        onPress={() => {
          signOut();
          AsyncStorage.setItem('userLoggedIn', 'false');
          AsyncStorage.setItem('multiSignUp', 'false');
          AsyncStorage.setItem('signUp', 'false');
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
            })
          );
        }}
      />
    </View>
  );
};
