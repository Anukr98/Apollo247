import { MyAccount } from '@aph/mobile-patients/src/components/Account/MyAccount';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { HealthRecordsHome } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordsHome';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  ConsultationRoom,
  ConsultationRoomFocused,
  MyHealth,
  MyHealthFocused,
  Person,
  PersonFocused,
  TestsIconFocused,
  TestsIcon,
  MedicineIcon,
  MedicineIconWhite,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';
import { Tests } from '@aph/mobile-patients/src/components/Tests/Tests';
import { View, Text, StyleSheet } from 'react-native';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { getPhrNotificationAllCount } from '@aph/mobile-patients/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  badgelabelView: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#E50000',
    height: 15,
    width: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgelabelText: {
    ...theme.fonts.IBMPlexSansMedium(9),
    color: theme.colors.WHITE,
  },
});

const healthRecordsIcon = (focus: boolean, count: number) => {
  return (
    <View>
      {focus ? <MyHealthFocused /> : <MyHealth />}
      {count !== 0 ? (
        <View style={[styles.badgelabelView]}>
          <Text style={styles.badgelabelText}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
};
interface TabBarProps {
  focus?: boolean;
}

const TabBarCompo: React.FC<TabBarProps> = (props) => {
  const { phrNotificationData } = useAppCommonData();
  const phrNotificationCount = getPhrNotificationAllCount(phrNotificationData!);
  return healthRecordsIcon(props.focus!, phrNotificationCount);
};

const routeToIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoom />,
  'HEALTH RECORDS': <TabBarCompo />,
  MEDICINES: <MedicineIcon />,
  TESTS: <TestsIcon />,
  'MY ACCOUNT': <Person />,
};

const routeToFocusedIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoomFocused />,
  'HEALTH RECORDS': <TabBarCompo focus />,
  MEDICINES: <MedicineIconWhite />,
  TESTS: <TestsIconFocused />,
  'MY ACCOUNT': <PersonFocused />,
};

const routeConfigMap: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: Consult,
  'HEALTH RECORDS': HealthRecordsHome,
  MEDICINES: Medicine,
  TESTS: Tests,
  'MY ACCOUNT': MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  initialRouteName: 'APPOINTMENTS',
  backBehavior: 'none',
  resetOnBlur: true,
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) =>
      focused
        ? routeToFocusedIcon[navigation.state.routeName as AppRoute]
        : routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TINT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TINT_COLOR,
    activeBackgroundColor: theme.colors.LIGHT_BLUE,
    style: {
      height: 57,
      borderTopColor: '#D4D4D4',
      borderTopWidth: 0.5,
      backgroundColor: '#F8F8F8',
    },
    labelStyle: {
      borderTopColor: 'transparent',
      fontFamily: 'IBMPlexSans-SemiBold',
      fontSize: 7,
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: 8,
    },
    iconStyle: {
      marginTop: 8,
      marginBottom: 8,
    },
  },
});
