import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { createDiagnosticAddToCartObject, diagnosticsDisplayPrice, getParameterCount, getPricesForItem } from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import {
  ArrowDownWhite,
  ArrowUpWhite,
  AcceptGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

interface RecommedationGroupCardProps {
  showRecommedation?: boolean;
  data?: any;
  cartItems?: any;
  patientItems?: any;
  onPressAdd?: any;
  showAddButton?: boolean;
  showTestWorth?: boolean;
  containerStyle?: any;
  scrollEnabled?: boolean;
  showPrice: number;
  priceToDisplayOnPopUp?: number;
  priceDiff?: number;
  groupRecommendations?: any;
  onPressArrow: () => void;
}

export const RecommedationGroupCard: React.FC<RecommedationGroupCardProps> = (props) => {
  const {
    showRecommedation,
    onPressAdd,
    showAddButton,
    showTestWorth,
    containerStyle,
    scrollEnabled,
    data,
    cartItems,
    patientItems,
    showPrice,
    priceToDisplayOnPopUp,
    priceDiff,
    groupRecommendations,
    onPressArrow,
  } = props;

  const inclusionNameArray = data?.inclusionData;
  const cartItemIds = cartItems?.map((item: { id: any }) => {
    return Number(item?.id);
  });
  const existingItems = inclusionNameArray?.filter((item: { itemId: any }) => {
    return cartItemIds?.includes(item?.itemId);
  });
  const getDiagnosticPricingForItem = data?.diagnosticPricing;
  const packageMrpForItem = data?.packageCalculatedMrp!;
  const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);
  const { getMandatoryParameterCount } = getParameterCount(data, 'incObservationData');
  const inclusions = data?.inclusionData?.map((item: any) => {
    return item?.incItemId;
  });
  const dataObj = createDiagnosticAddToCartObject(
    data?.itemId,
    data?.itemTitle,
    data?.gender,
    pricesForItem?.price!,
    pricesForItem?.specialPrice!,
    pricesForItem?.circlePrice!,
    pricesForItem?.circleSpecialPrice!,
    pricesForItem?.discountPrice!,
    pricesForItem?.discountSpecialPrice!,
    TEST_COLLECTION_TYPE.HC,
    pricesForItem?.planToConsider?.groupPlan!,
    packageMrpForItem,
    inclusions,
    AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    data?.itemImageUrl,
    getMandatoryParameterCount
  );
  const {
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const slashedPrice = diagnosticsDisplayPrice(dataObj,isDiagnosticCircleSubscription)?.slashedPrice;

  const newItems = inclusionNameArray?.filter((item: any) => {
    if (!cartItemIds?.includes(item?.itemId)) {
      return item;
    }
  });
  const newItemNames = newItems?.map((item: any) => {
    return item?.name;
  });
  const newItemText = newItemNames?.join(', ');
  const renderItemList = (text: string) => {
    return (
      <>
        <AcceptGreen style={styles.acceptTick} />
        <Text
          style={{
            ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1),
          }}
        >
          {' '}
          {text}
        </Text>
      </>
    );
  };
  let totalInclusionCount = 0;
  inclusionNameArray?.map((item:any)=>{
    totalInclusionCount += item?.observations?.length
  })
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={styles.recommedationHeaderContainer}
        onPress={() => {
          onPressArrow();
        }}
      >
        {!!priceDiff && (
          <Text style={styles.textStyleHeading}>
            {`Add ${
              priceDiff > 0
                ? `${
                    groupRecommendations?.[0]?.extraInclusionsCount > 1
                      ? `${groupRecommendations?.[0]?.extraInclusionsCount} more Tests`
                      : `${groupRecommendations?.[0]?.extraInclusionsCount} more Test`
                  } @ ₹ ${priceDiff?.toFixed()} Only`
                : `Add ${groupRecommendations?.[0]?.extraInclusionsCount} more tests @ no extra cost`
            }`}
          </Text>
        )}
        {showRecommedation ? (
          <ArrowUpWhite style={styles.iconStyleArrow} />
        ) : (
          <ArrowDownWhite style={styles.iconStyleArrow} />
        )}
      </TouchableOpacity>
      {showRecommedation ? (
        <View style={styles.subContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.cartItemText}>{data?.itemName}</Text>
            {isDiagnosticCircleSubscription ? (
                <Text style={styles.slashedPriceText}>
                  {string.common.Rs}
                  {slashedPrice}
                </Text>
              ) : null}
              <Text style={styles.mainPriceText}>
                {string.common.Rs}
                {pricesForItem?.price}
              </Text>
          </View>
          <Text
            style={styles.textInclusionsRecom}
          >{`includes ${totalInclusionCount} Tests`}</Text>
          <View style={{ marginTop: 10, flexDirection: 'column' }}>
            {existingItems?.map((item: any) => {
              return <View style={styles.inclusionItemView}>{renderItemList(item.name)}</View>;
            })}
            <View style={styles.inclusionItemView}>
              <AcceptGreen style={styles.acceptTick} />
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1),
                }}
              >
                {' '}
                Additional Tests:
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1),
                  }}
                >
                  {' '}
                  {newItemText}
                </Text>
              </Text>
            </View>
          </View>
          {showAddButton ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                onPressAdd();
              }}
            >
              <Text style={styles.textButton}>
                {nameFormater(string.common.selectPackage, 'upper')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderWidth: 1,
    borderColor: colors.LIGHT_GRAY,
    padding: 10,
    marginTop: -20,
  },
  subContainer: {
    backgroundColor: '#E8FAFF',
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
  },
  nameContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inclusionItemView: { paddingHorizontal: 10, paddingBottom: 10, flexDirection: 'row' },
  cartItemText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 22),
    width: '75%',
  },
  inclusionTextStyle: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1),
  },
  addButton: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_YELLOW,
    borderRadius: 6,
    borderWidth: 1,
    margin: 15,
    width: '96%',
  },
  textButton: {
    ...theme.viewStyles.text('SB', 14, colors.APP_YELLOW, 1),
    textAlign: 'center',
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12.5 : 14, theme.colors.SHERPA_BLUE, 1, 16),
    marginTop: 5,
    width: '15%',
    textAlign: 'center',
  },
  slashedPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 10.5 : 12, theme.colors.SHERPA_BLUE_LIGHT, 1, 16),
    marginTop: 5,
    // width: '20%',
    textAlign: 'center',
    textDecorationLine:'line-through'
  },
  textInclusionsRecom: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 10 : 12, colors.SHERPA_BLUE, 1),
    padding: 5,
    backgroundColor: colors.WHITE,
    marginLeft: 10,
    width: '40%',
    textAlign: 'center',
    borderRadius: 4
  },
  boldTextRecom: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1),
  },
  recommedationHeaderContainer: {
    flex: 1,
    backgroundColor: '#007C9D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
  },
  textStyleHeading: {
    ...theme.viewStyles.text('SB', 14, colors.WHITE, 1),
    padding: 5,
  },
  iconStyleArrow: {
    width: 20,
    height: 20,
  },
  acceptTick: {
    width: 20,
    height: 20,
    marginRight: 5
  },
});
