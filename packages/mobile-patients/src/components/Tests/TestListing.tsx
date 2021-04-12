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
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image as ImageNative,
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

export interface TestListingProps
  extends NavigationScreenProps<{
    movedFrom?: string;
    data?: any;
    cityId?: string | number;
    widgetName?: string;
  }> {}

export const TestListing: React.FC<TestListingProps> = (props) => {
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
  const [loading, setLoading] = useState<boolean>(true);

  const errorStates = !loading && widgetsData?.length == 0;
  let deepLinkWidgetName: String;

  //handle deeplinks as well here.
  useEffect(() => {
    setLoading?.(true);
    if (!!movedFrom) {
      if (movedFrom === 'deeplink' && !!widgetName) {
        let pageName;
        pageName = widgetName?.split('-');
        if (pageName?.[0] == 'home' || pageName?.[0] == 'listing') {
          pageName?.shift();
        }
        deepLinkWidgetName = pageName?.join(' ');
        fetchWidgets(widgetName!);
      } else if (!!title) {
        fetchWidgets(title);
      } else {
        renderErrorMessage();
        setLoading?.(false);
      }
    } else {
      setLoading?.(false);
    }
  }, [movedFrom]);

  const fetchWidgets = async (title: string) => {
    const createTitle = title?.replace(/ /g, '-')?.toLowerCase();
    const widgetName = movedFrom == AppRoutes.Tests ? `home-${createTitle}` : `${createTitle}`;
    try {
      const result: any = await getDiagnosticListingWidget('diagnostic-list', widgetName);
      if (result?.data?.success && result?.data?.data?.diagnosticWidgetData?.length > 0) {
        const getWidgetsData = result?.data?.data;
        fetchWidgetsPrices(getWidgetsData);
      } else {
        setWidgetsData([]);
        setLoading?.(false);
      }
    } catch (error) {
      CommonBugFender('fetchWidgets_TestListing', error);
      setWidgetsData([]);
      setLoading?.(false);
    }
  };

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
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
    const itemIds = widgetsData?.diagnosticWidgetData?.map((item: any) => Number(item?.itemId));

    const res = Promise.all(
      itemIds?.map((item: any) => fetchPricesForCityId(Number(cityId) || 9, item))
    );

    try {
      const response = (await res).map((item: any) =>
        g(item, 'data', 'findDiagnosticsWidgetsPricing', 'diagnostics')
      );

      let newWidgetsData = widgetsData;

      for (let i = 0; i < newWidgetsData?.diagnosticWidgetData?.length; i++) {
        const findIndex = newWidgetsData?.diagnosticWidgetData?.findIndex(
          (item: any) => Number(item?.itemId) === Number(response?.[i]?.[0]?.itemId)
        );
        if (findIndex !== -1) {
          (newWidgetsData.diagnosticWidgetData[findIndex].packageCalculatedMrp =
            response?.[i]?.[0]?.packageCalculatedMrp),
            (newWidgetsData.diagnosticWidgetData[findIndex].diagnosticPricing =
              response?.[i]?.[0]?.diagnosticPricing);
        }
      }

      setWidgetsData(newWidgetsData);
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('errorInFetchPricing api__Tests', error);
      setLoading?.(false);
    }
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
    if (!!movedFrom) {
      if (movedFrom == AppRoutes.Tests) {
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
            props.navigation.navigate(AppRoutes.SearchTestScene);
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
        title:
          movedFrom === 'deeplink' && !!widgetName
            ? nameFormater(deepLinkWidgetName?.replace(/-/g, ' '), 'title')
            : nameFormater(title, 'title'),
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
    if (errorStates)
      return (
        <View style={{ justifyContent: 'center' }}>
          <Card
            cardContainer={[styles.noDataCard]}
            heading={string.common.uhOh}
            description={string.common.somethingWentWrong}
            descriptionTextStyle={{ fontSize: 14 }}
            headingTextStyle={{ fontSize: 14 }}
          />
        </View>
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
    const actualItemsToShow = widgetsData?.diagnosticWidgetData?.filter(
      (item: any) => item?.diagnosticPricing
    );
    return (
      <>
        {!!actualItemsToShow && actualItemsToShow?.length > 0 ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.headingText}>
              {deepLinkWidgetName! || widgetsData?.diagnosticWidgetTitle}{' '}
              {actualItemsToShow?.length > 0 && (
                <Text style={styles.itemCountText}>({actualItemsToShow?.length})</Text>
              )}
            </Text>
            {widgetsData?.diagnosticWidgetType == 'Package' ? (
              <PackageCard
                data={widgetsData}
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
                data={widgetsData}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={true}
                columns={2}
                navigation={props.navigation}
                source={'Listing'}
                sourceScreen={AppRoutes.TestListing}
              />
            )}
          </View>
        ) : null}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderHeader()}
        {!errorStates ? renderBreadCrumb() : null}
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
});
