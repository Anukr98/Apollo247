import { Button } from 'app/src/components/ui/Button';
import { useAuth } from 'app/src/hooks/authHooks';
import React from 'react';
import { View, AsyncStorage } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from 'app/src/components/NavigatorContainer';

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
          props.navigation.navigate(AppRoutes.Login);
        }}
      />
    </View>
  );
};
