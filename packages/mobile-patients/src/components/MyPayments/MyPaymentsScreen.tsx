/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { TabsComponent } from '../ui/TabsComponent';
import { colors } from '../../theme/colors';

interface MyPaymentsScreenProps extends NavigationScreenProps<{}> {}
const MyPaymentsScreen: FC<MyPaymentsScreenProps> = (props) => {
  const tabs = [{ title: 'Consult Payments' }, { title: 'Pharmacy Payments' }];
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  useEffect(() => {}, []);

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'MY PAYMENTS'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.MyPaymentsScreen, 'Go back clicked');
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
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {renderTabSwitch()}
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

export default MyPaymentsScreen;
