import { createStackNavigator, createAppContainer } from 'react-navigation';

import { Login } from 'app/src/__new__/components/Login';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { TabBar } from 'app/src/__new__/components/TabBar';
import { appRoutes } from 'app/src/__new__/helpers/appRoutes';

const AppNavigator = createStackNavigator(
  {
    [appRoutes.onboarding()]: {
      screen: Onboarding,
      navigationOptions: {
        header: null,
      },
    },
    [appRoutes.tabBar()]: {
      screen: TabBar,
      navigationOptions: {
        header: null,
      },
    },
    [appRoutes.login()]: {
      screen: Login,
    },
    // [appRoutes.otpVerification()]: {
    //   screen: OTPVerification,
    // },
    // Home: {
    //   screen: Home,
    // },
    // AddTodo: {
    //   screen: AddTodo,
    // },
    // SignUp: {
    //   screen: SignUp,
    // },
    // SearchScene: {
    //   screen: SearchScene,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
    // DoctorSearchListing: {
    //   screen: DoctorSearchListing,
    //   navigationOptions: {
    //     header: null,
    //   },
    // },
  },
  {
    initialRouteName: appRoutes.onboarding(),
    headerMode: 'none',
    cardStyle: { backgroundColor: 'transparent' },
    transitionConfig: () => {
      return {
        transitionSpec: {
          duration: 0,
        },
      };
    },
  }
);

export const AppNavigatorContainer = createAppContainer(AppNavigator);
