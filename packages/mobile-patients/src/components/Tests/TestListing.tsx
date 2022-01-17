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

import { nameFormater, showDiagnosticCTA } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  TouchableOpacity,
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
import { DownO } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getDiagnosticsByItemIdCityId,
  getDiagnosticsPastOrderRecommendations,
} from '@aph/mobile-patients/src/helpers/clientCalls';

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
  const { currentPatient } = useAllCurrentPatients();
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
  const [packageOffset, setPackageOffset] = useState<number>(2);
  const [testsOffset, setTestsOffset] = useState<number>(4);
  const [testLength, setTestLength] = useState<number>(limit);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const client = useApolloClient();
  const [widgetsData, setWidgetsData] = useState([] as any);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPriceAvailable, setIsPriceAvailable] = useState<boolean>(false);
  const errorStates = !loading && widgetsData?.length == 0;
  const cityIdToUse =
    movedFrom == 'deeplink'
      ? (!!diagnosticServiceabilityData &&
          Number(
            diagnosticServiceabilityData?.cityId ||
              AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
          )) ||
        AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      : Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID;
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

  useEffect(() => {
    let source = movedFrom == 'Tests' ? '247 Home' : movedFrom == 'deeplink' ? 'Deeplink' : '';
    DiagnosticProductListingPageViewed(widgetType, source, widgetName!, title);
  }, []);

  //commented for now
  // useEffect(() => {
  //   fetchWidgetsPrices(widgetsData);
  // }, [widgetsData?.diagnosticWidgetData?.[0]]);

  const fetchWidgets = async (title: string) => {
    const createTitle = decodeURIComponent(title)
      ?.trim()
      ?.replace(/ /g, '-')
      ?.toLowerCase();
    let widgetName = movedFrom == AppRoutes.Tests ? `home-${createTitle}` : `${createTitle}`;
    const titleFromProps = props.navigation.getParam('widgetName');

    if (widgetType == 'Category' || widgetType == 'Category_Scroll') {
      widgetName = createTitle.toLowerCase();
    }
    try {
      const result: any = await getDiagnosticListingWidget('diagnostic-list', widgetName);
      if (result?.data?.success && result?.data?.data?.diagnosticWidgetData?.length > 0) {
        const getWidgetsData = result?.data?.data;
        const isRecommended = getWidgetsData?.diagnosticwidgetsRankOrder === '0';
        if (isRecommended) {
          fetchPastOrderRecommendations(getWidgetsData);
        } else {
          if (
            titleFromProps?.toLowerCase() ==
            string.diagnostics.homepagePastOrderRecommendations?.toLowerCase()
          ) {
            fetchPastOrderRecommendations([]);
          } else {
            fetchWidgetsPrices(getWidgetsData);
            setLoading?.(false);
          }
          setWidgetsData(getWidgetsData);
        }
      } else {
        callPastRecommendations(titleFromProps!);
        setWidgetsData([]);
      }
    } catch (error) {
      CommonBugFender('fetchWidgets_TestListing', error);
      callPastRecommendations(titleFromProps!);
      setWidgetsData([]);
    }
  };

  function callPastRecommendations(titleFromProps: string) {
    if (
      titleFromProps?.toLowerCase() ==
      string.diagnostics.homepagePastOrderRecommendations?.toLowerCase()
    ) {
      fetchPastOrderRecommendations([]);
    } else {
      setLoading?.(false);
      setError(true);
    }
  }

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsWidgetsPricing, findDiagnosticsWidgetsPricingVariables>({
      query: GET_WIDGETS_PRICING_BY_ITEMID_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: cityIdToUse,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });

  async function getWidgetPricesWithInclusions(
    widgetsData: any,
    cityId: string | number,
    source: string,
    drupalWidgets: any
  ) {
    const { filterWidgets, itemIds } = getFilteredWidgets(widgetsData, source);
    try {
      const res = await getDiagnosticsByItemIdCityId(client, cityIdToUse, itemIds);
      let newWidgetsData = [...filterWidgets];
      const priceResult = res?.data?.findDiagnosticsByItemIDsAndCityID;
      if (!!priceResult && !!priceResult?.diagnostics && priceResult?.diagnostics?.length > 0) {
        const widgetPricingArr = priceResult?.diagnostics;
        setPastOrderRecommendationPrices(newWidgetsData, widgetPricingArr, drupalWidgets);
      }
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('getWidgetPricesWithInclusions api__Tests', error);
      setLoading?.(false);
    }
  }

  const fetchPastOrderRecommendations = async (drupalWidgets: any) => {
    const getRecommendationsFromDrupal = drupalWidgets?.diagnosticWidgetData;
    try {
      const getPastOrderRecommendation = await getDiagnosticsPastOrderRecommendations(
        client,
        currentPatient?.mobileNumber
      );
      const pastOrders =
        getPastOrderRecommendation?.data?.getDiagnosticItemRecommendationsByPastOrders?.itemsData;
      //showing both past recommendations api + drupal widgets
      if (!!pastOrders) {
        const appenedRecommendations = [
          ...new Set(pastOrders?.concat(getRecommendationsFromDrupal)),
        ];
        getWidgetPricesWithInclusions(
          appenedRecommendations,
          cityIdToUse,
          string.diagnostics.homepagePastOrderRecommendations,
          drupalWidgets
        );
      } else {
        setDrupalRecommendationsAsPastRecommendations(getRecommendationsFromDrupal);
      }
    } catch (error) {
      setDrupalRecommendationsAsPastRecommendations(getRecommendationsFromDrupal);
      CommonBugFender('fetchPastOrderRecommendations_Tests', error);
    }
  };

  function setDrupalRecommendationsAsPastRecommendations(drupalWidget: any) {
    const getRecommendationsFromDrupal = drupalWidget;
    //here inclusions will be there from drupal
    fetchWidgetsPrices(
      getRecommendationsFromDrupal,
      string.diagnostics.homepagePastOrderRecommendations
    );
  }

  function getFilteredWidgets(widgetsData: any, source?: string) {
    var filterWidgets, itemIds;
    if (source == string.diagnostics.homepagePastOrderRecommendations) {
      filterWidgets = widgetsData;
      itemIds = filterWidgets?.map((item: any) => Number(item?.itemId));
    } else {
      filterWidgets = widgetsData?.diagnosticWidgetData;
      itemIds = widgetsData?.diagnosticWidgetData?.map((item: any) => Number(item?.itemId));
    }
    return {
      filterWidgets,
      itemIds,
    };
  }

  const fetchWidgetsPrices = async (widgetsData: any, source?: string) => {
    const { filterWidgets, itemIds } = getFilteredWidgets(widgetsData, source);
    if (!!itemIds) {
      setLoading?.(true);
      const res = Promise.all(itemIds?.map((item: any) => fetchPricesForCityId(cityIdToUse, item)));
      try {
        const response = (await res).map(
          (item: any) => item?.data?.findDiagnosticsWidgetsPricing?.diagnostics
        );

        let newWidgetsData = widgetsData;
        setWidgetPrices(newWidgetsData, response);
        setLoading?.(false);
      } catch (error) {
        CommonBugFender('errorInFetchPricing api__Tests', error);
        setLoading?.(false);
      }
    }
  };

  function setWidgetPrices(newWidgetsData: any, response: any) {
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
  }

  function setPastOrderRecommendationPrices(
    overallWidgets: any,
    widgetPricingArr: any,
    drupalWidgets: any
  ) {
    let _recommendedBookings = JSON.parse(JSON.stringify(drupalWidgets));
    let obj = [] as any;
    overallWidgets?.forEach((_widget: any) => {
      widgetPricingArr?.forEach((_diagItems: any) => {
        if (Number(_widget?.itemId) == Number(_diagItems?.itemId)) {
          obj?.push({
            itemId: _widget?.itemId,
            itemTitle: !!_widget?.itemName ? _widget?.itemName : _widget?.itemTitle,
            diagnosticPricing: _diagItems?.diagnosticPricing,
            packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
            inclusionData: _widget?.inclusionData || _diagItems?.inclusions,
            inclusions: _widget?.diagnosticInclusions,
            observations: _widget?.observations,
          });
        }
      });
    });

    const filterItemsWithPrices =
      !!obj && obj?.filter((items: any) => items?.hasOwnProperty('diagnosticPricing'));
    _recommendedBookings.diagnosticWidgetData = filterItemsWithPrices;

    setWidgetsData(_recommendedBookings);
  }

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
      if (movedFrom === AppRoutes.CartPage) {
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
  const renderLoadAll = (source?: string, length?: number) => {
    return (
      <TouchableOpacity
        style={styles.loadAllView}
        onPress={() => {
          if (source == 'packages' && length) {
            setPackageOffset(length);
          } else if (source == 'tests' && length) {
            setTestsOffset(length);
          }
        }}
      >
        <Text style={styles.textLoadMore}>{nameFormater('load more', 'upper')}</Text>
        <DownO size="sm_l" style={styles.downArrow} />
      </TouchableOpacity>
    );
  };

  const renderList = () => {
    const actualItemsToShow = widgetsData?.diagnosticWidgetData;
    let itemPackages: any[] = [];
    let itemTests: any[] = [];

    const newArray =
      !!actualItemsToShow &&
      actualItemsToShow?.map((item: any) => {
        const inclusions = item?.inclusionData;
        //segregation of tests/packages
        !!inclusions && inclusions?.length > 1 ? itemPackages.push(item) : itemTests.push(item);
      });

    const getActualPricePackages =
      !!itemPackages && itemPackages?.length > 0
        ? itemPackages?.filter((pckg: any) => pckg?.diagnosticPricing)
        : [];
    const getActualPriceTests =
      !!itemTests && itemTests?.length > 0
        ? itemTests?.filter((test: any) => test?.diagnosticPricing)
        : [];

    const packageItemsArray =
      !!getActualPricePackages &&
      getActualPricePackages?.length > 10 &&
      widgetName?.toLowerCase() == string.diagnostics.homepagePastOrderRecommendations.toLowerCase()
        ? getActualPricePackages?.slice(0, 10)
        : itemPackages;

    const testItemsArray =
      !!getActualPriceTests &&
      getActualPriceTests?.length > 10 &&
      widgetName?.toLowerCase() == string.diagnostics.homepagePastOrderRecommendations.toLowerCase()
        ? getActualPriceTests?.slice(0, 10)
        : itemTests;

    return (
      <>
        {!!actualItemsToShow && actualItemsToShow?.length > 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            onScroll={() => {
              setSlideCallToOrder(true);
            }}
            scrollEventThrottle={16}
          >
            {!!packageItemsArray && packageItemsArray?.length > 0 && (
              <>
                <Text style={styles.headingText}>
                  {nameFormater(deepLinkWidgetName! || widgetsData?.diagnosticWidgetTitle, 'upper')}{' '}
                  PACKAGES{' '}
                  {!!getActualPricePackages && getActualPricePackages?.length > 0 && (
                    <Text style={styles.itemCountText}>
                      (
                      {widgetName?.toLowerCase() ==
                      string.diagnostics.homepagePastOrderRecommendations?.toLowerCase()
                        ? packageItemsArray?.length
                        : getActualPricePackages?.length}
                      )
                    </Text>
                  )}
                </Text>
                <PackageCard
                  data={{
                    diagnosticWidgetTitle: widgetsData?.diagnosticWidgetTitle,
                    diagnosticWidgetType: widgetsData?.diagnosticWidgetType,
                    diagnosticwidgetsRankOrder: widgetsData?.diagnosticwidgetsRankOrder,
                    diagnosticWidgetData: itemPackages,
                  }}
                  diagnosticWidgetData={itemPackages?.slice(0, packageOffset)}
                  isPriceAvailable={isPriceAvailable}
                  isCircleSubscribed={isDiagnosticCircleSubscription}
                  isServiceable={isDiagnosticLocationServiceable}
                  isVertical={true}
                  columns={1}
                  navigation={props.navigation}
                  source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.LISTING}
                  sourceScreen={AppRoutes.TestListing}
                  widgetHeading={widgetsData?.diagnosticWidgetTitle}
                />
              </>
            )}
            {!error &&
            !loading &&
            packageItemsArray?.length &&
            packageItemsArray?.length > packageOffset
              ? renderLoadAll('packages', packageItemsArray?.length)
              : null}
            {!!testItemsArray && testItemsArray?.length > 0 && (
              <>
                <Text style={styles.headingText}>
                  {nameFormater(deepLinkWidgetName! || widgetsData?.diagnosticWidgetTitle, 'upper')}{' '}
                  TESTS{' '}
                  {!!getActualPriceTests && getActualPriceTests?.length > 0 && (
                    <Text style={styles.itemCountText}>
                      (
                      {widgetName?.toLowerCase() ==
                      string.diagnostics.homepagePastOrderRecommendations?.toLowerCase()
                        ? testItemsArray?.length
                        : getActualPriceTests?.length}
                      )
                    </Text>
                  )}
                </Text>
                <ItemCard
                  data={{
                    diagnosticWidgetTitle: widgetsData?.diagnosticWidgetTitle,
                    diagnosticWidgetType: widgetsData?.diagnosticWidgetType,
                    diagnosticwidgetsRankOrder: widgetsData?.diagnosticwidgetsRankOrder,
                    diagnosticWidgetData: testItemsArray,
                  }}
                  diagnosticWidgetData={testItemsArray?.slice(0, testsOffset)}
                  isCircleSubscribed={isDiagnosticCircleSubscription}
                  isServiceable={isDiagnosticLocationServiceable}
                  isVertical={true}
                  columns={2}
                  isPriceAvailable={isPriceAvailable}
                  navigation={props.navigation}
                  source={DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.LISTING}
                  sourceScreen={AppRoutes.TestListing}
                  widgetHeading={widgetsData?.diagnosticWidgetTitle}
                />
              </>
            )}
            {!error &&
            !loading &&
            testItemsArray?.length != 0 &&
            testItemsArray?.length > testsOffset
              ? renderLoadAll('tests', testItemsArray?.length)
              : null}
          </ScrollView>
        ) : null}
      </>
    );
  };
  const renderCallToOrder = () => {
    const getCTADetails = showDiagnosticCTA(CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING, cityId!);
    return getCTADetails?.length ? (
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
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING}
        sectionName={deepLinkWidgetName! || widgetsData?.diagnosticWidgetTitle}
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
  loadAllView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '40%',
    padding: 10,
    borderRadius: 10,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    backgroundColor: theme.colors.WHITE,
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
