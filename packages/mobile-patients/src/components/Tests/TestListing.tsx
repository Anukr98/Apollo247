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
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image as ImageNative,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import ItemCard from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import PackageCard from '@aph/mobile-patients/src/components/Tests/components/PackageCard';

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
import { DiagnosticProductListingPageViewed } from './Events';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import { CALL_TO_ORDER_CTA_PAGE_ID } from '@aph/mobile-patients/src/graphql/types/globalTypes';

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

  const { isDiagnosticLocationServiceable, diagnosticServiceabilityData } = useAppCommonData();

  const movedFrom = props.navigation.getParam('movedFrom');
  const dataFromHomePage = props.navigation.getParam('data');
  const widgetName = props.navigation.getParam('widgetName');
  const cityId = props.navigation.getParam('cityId');
  const title = dataFromHomePage?.diagnosticWidgetTitle;
  const widgetType = dataFromHomePage?.diagnosticWidgetType;
  const [showLoadMore, setShowLoadMore] = useState<boolean>(false);
  const limit = 10;
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [testLength, setTestLength] = useState<number>(limit);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const client = useApolloClient();

  const [widgetsData, setWidgetsData] = useState([] as any);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(false);
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER;
  const ctaDetailArray = callToOrderDetails?.ctaDetailsOnCityId;
  const isCtaDetailDefault = callToOrderDetails?.ctaDetailsDefault?.ctaProductPageArray?.includes(
    CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING
  );
  const ctaDetailMatched = ctaDetailArray?.filter((item: any) => {
    if (item?.ctaCityId == cityId) {
      if (item?.ctaProductPageArray?.includes(CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING)) {
        return item;
      } else {
        return null;
      }
    } else if (isCtaDetailDefault) {
      return callToOrderDetails?.ctaDetailsDefault;
    } else {
      return null;
    }
  });
  const errorStates = !loading && widgetsData?.length == 0;
  let deepLinkWidgetName: string;

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
    const createTitle = decodeURIComponent(title)
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
        setError(true);
      }
    } catch (error) {
      CommonBugFender('fetchWidgets_TestListing', error);
      setWidgetsData([]);
      setLoading?.(false);
      setError(true);
    }
  };
  useEffect(() => {
    fetchWidgetsPrices(widgetsData);
  }, [widgetsData?.diagnosticWidgetData?.[0]]);

  useEffect(() => {
    fetchWidgetsPrices(widgetsData);
  }, [widgetsData?.diagnosticWidgetData?.[0]]);

  useEffect(() => {
    fetchWidgetsPrices(widgetsData);
  }, [widgetsData?.diagnosticWidgetData?.[0]]);

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID:
          movedFrom == 'deeplink'
            ? (!!diagnosticServiceabilityData &&
                Number(
                  diagnosticServiceabilityData?.cityId ||
                    AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
                )) ||
              AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
            : Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    let source = movedFrom == 'Tests' ? '247 Home' : movedFrom == 'deeplink' ? 'Deeplink' : '';
    DiagnosticProductListingPageViewed(widgetType, source, widgetName!, title);
  }, []);

  const fetchWidgetsPrices = async (widgetsData: any) => {
    const itemIds = widgetsData?.diagnosticWidgetData?.map((item: any) => Number(item?.itemId));
    setLoading?.(true);
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
      setIsPriceAvailable(true);
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
            navigateToScreenWithEmptyStack(props.navigation, AppRoutes.AddPatients);
          },
        });
      }
      breadcrumb.push({
        title:
          movedFrom === 'deeplink' && !!widgetName
            ? nameFormater(decodeURIComponent(deepLinkWidgetName?.replace(/-/g, ' ')), 'title')
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
  const renderEmptyMessage = () => {
    return (
      <View style={styles.emptyContainer}>
        <Card
          cardContainer={[styles.noDataCardEmpty]}
          heading={string.common.uhOh}
          description={string.common.noDiagnosticsAvailable}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };
  const renderLoadMore = () => {
    return (
      <View style={styles.loadMoreView}>
        <ActivityIndicator color="green" size="small" />
        <Text style={styles.loadingMoreProducts}>Hold on, loading more products.</Text>
      </View>
    );
  };
  let countDown: any;
  const loadMoreFuction = () => {
    if (widgetsData?.diagnosticWidgetData?.length > limit * currentOffset) {
      setTestLength(widgetsData?.diagnosticWidgetData?.length);
    } else {
      setTestLength(limit * currentOffset);
    }
    setShowLoadMore(false);
  };

  const onEndReached = () => {
    if (testLength <= widgetsData?.diagnosticWidgetData?.length) {
      setCurrentOffset(currentOffset + 1);
      setShowLoadMore(true);
      countDown = setTimeout(function() {
        loadMoreFuction();
      }, 2000);
    } else {
      setCurrentOffset(currentOffset);
      setShowLoadMore(false);
      clearTimeout(countDown);
    }
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
    const actualItemsToShow = widgetsData?.diagnosticWidgetData;
    return (
      <>
        {!!actualItemsToShow && actualItemsToShow?.length > 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            onScroll={() => {
              setSlideCallToOrder(true);
            }}
          >
            <Text style={styles.headingText}>
              {deepLinkWidgetName! || widgetsData?.diagnosticWidgetTitle}{' '}
              {actualItemsToShow?.length > 0 && (
                <Text style={styles.itemCountText}>({actualItemsToShow?.length})</Text>
              )}
            </Text>
            {widgetsData?.diagnosticWidgetType == 'Package' ? (
              <PackageCard
                data={widgetsData}
                diagnosticWidgetData={widgetsData?.diagnosticWidgetData?.slice(
                  0,
                  widgetsData?.diagnosticWidgetData < limit
                    ? widgetsData?.diagnosticWidgetData
                    : testLength
                )}
                isPriceAvailable={isPriceAvailable}
                onEndReached={
                  testLength == widgetsData?.diagnosticWidgetData?.length ? null : onEndReached
                }
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable}
                isVertical={true}
                columns={1}
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.LISTING}
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
                isPriceAvailable={isPriceAvailable}
                onEndReached={
                  testLength == widgetsData?.diagnosticWidgetData?.length ? null : onEndReached
                }
                navigation={props.navigation}
                source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.LISTING}
                sourceScreen={AppRoutes.TestListing}
              />
            )}
          </ScrollView>
        ) : null}
      </>
    );
  };
  const renderCallToOrder = () => {
    return ctaDetailMatched?.length ? (
      <CallToOrderView
        cityId={cityId}
        customMargin={80}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
      />
    ) : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderHeader()}
        {!errorStates ? renderBreadCrumb() : null}
        {error ? renderEmptyMessage() : null}
        <View style={{ flex: 1, marginBottom: '5%' }}>{renderList()}</View>
        {renderCallToOrder()}
        {showLoadMore ? renderLoadMore() : null}
      </SafeAreaView>
      {loading && widgetsData?.length == 0 && <Spinner />}
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
  emptyContainer: { flex: 1, justifyContent: 'center' },
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
  noDataCardEmpty: {
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
