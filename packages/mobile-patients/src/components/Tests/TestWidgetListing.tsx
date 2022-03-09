import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  isEmptyObject,
  nameFormater,
  showDiagnosticCTA,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import { CALL_TO_ORDER_CTA_PAGE_ID } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getDiagnosticHomePageWidgets } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
export interface TestWidgetListingProps
  extends NavigationScreenProps<{
    movedFrom?: string;
    data?: any;
    cityId?: string | number;
    widgetName?: string;
  }> {}

export const TestWidgetListing: React.FC<TestWidgetListingProps> = (props) => {
  const { diagnosticServiceabilityData } = useAppCommonData();

  const dataFromHomePage = props.navigation.getParam('data');
  const cityId = props.navigation.getParam('cityId');
  const movedFrom = props.navigation.getParam('movedFrom');
  const widgetName = props.navigation.getParam('widgetName');

  const [loading, setLoading] = useState<boolean>(false);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [serviceableObject, setServiceableObject] = useState({} as any);
  const [selectedWidgetData, setSelectedWidgetData] = useState({} as any);
  const [error, setError] = useState<boolean>(false);

  const title = dataFromHomePage?.diagnosticWidgetTitle;
  const errorStates = !loading && isEmptyObject(selectedWidgetData);
  const cityIdToUse =
    movedFrom == 'deeplink'
      ? (!!diagnosticServiceabilityData &&
          Number(
            diagnosticServiceabilityData?.cityId ||
              AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
          )) ||
        AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
      : Number(cityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID;
  const getCTADetails = showDiagnosticCTA(CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING, cityIdToUse);
  Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object;

  useEffect(() => {
    if (movedFrom == 'deeplink' && !!!dataFromHomePage) {
      fetchHomePageWidgets();
    }
  }, []);

  async function fetchHomePageWidgets() {
    setLoading?.(true);
    const extractedWidgetName = decodeURIComponent(widgetName!)
      ?.trim()
      ?.replace(/-/g, ' ')
      ?.toLowerCase();
    try {
      const result: any = await getDiagnosticHomePageWidgets('diagnostic', Number(cityIdToUse));
      if (result?.data?.success && result?.data?.data?.length > 0) {
        const getResult = result?.data?.data;
        const getSelectedWidget = getResult?.find(
          (item: any) => item?.diagnosticWidgetTitle?.toLowerCase() === extractedWidgetName
        );
        !!getSelectedWidget ? setSelectedWidgetData(getSelectedWidget) : setSelectedWidgetData({});
      } else {
        setError(true);
        setSelectedWidgetData({});
      }
    } catch (error) {
      setError(true);
      setSelectedWidgetData({});
      CommonBugFender('fetchWidgets_TestWigetListing', error);
    } finally {
      setLoading?.(false);
    }
  }

  const renderHeader = () => {
    return (
      <TestListingHeader navigation={props.navigation} headerText={nameFormater(title, 'upper')} />
    );
  };

  const renderCallToOrder = () => {
    return getCTADetails?.length ? (
      <CallToOrderView
        cityId={cityId}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING}
        sectionName={title}
      />
    ) : null;
  };

  const renderItems = (item: any, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
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
      <View style={{ justifyContent: 'center' }}>
        <Card
          cardContainer={styles.noDataCardEmpty}
          heading={string.common.uhOh}
          description={string.common.noDiagnosticsAvailable}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const renderList = () => {
    return (
      <>
        <View style={styles.gridConatiner}>
          <FlatList
            data={
              movedFrom == 'deeplink' && !isEmptyObject(selectedWidgetData)
                ? selectedWidgetData?.diagnosticWidgetData
                : dataFromHomePage?.diagnosticWidgetData
            }
            numColumns={4}
            onScroll={() => {
              setSlideCallToOrder(true);
            }}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item, index }) => renderItems(item, index)}
          />
        </View>
        {renderCallToOrder()}
        {movedFrom == 'deeplink' &&
          !loading &&
          !error &&
          isEmptyObject(selectedWidgetData) &&
          renderEmptyMessage()}
        {movedFrom == 'deeplink' && error && renderErrorMessage()}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderHeader()}
        <View style={{ flex: 1 }}>{renderList()}</View>
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
    backgroundColor: theme.colors.BGK_GRAY,
  },
  image: {
    width: 30,
    height: 30,
    backgroundColor: theme.colors.BGK_GRAY,
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
  emptyContainer: { flex: 1, justifyContent: 'center' },
  noDataCardEmpty: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});
