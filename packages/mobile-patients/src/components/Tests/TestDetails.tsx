import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { getPackageData, TestPackage } from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const { height } = Dimensions.get('window');
const styles = StyleSheet.create({
  testNameStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(20),
    lineHeight: 24,
    color: theme.colors.SEARCH_DOCTOR_NAME,
    marginTop: 4,
    marginBottom: 4,
  },
  personDetailLabelStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    letterSpacing: 0.25,
  },
  personDetailStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginTop: 4,
  },
  personDetailsView: {
    marginTop: 6,
  },
  ageGroupStyles: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#02475b',
    opacity: 0.6,
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 0.02,
  },
  descriptionStyles: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 20,
  },
  descriptionTextStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    textAlign: 'left',
    lineHeight: 22,
  },
  priceText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    letterSpacing: 0.35,
  },
  SeparatorStyle: {
    ...theme.viewStyles.lightSeparatorStyle,
    opacity: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: height === 812 || height === 896 ? 120 : 110,
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
});

const tabs = [
  {
    id: '1',
    title: 'Tests Included',
  },
  {
    id: '2',
    title: 'Preparation',
  },
];
export interface TestDetailsProps
  extends NavigationScreenProps<{
    testDetails: TestPackage;
    itemid: string;
  }> {}

export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  const testDetails = props.navigation.getParam('testDetails');
  console.log({ testDetails });

  const [testInfo, setTestInfo] = useState<TestPackage>(testDetails);

  const TestDetailsDiscription = testInfo.PackageInClussion;
  aphConsole.log('....' + TestDetailsDiscription);
  const { cartItems, addCartItem, removeCartItem } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length;

  const [PackageData, setPackageData] = useState<TestPackage>({} as any);
  const currentItemId = testInfo.ItemID;
  aphConsole.log('currentItemId : ' + currentItemId);

  useEffect(() => {
    !TestDetailsDiscription &&
      getPackageData(currentItemId)
        .then(({ data }) => {
          aphConsole.log('getPackageData \n', { data });
          // const _data = g(data, 'data') || [];
          aphConsole.log(JSON.stringify(data.data));
          setTestInfo({ ...testInfo, PackageInClussion: data.data || [] });

          aphConsole.log('TestDetailsDiscription :....');
          // setPackageData({ PackageInClussion: _data, ItemID: currentItemId } as TestPackage);
        })
        .catch((e) => {
          aphConsole.log('getPackageData Error \n', { e });
        });
  }, []);

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          title={'TEST DETAIL'}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
          rightComponent={
            <TouchableOpacity onPress={() => props.navigation.navigate(AppRoutes.TestsCart)}>
              <CartIcon style={{}} />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
          }
        />
      </View>
    );
  };

  const renderTestDetails = () => {
    return (
      <View style={{ overflow: 'hidden', padding: 20 }}>
        <View>
          <Text style={styles.testNameStyles}>{testInfo.ItemName}</Text>
          {!!testInfo.FromAgeInDays && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Age Group</Text>
              <Text style={styles.personDetailStyles}>
                {(testInfo.FromAgeInDays / 365).toFixed(0)} TO
                {(testInfo.ToAgeInDays / 365).toFixed(0)} YEARS
              </Text>
            </View>
          )}

          {!!testInfo.Gender && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Gender</Text>
              <Text style={styles.personDetailStyles}>
                FOR{' '}
                {testInfo.Gender == 'B'
                  ? 'BOYS AND GIRLS'
                  : testInfo.Gender == 'M'
                  ? 'BOYS'
                  : 'GIRLS'}
              </Text>
            </View>
          )}
          {!!testDetails.PackageInClussion && (
            <View style={styles.personDetailsView}>
              <Text style={styles.personDetailLabelStyles}>Sample Type</Text>
              <Text style={styles.personDetailStyles}>
                {testInfo.PackageInClussion.map((item) => item.SampleTypeName)
                  .filter((i) => i)
                  .filter((i, idx, array) => array.indexOf(i) >= idx)
                  .join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Collection Method</Text>
            <Text style={styles.personDetailStyles}> HOME VISIT OR CLINIC VISIT</Text>
          </View>
        </View>
      </View>
    );
    return null;
  };

  const renderTabsData = () => {
    console.log(tabs);
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: '#f7f8f5',
          }}
          height={44}
          data={tabs}
          onChange={(selectedTab: string) => setSelectedTab(selectedTab)}
          selectedTab={selectedTab}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
      </View>
    );
  };

  const renderTestsIncludedData = () => {
    return (
      <View style={styles.descriptionStyles}>
        {testInfo.PackageInClussion.map((item, i) => (
          <View key={i}>
            <Text style={styles.descriptionTextStyles}>
              {i + 1}. {item.TestInclusion || item.TestName}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPreparation = () => {
    return (
      <View style={styles.descriptionStyles}>
        {/* {TestDetailsDiscription.map((item, i) => (
          <View key={i}> */}
        <Text style={styles.descriptionTextStyles}>
          {/* {i + 1}. {item.TestParameters} */}
          No Data
        </Text>
        {/* </View> */}
        {/* ))} */}
      </View>
    );
  };

  const isAddedToCart = !!cartItems.find((item) => item.id == testInfo.ItemID);
  console.log('isAddedToCart' + isAddedToCart);

  if (!TestDetailsDiscription) {
    return null;
  } else {
    return (
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderHeader()}
        <ScrollView bounces={false} keyboardDismissMode="on-drag">
          <View>{renderTestDetails()}</View>
          {renderTabsData()}
          {selectedTab === tabs[0].title ? renderTestsIncludedData() : renderPreparation()}
        </ScrollView>
        <StickyBottomComponent defaultBG style={styles.container}>
          <View style={{ marginBottom: 11, alignItems: 'flex-end' }}>
            <Text style={styles.priceText}>Rs. {testInfo.Rate}</Text>
          </View>

          <View style={styles.SeparatorStyle}></View>

          <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 60 }}>
            <Button
              title={!isAddedToCart ? 'ADD TO CART' : 'ADDED TO CART'}
              disabled={!isAddedToCart ? false : true}
              style={{ flex: 1, marginBottom: 16 }}
              onPress={() =>
                addCartItem!({
                  id: testInfo.ItemID,
                  name: testInfo.ItemName,
                  mou: `${testInfo.PackageInClussion.length}`,
                  price: testInfo.Rate,
                  thumbnail: '',
                  specialPrice: undefined,
                })
              }
            />
          </View>
        </StickyBottomComponent>
      </SafeAreaView>
    );
  }
};
