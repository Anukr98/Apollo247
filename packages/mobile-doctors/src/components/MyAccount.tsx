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

export interface MyAccountProps extends NavigationScreenProps {}

export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { clearFirebaseUser } = useAuth();

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
      </SafeAreaView>
    </View>
  );
};
