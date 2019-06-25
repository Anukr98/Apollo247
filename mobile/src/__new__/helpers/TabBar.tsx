import React from 'react';
import { Text, View, Image } from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { AppImages } from 'app/src/__new__/images/AppImages';

import { ConsultRoom } from '../components/ConsultRoom';
// import MyHealth from '../MyHealth';
// import Orders from '../Orders';
// import Account from '../Account';

const Colors = {
  activeTintColor: '#02475b',
  inactiveTintColor: '#02475b',
};
export const TabBar = createBottomTabNavigator(
  {
    ConsultRoom: ConsultRoom,
    MyHealth: ConsultRoom,
    Orders: ConsultRoom,
    Account: ConsultRoom,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'ConsultRoom') {
          iconName = `ConsultRoom${focused ? 'Act' : ''}`;
        } else if (routeName === 'MyHealth') {
          iconName = `MyHealth${focused ? 'Act' : ''}`;
        } else if (routeName === 'Orders') {
          iconName = `Orders${focused ? 'Act' : ''}`;
        } else if (routeName === 'Account') {
          iconName = `Account${focused ? 'Act' : ''}`;
        }
        return <Image {...AppImages.tab[iconName]} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: Colors.activeTintColor,
      inactiveTintColor: Colors.inactiveTintColor,
    },
  }
);
