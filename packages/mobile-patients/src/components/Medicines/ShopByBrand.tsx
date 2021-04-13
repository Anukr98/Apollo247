import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Brand, getAllBrands } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
  const allBrandData: Brand[] = props.navigation.getParam('allBrandData');
  const setAllBrandData: (args0: Brand[]) => void = props.navigation.getParam('setAllBrandData');
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [allBrands, setallBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (allBrandData.length > 0) {
      setallBrands(allBrandData);
      setshowSpinner(false);
    } else {
      fetchAllBrands();
    }
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBack);
    };
  }, []);

  const onPressHardwareBack = () => props.navigation.goBack();

  const fetchAllBrands = () => {
    getAllBrands()
      .then((res) => {
        if (res && res.data && res.data.brands) {
          setallBrands(res.data.brands);
          setAllBrandData(res.data.brands);
        }
      })
      .catch((err) => {
        CommonBugFender('ShopByBrand_getAllBrands', err);
      })
      .finally(() => {
        setshowSpinner(false);
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

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Card
          cardContainer={{ marginTop: 0 }}
          heading={'Uh oh! :('}
          description={'No data Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const renderData = () => {
    const filteredBrands = allBrands.filter((brand) =>
      brand.title.toLowerCase().startsWith(selectedTab.toLowerCase())
    );
    return (
      <View style={[{ backgroundColor: theme.colors.WHITE, flex: 1, marginTop: 50 }]}>
        {filteredBrands.length ? (
          <ScrollView
            bounces={false}
            contentContainerStyle={{
              paddingVertical: 13,
            }}
          >
            <FlatList
              bounces={false}
              data={filteredBrands}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={1}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    paddingTop: 15.5,
                    paddingBottom: 7.5,
                    borderBottomColor: 'rgba(2,71,91, 0.2)',
                    borderBottomWidth: 0.5,
                  }}
                  activeOpacity={1}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ShopByBrand, 'Naviagte to search by brand view');
                    props.navigation.navigate(AppRoutes.MedicineListing, {
                      title: item.title,
                      category_id: item.category_id,
                    });
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.SHERPA_BLUE,
                      ...theme.fonts.IBMPlexSansMedium(16),
                      lineHeight: 24,
                    }}
                  >
                    {item.title}
                  </Text>
                  <ArrowRight />
                </TouchableOpacity>
              )}
              keyExtractor={(_, index) => index.toString()}
              numColumns={1}
            />
          </ScrollView>
        ) : (
          renderEmptyData()
        )}
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
        {renderData()}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <View style={styles.headerSearchInputShadow}>{renderHeader()}</View>
        {!showSpinner && renderTabs()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
