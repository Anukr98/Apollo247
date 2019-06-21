import React from 'react';
import { Text, View, Image } from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Images from '../res/Images';
import ConsultRoom from '../UI/Dashboard/ConsultRoom';
import MyHealth from '../UI/Dashboard/MyHealth';
import Orders from '../UI/Dashboard/Orders';
import Account from '../UI/Dashboard/Account';

const Colors = {
  activeTintColor: '#02475b',
  inactiveTintColor: '#02475b'
}
const TabNavigator = createBottomTabNavigator(
  {
    ConsultRoom: ConsultRoom,
    MyHealth: MyHealth,
    Orders: Orders,
    Account: Account
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
        return <Image {...Images.TabIcons[iconName]} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: Colors.activeTintColor,
      inactiveTintColor: Colors.inactiveTintColor,
    },
  }
);

export default TabNavigator;