import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { YourOrdersTest } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/YourOrdersTests';

interface MyOrdersScreenProps extends NavigationScreenProps<{}> {}
const MyOrdersScreen: FC<MyOrdersScreenProps> = (props) => {
  const tabs = [{ title: 'Pharmacy Orders' }, { title: 'Diagnostic Orders' }];
  const [selectedTabFromParams,setSelectedTabFromParams] = useState<number>(props?.navigation?.getParam("tabSelected") | 0)
  const [selectedTab, setSelectedTab] = useState<string>(tabs[selectedTabFromParams].title);

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'MY ORDERS'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MyOrdersScreen, 'Go back clicked');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderTabSwitch = () => {
    return (
      <TabsComponent
        height={44}
        titleStyle={{ fontSize: 14 }}
        selectedTitleStyle={{ fontSize: 14 }}
        style={styles.tabsStyle}
        tabViewStyle={{
          backgroundColor: colors.CARD_BG,
        }}
        data={tabs}
        onChange={(selectedTab: string) => {
          setSelectedTab(selectedTab);
        }}
        selectedTab={selectedTab}
      />
    );
  };

  const getPaymentsList = () => {
    if (selectedTab == 'Pharmacy Orders') {
      return <YourOrdersScene navigation={props.navigation} showHeader={false} />;
    } else {
      return <YourOrdersTest navigation={props.navigation} showHeader={false} />;
    }
  };
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderTabSwitch()}
        {getPaymentsList()}
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    borderBottomWidth: 0,
  },
  tabsStyle: {
    borderRadius: 0,
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default MyOrdersScreen;
