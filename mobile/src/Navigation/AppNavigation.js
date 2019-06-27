
import { createStackNavigator, createAppContainer } from "react-navigation";

import { Home, AddTodo } from '../UI';
import { Login, OTPVerification, SignUp } from '../UI/Login';
import { Onboarding } from '../UI/Intro';
import TabBar from './TabBar';
import { SearchScene, DoctorSearchListing } from '../UI/Scenes';

const AppNavigator = createStackNavigator(
  {
    Onboarding: {
      screen: Onboarding,
      navigationOptions: {
        header: null,
      }
    },
    TabBar: {
      screen: TabBar,
      navigationOptions: {
        header: null,
      }
    },
    Login: {
      screen: Login
    },
    OTPVerification: {
      screen: OTPVerification
    },
    Home: {
      screen: Home
    },
    AddTodo: {
      screen: AddTodo
    },
    SignUp: {
      screen: SignUp
    },
    SignUp: {
      screen: SignUp
    },
    SearchScene: {
      screen: SearchScene,
      navigationOptions: {
        header: null,
      }
    },
    DoctorSearchListing: {
      screen: DoctorSearchListing,
      navigationOptions: {
        header: null,
      }
    }
  },
  {
    initialRouteName: 'SearchScene',
    headerMode: 'none',
    cardStyle: { backgroundColor: 'transparent' },
    transitionConfig: () => {
      return {
        transitionSpec: {
          duration: 0
        }
      };
    }
  }
);

export default createAppContainer(AppNavigator);
