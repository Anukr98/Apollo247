import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID } from '@aph/mobile-patients/src/graphql/profiles';

import { g, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image as ImageNative,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';

import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';

import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';

import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';

import { TestListingHeader } from './components/TestListingHeader';
import { Breadcrumb } from '../MedicineListing/Breadcrumb';

export interface TestListingProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
    comingFrom?: string;
    data: any;
  }> {}

export const TestListing: React.FC<TestListingProps> = (props) => {
  const {
    cartItems,
    setTestListingBreadCrumbs,
    testListingBreadCrumbs,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();

  const {
    diagnosticServiceabilityData,

    isDiagnosticLocationServiceable,
  } = useAppCommonData();

  const movedFrom = props.navigation.getParam('comingFrom');
  const dataFromHomePage = props.navigation.getParam('data');
  const title = dataFromHomePage?.diagnosticWidgetTitle;
  const client = useApolloClient();

  const [widgetsData, setWidgetsData] = useState([] as any);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!!dataFromHomePage) {
      fetchWidgetsPrices(dataFromHomePage?.diagnosticWidgetData);
    } else {
      renderErrorMessage();
    }
  }, []);

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || 9,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  const fetchWidgetsPrices = async (widgetsData: any) => {
    const itemIds = widgetsData?.map((item: any) => Number(item?.itemId));

    const res = Promise.all(
      itemIds?.map((item: any) =>
        fetchPricesForCityId(Number(diagnosticServiceabilityData?.cityId!) || 9, item)
      )
    );

    const response = (await res).map((item: any) =>
      g(item, 'data', 'findDiagnosticsByItemIDsAndCityID', 'diagnostics')
    );

    console.log({ response });
    let newWidgetsData = [...widgetsData];
    console.log({ newWidgetsData });

    for (let i = 0; i < newWidgetsData?.length; i++) {
      const findIndex = newWidgetsData?.findIndex(
        (item: any) => Number(item?.itemId) == Number(response?.[i]?.[0]?.itemId)
      );
      if (findIndex !== -1) {
        (newWidgetsData[findIndex].packageCalculatedMrp = response?.[i]?.[0]?.packageCalculatedMrp),
          (newWidgetsData[findIndex].diagnosticPricing = response?.[i]?.[0]?.diagnosticPricing);
      }
    }
    setWidgetsData(newWidgetsData);
    setLoading!(false);
  };

  const homeBreadCrumb: TestBreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      });
      props.navigation.dispatch(resetAction);
    },
  };

  useEffect(() => {
    let breadcrumb: TestBreadcrumbLink[] = [homeBreadCrumb];
    console.log({ breadcrumb });
    if (!!movedFrom) {
      if (
        //create enum
        movedFrom == 'Home Page'
      ) {
        breadcrumb.push({
          title: 'Order Tests',
          onPress: () => {
            props.navigation.navigate('TESTS');
          },
        });
      }
      if (movedFrom === AppRoutes.SearchTestScene) {
        breadcrumb.push({
          title: 'Order Tests',
          onPress: () => {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'TESTS' })],
            });
            props.navigation.dispatch(resetAction);
          },
        });
        breadcrumb.push({
          title: 'Test Search',
          onPress: () => {
            // props.navigation.navigate(AppRoutes.MedicineListing);
          },
        });
      }
      if (movedFrom === AppRoutes.TestsCart) {
        breadcrumb.push({
          title: 'Cart',
          onPress: () => {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.TestsCart })],
            });
            props.navigation.dispatch(resetAction);
          },
        });
      }
      breadcrumb.push({
        title: title,
        onPress: () => {},
      });
      setTestListingBreadCrumbs && setTestListingBreadCrumbs(breadcrumb);
    }
  }, [movedFrom]);

  const renderHeader = () => {
    return (
      <TestListingHeader navigation={props.navigation} headerText={nameFormater(title, 'upper')} />
    );
  };

  const renderErrorMessage = () => {
    if (
      !loading &&
      (dataFromHomePage == null || dataFromHomePage == undefined || widgetsData?.length == 0)
    )
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'Something went wrong.'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
  };

  const renderBreadCrumb = () => {
    return (
      <View style={{ marginLeft: 20 }}>
        <Breadcrumb
          links={testListingBreadCrumbs!}
          containerStyle={{ borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}
        />
      </View>
    );
  };

  const renderList = () => {
    return (
      <>
        <Text style={styles.headingText}>
          {dataFromHomePage?.diagnosticWidgetTitle}{' '}
          <Text style={styles.itemCountText}>
            ({dataFromHomePage?.diagnosticWidgetData?.length})
          </Text>{' '}
        </Text>
        {dataFromHomePage?.diagnosticWidgetType == 'Package' ? (
          <PackageCard
            data={dataFromHomePage}
            isCircleSubscribed={isDiagnosticCircleSubscription}
            isServiceable={isDiagnosticLocationServiceable}
            isVertical={true}
            columns={1}
            navigation={props.navigation}
            source={'Listing'}
            sourceScreen={AppRoutes.TestListing}
          />
        ) : (
          <ItemCard
            data={dataFromHomePage}
            isCircleSubscribed={isDiagnosticCircleSubscription}
            isServiceable={isDiagnosticLocationServiceable}
            isVertical={true}
            columns={2}
            navigation={props.navigation}
            source={'Listing'}
            sourceScreen={AppRoutes.TestListing}
          />
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderHeader()}
        {renderBreadCrumb()}
        <View style={{ flex: 1 }}>
          <ScrollView
            removeClippedSubviews={true}
            bounces={false}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {renderList()}
          </ScrollView>
        </View>
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
});
