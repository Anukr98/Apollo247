import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { GET_WIDGETS_PRICING_BY_ITEMID_CITYID } from '@aph/mobile-patients/src/graphql/profiles';

import { g, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image as ImageNative,
  Image,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import { getDiagnosticListingWidget } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
export interface TestWidgetListingProps
  extends NavigationScreenProps<{
    movedFrom?: string;
    data?: any;
    cityId?: string | number;
    widgetName?: string;
  }> {}

export const TestWidgetListing: React.FC<TestWidgetListingProps> = (props) => {
  const {
    cartItems,
    setTestListingBreadCrumbs,
    testListingBreadCrumbs,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();

  const { diagnosticServiceabilityData, isDiagnosticLocationServiceable } = useAppCommonData();

  const movedFrom = props.navigation.getParam('movedFrom');
  const dataFromHomePage = props.navigation.getParam('data');
  const widgetName = props.navigation.getParam('widgetName');
  const cityId = props.navigation.getParam('cityId');
  const title = dataFromHomePage?.diagnosticWidgetTitle;
  const client = useApolloClient();

  const [widgetsData, setWidgetsData] = useState([] as any);
  const [loading, setLoading] = useState<boolean>(false);

  const [serviceableObject, setServiceableObject] = useState({} as any);
  Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object;
  const renderHeader = () => {
    return (
      <TestListingHeader navigation={props.navigation} headerText={nameFormater(title, 'upper')} />
    );
  };

  const renderItems = (item: any, index: number) => {
    return (
      <TouchableOpacity
        style={styles.gridPart}
        onPress={() => {
          {
            props.navigation.navigate(AppRoutes.TestListing, {
              widgetName: item?.itemTitle,
              movedFrom: AppRoutes.Tests,
              data: dataFromHomePage,
              cityId: serviceableObject?.cityId || diagnosticServiceabilityData?.cityId,
            });
          }
        }}
      >
        <View style={styles.circleView}>
          <Image resizeMode={'contain'} style={styles.image} source={{ uri: item.itemIcon }} />
        </View>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.textStyle}>
          {nameFormater(item?.itemTitle, 'default')}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderList = () => {
    return (
      <>
        <View style={styles.gridConatiner}>
          <FlatList
            data={dataFromHomePage?.diagnosticWidgetData}
            numColumns={4}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item, index }) => renderItems(item, index)}
          />
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderHeader()}
        <View style={{ flex: 1, marginBottom: '5%' }}>{renderList()}</View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  headingText: {
    marginTop: '3%',
    marginLeft: 20,
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 21, 0),
    marginBottom: '3%',
  },
  itemCountText: {
    marginTop: '3%',
    marginVertical: 5,
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE, 1, 19, 0),
  },
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  sectionView: {
    margin: 10,
    flexDirection: 'row',
  },
  container: {
    marginTop: 20,
  },
  gridConatiner: {
    width: '100%',
    backgroundColor: 'white',
    marginVertical: 20,
  },
  circleView: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: 30,
    height: 30,
    backgroundColor: '#f9f9f9',
  },
  gridPart: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    borderColor: '#E8E8E8',
    borderWidth: 0.5,
    padding: 15,
  },
  textStyle: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 20, 0),
    paddingVertical: 5,
    textAlign: 'center',
  },
});
