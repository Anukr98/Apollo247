import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { clearUserData } from 'app/src/helpers/localStorage';
import { useAuth } from 'app/src/hooks/authHooks';
import React from 'react';
import { Alert, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
          clearUserData()
            .then(() => {
              props.navigation.replace(AppRoutes.Login);
            })
            .catch((_) => {
              Alert.alert('Error', 'Something went wrong while signing you out.');
            });
        }}
      />
    </View>
  );
};
