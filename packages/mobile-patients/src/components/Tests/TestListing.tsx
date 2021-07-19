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
import { SafeAreaView, StyleSheet, Text, View, Image as ImageNative, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
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
import {
  navigateToHome,
  navigateToScreenWithEmptyStack,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface TestListingProps
  extends NavigationScreenProps<{
    movedFrom?: string;
    data?: any;
    cityId?: string | number;
    widgetName?: string;
  }> {}

export const TestListing: React.FC<TestListingProps> = (props) => {
  const {
    setTestListingBreadCrumbs,
    testListingBreadCrumbs,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();

  const { isDiagnosticLocationServiceable } = useAppCommonData();

  const movedFrom = props.navigation.getParam('movedFrom');
  const dataFromHomePage = props.navigation.getParam('data');
  const widgetName = props.navigation.getParam('widgetName');
  const cityId = props.navigation.getParam('cityId');
  const title = dataFromHomePage?.diagnosticWidgetTitle;
  const widgetType = dataFromHomePage?.diagnosticWidgetType;
  const [showLoadMore, setShowLoadMore] = useState<boolean>(false);
  const limit = 10;
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [testLength, setTestLength] = useState<number>(limit)
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
      } else if (!!widgetName) {
        fetchWidgets(widgetName);
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
    const createTitle = title
      ?.trim()
      ?.replace(/ /g, '-')
      ?.toLowerCase();
    let widgetName = movedFrom == AppRoutes.Tests ? `home-${createTitle}` : `${createTitle}`;
    if (widgetType == 'Category' || widgetType == 'Category_Scroll') {
      widgetName = createTitle.toLowerCase();
    }
    try {
      const result: any = await getDiagnosticListingWidget('diagnostic-list', widgetName);
      if (result?.data?.success && result?.data?.data?.diagnosticWidgetData?.length > 0) {
        const getWidgetsData = result?.data?.data;
        setWidgetsData(getWidgetsData);
        setLoading?.(false);
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
  useEffect(() => {
    fetchWidgetsPrices(widgetsData);
  }, [widgetsData])

  useEffect(() => {
    setWidgetsData(widgetsData)
  }, [loading])

  console.log('loading :>> ',loading);
 
  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  //add try catch.
  const fetchWidgetsPrices = async (widgetsData: any) => {
    const itemIds = widgetsData?.diagnosticWidgetData?.map((item: any) => Number(item?.itemId));

    const res = Promise.all(
      itemIds?.map((item: any) =>
        fetchPricesForCityId(
          Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
          item
        )
      )
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
      navigateToHome(props.navigation);
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
            navigateToScreenWithEmptyStack(props.navigation, 'TESTS');
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
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TestsCart);
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
      if (widgetType == 'Category' || widgetType == 'Category_Scroll') {
        breadcrumb.push({
          title: !!widgetName ? nameFormater(widgetName, 'default') : '',
          onPress: () => {},
        });
      }
      setTestListingBreadCrumbs && setTestListingBreadCrumbs(breadcrumb);
    }
  }, [movedFrom]);

  const renderHeader = () => {
    const heading =
      widgetType == 'Category' || widgetType == 'Category_Scroll' ? widgetName : title;
    return (
      <TestListingHeader
        navigation={props.navigation}
        headerText={nameFormater(heading, 'upper')}
      />
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
  const renderLoadMore = () => {
    return (
      <View
        style={styles.loadMoreView}
      >
       <ActivityIndicator color="green" size="small" />
          <Text style={styles.loadingMoreProducts}>Hold on, loading more products.</Text>
      </View>
    );
  };
  const loadMoreFuction = () => {
    if (widgetsData?.diagnosticWidgetData?.length > limit * currentOffset) {
      setTestLength(widgetsData?.diagnosticWidgetData?.length)
    } else {
      setTestLength(limit * currentOffset)
    }
    setShowLoadMore(false)
  }

  const onEndReached = () => {
    setCurrentOffset(currentOffset + 1);
    setShowLoadMore(true);
    loadMoreFuction();
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
    // const actualItemsToShow = widgetsData?.diagnosticWidgetData?.filter(
    //   (item: any) => item?.diagnosticPricing
    // );
    const actualItemsToShow = widgetsData?.diagnosticWidgetData;
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
                source={'Listing page'}
                sourceScreen={AppRoutes.TestListing}
              />
            ) : (
              <ItemCard
                data={widgetsData}
                diagnosticWidgetData={widgetsData?.diagnosticWidgetData?.slice(
                  0,
                  widgetsData?.diagnosticWidgetData < limit
                    ? widgetsData?.diagnosticWidgetData
                    : testLength
                )}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={true}
                columns={2}
                onEndReached={testLength == widgetsData?.diagnosticWidgetData?.length ? null : onEndReached}
                navigation={props.navigation}
                source={'Listing page'}
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
        {showLoadMore ? renderLoadMore() : null}
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
  loadMoreView: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  textLoadMore: {
    ...theme.viewStyles.text('SB', 15, '#FC9916'),
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  downArrow: {
    alignSelf: 'flex-end',
  },
  loadingMoreProducts: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    padding: 12,
    textAlign: 'center',
  },
});
