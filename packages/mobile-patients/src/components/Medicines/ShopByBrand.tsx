import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-elements';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { getAllBrands } from '@aph/mobile-patients/src/helpers/apiCalls';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
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
  const alphabets = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  const tabs = alphabets.map((letter) => ({ title: letter }));

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [showTabs, setshowTabs] = useState<boolean>(false);

  useEffect(() => {
    setshowTabs(true);
    fetchAllBrands();
  }, []);

  const fetchAllBrands = () => {
    getAllBrands()
      .then((res) => {
        console.log(res, 'fetchAllBrands');
      })
      .catch((err) => {
        console.log(err, 'errr');
      });
  };

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

  const renderTabComponent = () => {
    return (
      <View
        style={[
          { backgroundColor: theme.colors.WHITE, flex: 1, paddingVertical: 13, marginTop: 50 },
        ]}
      >
        <ScrollView bounces={false}>
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
        </ScrollView>
      </View>
    );
  };

  const renderTabs = () => {
    return (
      <View style={{ flex: 1 }}>
        <TabsComponent
          style={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            // height: 54,
            zIndex: 10,
            elevation: 10,
          }}
          data={tabs}
          selectedTab={selectedTab}
          onChange={(selectedTab) => setselectedTab(selectedTab)}
          scrollable={true}
          tabViewStyle={{ width: 'auto' }}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
        {renderTabComponent()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>{renderHeader()}</View>
      {showTabs ? renderTabs() : <Spinner />}
    </SafeAreaView>
  );
};
