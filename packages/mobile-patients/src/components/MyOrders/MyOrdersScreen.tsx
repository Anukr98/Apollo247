import React, { FC, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { YourOrdersTest } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/YourOrdersTests';
import { AppConfig } from '../../strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface MyOrdersScreenProps extends NavigationScreenProps<{}> {}
const MyOrdersScreen: FC<MyOrdersScreenProps> = (props) => {
  const tabs = [{ title: 'Pharmacy Orders' }, { title: 'Diagnostic Orders' }];
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  const [showHelpCTA, setShowHelpCTA] = useState<boolean>(true);

  const onPressHelp = () => {
    const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
    props.navigation.navigate(AppRoutes.NeedHelpPharmacyOrder, {
      queryIdLevel1: helpSectionQueryId.pharmacy,
      sourcePage: 'My Orders',
    });
  };

  const renderHeaderRightComponent = () => {
    return showHelpCTA ? (
      <TouchableOpacity
        activeOpacity={1}
        style={{ paddingLeft: 10 }}
        onPress={() => {
          onPressHelp();
        }}
      >
        <Text style={styles.helpTextStyle}>{string.help.toUpperCase()}</Text>
      </TouchableOpacity>
    ) : null;
  };

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
        rightComponent={renderHeaderRightComponent()}
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
          if (selectedTab === tabs[1].title) {
            setShowHelpCTA(false);
          } else {
            setShowHelpCTA(true);
          }
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
  helpTextStyle: { ...theme.viewStyles.text('B', 13, '#FC9916', 1, 24) },
});

export default MyOrdersScreen;
