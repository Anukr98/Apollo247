import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getMedicineDetailsApi,
  MedicineProductDetails,
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
  },
  descriptionTextStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    textAlign: 'left',
    paddingVertical: 20,
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
    title: 'Overview',
    description: '',
  },
  {
    title: 'Tests Included',
    description: '',
  },
  {
    title: 'Preparation',
    description: '',
  },
];

const tabsdescription = [
  {
    id: '1',
    title: 'Overview',
    description:
      'The test is performed to detect the presence of Nicotine and Cotinine in urine. This helps determine whether the patient has used tobacco recently or not. Nicotine has a half-life of 40 minutes and its presence means that the patient has used tobacco recently.',
  },
  {
    id: '2',
    title: 'Overview',
    description: '',
  },
  {
    id: '3',
    title: 'Overview',
    description:
      ' Nicotine has a half-life of 40 minutes and its presence means that the patient has used tobacco recently.',
  },
];
export interface TestDetailsProps
  extends NavigationScreenProps<{
    sku: string;
    title: string;
  }> {}
export const TestDetails: React.FC<TestDetailsProps> = (props) => {
  const [medicineDetails, setmedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const [selectedTab, settabsdescription] = useState<string>(tabs[0].title);
  const sku = 'ICA0005'; //props.navigation.getParam('sku');
  const [apiError, setApiError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        console.log(data);
        setmedicineDetails((data && data.productdp && data.productdp[0]) || {});
        setLoading(false);
      })
      .catch((err) => {
        aphConsole.log('error:' + err);
        setApiError(!!err);
        setLoading(false);
      });
  }, []);

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

  const renderTestDetails = (
    rowData = {
      offPercent: '30 % Off',
      testName: 'Urine Cotinine (Nicotine) Test',
      ageGroup: 'BELOW 7 YEARS',
      actualCost: ' Rs. 165',
      price: 'Rs. 6,500',
      gender: 'FOR BOYS AND GIRLS',
      test: '8',
      address: 'Apollo Hospitals, Jubilee Hills',
      status: 'REMOVE FROM CART',
      SampleType: 'URINE',
      CollectionMethod: 'HOME VISIT OR CLINIC VISIT',
    }
  ) => {
    return (
      <View style={{ overflow: 'hidden', padding: 20 }}>
        <View>
          <Text style={styles.testNameStyles}>{rowData.testName}</Text>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Age Group</Text>
            <Text style={styles.personDetailStyles}> {rowData.ageGroup}</Text>
          </View>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Gender</Text>
            <Text style={styles.personDetailStyles}> {rowData.gender}</Text>
          </View>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Sample Type</Text>
            <Text style={styles.personDetailStyles}> {rowData.SampleType}</Text>
          </View>
          <View style={styles.personDetailsView}>
            <Text style={styles.personDetailLabelStyles}>Collection Method</Text>
            <Text style={styles.personDetailStyles}> {rowData.CollectionMethod}</Text>
          </View>
        </View>
      </View>
    );
    return null;
  };

  const renderTabsData = () => {
    console.log(tabsdescription);
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: '#f7f8f5',
          }}
          height={44}
          data={tabs}
          onChange={(selectedTab: string) => settabsdescription(selectedTab)}
          selectedTab={selectedTab}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
        <View style={styles.descriptionStyles}>
          <Text style={styles.descriptionTextStyles}>
            The test is performed to detect the presence of Nicotine and Cotinine in urine. This
            helps determine whether the patient has used tobacco recently or not. Nicotine has a
            half-life of 40 minutes and its presence means that the patient has used tobacco
            recently.
          </Text>
        </View>
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
      </ScrollView>
      <StickyBottomComponent defaultBG style={styles.container}>
        <View style={{ marginBottom: 11, alignItems: 'flex-end' }}>
          <Text style={styles.priceText}>Rs. 6,500</Text>
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
