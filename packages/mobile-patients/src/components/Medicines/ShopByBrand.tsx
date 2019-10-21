import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Text } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  tabbar: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    ...theme.viewStyles.shadowStyle,
  },
  tab: {
    width: 50,
  },
  indicator: {
    height: 4,
    backgroundColor: theme.colors.APP_GREEN,
  },
  label: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.LIGHT_BLUE,
    // fontWeight: '400',
  },
  headerSearchInputShadow: {
    zIndex: 1,
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

const list = ['A-Derma', 'Accucheck'];
export interface ShopByBrandProps extends NavigationScreenProps {}

export const ShopByBrand: React.FC<ShopByBrandProps> = (props) => {
  const [selectedTab, setselectedTab] = useState<number>(0);
  const [showTabs, setshowTabs] = useState<boolean>(false);
  useEffect(() => {
    setshowTabs(true);
  }, []);

  const routes = [
    { key: 'A', title: 'A' },
    { key: 'B', title: 'B' },
    { key: 'C', title: 'C' },
    { key: 'D', title: 'D' },
    { key: 'E', title: 'E' },
    { key: 'F', title: 'F' },
    { key: 'G', title: 'G' },
    { key: 'H', title: 'H' },
    { key: 'I', title: 'I' },
    { key: 'J', title: 'J' },
    { key: 'K', title: 'K' },
    { key: 'L', title: 'L' },
    { key: 'M', title: 'M' },
    { key: 'N', title: 'N' },
    { key: 'O', title: 'O' },
    { key: 'P', title: 'P' },
    { key: 'Q', title: 'Q' },
    { key: 'R', title: 'R' },
    { key: 'S', title: 'S' },
    { key: 'T', title: 'T' },
    { key: 'U', title: 'U' },
    { key: 'V', title: 'V' },
    { key: 'W', title: 'W' },
    { key: 'X', title: 'X' },
    { key: 'Y', title: 'Y' },
    { key: 'Z', title: 'Z' },
  ];

  const renderHeader = () => {
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={'SHOP BY BRAND'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}></TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };
  const FirstRoute = (props) => {
    console.log(props.route.key, 'props');

    return (
      <View style={[{ backgroundColor: theme.colors.WHITE, flex: 1, paddingVertical: 13 }]}>
        {list.map((name) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 20,
              paddingTop: 15.5,
              paddingBottom: 7.5,
              borderBottomColor: 'rgba(2,71,91, 0.2)',
              borderBottomWidth: 0.5,
            }}
          >
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(16),
                lineHeight: 24,
              }}
            >
              {name}
            </Text>
            <ArrowRight />
          </View>
        ))}
      </View>
    );
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabbar}
      tabStyle={styles.tab}
      labelStyle={styles.label}
    />
  );

  const renderTabs = () => {
    return (
      <TabView
        navigationState={{ index: selectedTab, routes }}
        renderScene={SceneMap({
          A: FirstRoute,
          B: FirstRoute,
          C: FirstRoute,
          D: FirstRoute,
          E: FirstRoute,
          F: FirstRoute,
          G: FirstRoute,
          H: FirstRoute,
          I: FirstRoute,
          J: FirstRoute,
          K: FirstRoute,
          L: FirstRoute,
          M: FirstRoute,
          N: FirstRoute,
          O: FirstRoute,
          P: FirstRoute,
          Q: FirstRoute,
          R: FirstRoute,
          S: FirstRoute,
          T: FirstRoute,
          U: FirstRoute,
          V: FirstRoute,
          W: FirstRoute,
          X: FirstRoute,
          Y: FirstRoute,
          Z: FirstRoute,
        })}
        renderTabBar={renderTabBar}
        onIndexChange={(index) => setselectedTab(index)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>{renderHeader()}</View>
      {showTabs ? renderTabs() : <Spinner />}
    </SafeAreaView>
  );
};
