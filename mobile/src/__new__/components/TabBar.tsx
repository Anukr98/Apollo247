import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';
import { theme } from 'app/src/__new__/theme/theme';
import { ConsultationRoom } from 'app/src/__new__/components/ui/Icons';
import { AppRoutes } from 'app/src/__new__/components/AppNavigatorContainer';

const routeToIcon: Partial<Record<keyof typeof AppRoutes, any>> = {
  [AppRoutes.ConsultRoom]: <ConsultationRoom />,
  [AppRoutes.ConsultRoom]: <ConsultationRoom />,
};

export const TabBar = createBottomTabNavigator(
  {
    [appRoutes.consultRoom()]: ConsultRoom,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        if (routeName === 'ConsultRoom') {
          iconName = `ConsultRoom${focused ? 'Act' : ''}`;
        } else if (routeName === 'MyHealth') {
          iconName = `MyHealth${focused ? 'Act' : ''}`;
        } else if (routeName === 'Orders') {
          iconName = `Orders${focused ? 'Act' : ''}`;
        } else if (routeName === 'Account') {
          iconName = `Account${focused ? 'Act' : ''}`;
        }
        return <Image source={require('app/src/__new__/images/tab/ic_consultroom.png')} />;
        // const { routeName } = navigation.state;
        // let iconName;
        // if (routeName === 'ConsultRoom') {
        //   iconName = `ConsultRoom${focused ? 'Act' : ''}`;
        // }
        // return <Image {...AppImages.tab[iconName]} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: theme.colors.TAB_BAR_ACTIVE_TINT_COLOR,
      inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TINT_COLOR,
    },
  }
);
