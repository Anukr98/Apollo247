import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useState } from 'react';
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
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
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
  const title = dataFromHomePage?.diagnosticWidgetTitle;

  const [loading, setLoading] = useState<boolean>(false);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);

  const [serviceableObject, setServiceableObject] = useState({} as any);
  Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object;
  const renderHeader = () => {
    return (
      <TestListingHeader navigation={props.navigation} headerText={nameFormater(title, 'upper')} />
    );
  };
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER;
  const ctaDetailArray = callToOrderDetails?.ctaDetailsOnCityId;
  const isCtaDetailDefault = callToOrderDetails?.ctaDetailsDefault?.ctaProductPageArray?.includes(CALL_TO_ORDER_CTA_PAGE_ID.TESTLISTING);
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

  const renderCallToOrder = () => {
    return ctaDetailMatched?.length ? (
      <CallToOrderView
        cityId={cityId}
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
            onScroll={()=>{
              setSlideCallToOrder(true)
            }}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item, index }) => renderItems(item, index)}
          />
        </View>
          {renderCallToOrder()}
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
});
