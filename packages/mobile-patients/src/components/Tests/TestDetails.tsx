import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getMedicineDetailsApi,
  MedicineProductDetails,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
    sku: string;
    title: string;
    testDetails: TestPackage;
  }> {}
export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  const sku = 'ICA0005'; //props.navigation.getParam('sku');
  const testDetails = props.navigation.getParam('testDetails');

  console.log({ testDetails });

  const TestDetailsDiscription = testDetails.PackageInClussion;
  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
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
          onPressLeftIcon={() => backDataFunctionality()}
          rightComponent={
            <TouchableOpacity onPress={() => props.navigation.navigate(AppRoutes.TestsCart)}>
              <CartIcon style={{}} />
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
          <Text style={styles.testNameStyles}>{testDetails.ItemName}</Text>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Age Group</Text>
            <Text style={styles.personDetailStyles}>
              {(testDetails.FromAgeInDays / 365).toFixed(0)} TO
              {(testDetails.ToAgeInDays / 365).toFixed(0)} YEARS
            </Text>
          </View>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Gender</Text>
            <Text style={styles.personDetailStyles}>
              FOR{' '}
              {testDetails.Gender == 'B'
                ? 'BOYS AND GIRLS'
                : testDetails.Gender == 'M'
                ? 'BOYS'
                : 'GIRLS'}
            </Text>
          </View>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Sample Type</Text>
            <Text style={styles.personDetailStyles}>
              {' '}
              {testDetails.PackageInClussion[0].SampleTypeName}
            </Text>
          </View>
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
        {TestDetailsDiscription.map((item, i) => (
          <View key={i}>
            <Text style={styles.descriptionTextStyles}>
              {i + 1}. {item.TestInclusion}
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
          <Text style={styles.priceText}>Rs. {testDetails.Rate}</Text>
        </View>

        <View style={styles.SeparatorStyle}></View>

        <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 60 }}>
          <Button
            title="ADD TO CART"
            style={{ flex: 1, marginBottom: 16 }}
            onPress={() => props.navigation.navigate(AppRoutes.MedAndTestCart)}
          />
        </View>
      </StickyBottomComponent>
    </SafeAreaView>
  );
};
