import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { PackageIcon, TestsCartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import {
  isEmptyObject,
  isSmallDevice,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  diagnosticsDisplayPrice,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

export interface DiagnosticsSearchResultItemProps {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressRemoveFromCart: () => void;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
  isCircleSubscribed: boolean;
  searchedString?: string;
}

export const DiagnosticsSearchResultItem: React.FC<DiagnosticsSearchResultItemProps> = (props) => {
  const { cartItems, modifiedOrderItemIds, modifiedOrder } = useDiagnosticsCart();
  const { data, isCircleSubscribed, searchedString } = props;
  const name = data?.diagnostic_item_name || '';
  const itemType = data?.diagnostic_item_itemType;
  const isAddedToCart = !!cartItems?.find(
    (item) => Number(item?.id) == Number(data?.diagnostic_item_id)
  );
  const parameterData = data?.diagnostic_inclusions_test_parameter_data?.filter(
    (item: { mandatoryValue: boolean }) => {
      return item?.mandatoryValue == true;
    }
  );
  const testPramaterDataCount = parameterData?.length;
  const inclusionData = data?.diagnostic_inclusions;
  const dataLength = !!data?.testParametersCount
    ? data?.testParametersCount
    : inclusionData?.length;

  const isModifyOrder = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const getExisitingOrderItems = isModifyOrder
    ? !!modifiedOrderItemIds && modifiedOrderItemIds
    : [];

  const isAlreadyPartOfOrder =
    getExisitingOrderItems?.length > 0 &&
    getExisitingOrderItems?.find((id: number) => Number(id) == Number(data?.diagnostic_item_id));

  const renderItemNamePrice = () => {
    const getDiagnosticPricingForItem = data?.diagnostic_item_price;
    const packageMrpForItem = data?.packageCalculatedMrp!;
    const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);
    const obj = {
      id: data?.diagnostic_item_id,
      name: data?.diagnostic_item_name,
      mou: 1,
      price: pricesForItem?.price!,
      thumbnail: null,
      specialPrice: pricesForItem?.specialPrice!,
      circlePrice: pricesForItem?.circlePrice,
      circleSpecialPrice: pricesForItem?.circleSpecialPrice!,
      discountPrice: pricesForItem?.discountPrice!,
      discountSpecialPrice: pricesForItem?.discountSpecialPrice!,
      collectionMethod: TEST_COLLECTION_TYPE.HC,
      groupPlan: pricesForItem?.planToConsider?.groupPlan,
      packageMrp: packageMrpForItem,
      inclusions: data?.diagnostic_inclusions,
    };
    const priceToShow = diagnosticsDisplayPrice(obj, isCircleSubscribed)?.priceToShow;

    const itemTypeExits = !!itemType && itemType != '';
    const isTest = itemTypeExits && itemType?.toLowerCase() == 'test';
    const isPackage = itemTypeExits && itemType?.toLowerCase() == 'package';
    const isTestPackageDetailsUnavailable =
      (isTest && testPramaterDataCount == 0) || (isPackage && dataLength == 0);

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.nameAndPriceViewStyle}>
          <View style={{ width: '70%' }}>
            <Text numberOfLines={2} style={styles.testNameText}>
              {name}
            </Text>
            {!!itemTypeExits ? (isTest ? renderTestsIncluded() : renderInclusions()) : null}
            {renderAliasName()}
            {renderItemType(isTestPackageDetailsUnavailable)}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.priceText}>
              {string.common.Rs}
              {priceToShow}
            </Text>
            {renderAddToCartView(pricesForItem)}
          </View>
        </View>
      </View>
    );
  };

  const renderTestsIncluded = () => {
    return (
      <>
        {dataLength > 0 && (
          <Text style={styles.greyedOutTextStyle}>
            {dataLength} {dataLength > 1 ? 'Tests included' : 'Test included'}
          </Text>
        )}
      </>
    );
  };

  const renderInclusions = () => {
    const performMatch =
      !!searchedString && searchedString?.length > 2 && inclusionData?.length > 0;
    const findMatchItem =
      performMatch &&
      inclusionData?.find((item: string) =>
        item?.toLowerCase()?.includes(searchedString?.toLowerCase())
      );
    const textToHighlight = !!findMatchItem ? findMatchItem : inclusionData?.[0];
    return (
      <View>
        {inclusionData?.length > 0 && (
          <Text numberOfLines={2} style={styles.greyedOutTextStyle}>
            Includes:{' '}
            <Text
              style={{
                color:
                  !!textToHighlight && textToHighlight != ''
                    ? theme.colors.APP_GREEN
                    : theme.colors.SHERPA_BLUE,
              }}
            >
              {nameFormater(textToHighlight, 'default')}
            </Text>{' '}
            {dataLength - 1 > 0 ? `+ ${dataLength - 1} tests` : null}
          </Text>
        )}
      </View>
    );
  };

  const renderAliasName = () => {
    const aliasNames =
      !!data?.diagnostic_item_alias_names && data?.diagnostic_item_alias_names !== '';

    return (
      <>
        {aliasNames ? (
          <Text style={styles.greyedOutItalicsTextStyle} numberOfLines={1}>
            {string.diagnostics.alsoKnownAs}: {data?.diagnostic_item_alias_names}
          </Text>
        ) : null}
      </>
    );
  };

  const renderItemType = (isTestPackageDetailsUnavailable: boolean) => {
    const hasType = !!itemType && itemType != '';
    const isTest = !!hasType && itemType?.toLowerCase() == 'test';
    return (
      <>
        {!!hasType ? (
          <View
            style={[
              styles.iconOrImageContainerStyle,
              {
                width: isTest ? 85 : 110,
                marginTop: isTestPackageDetailsUnavailable ? 8 : isTest ? -4 : 10,
              },
            ]}
          >
            <View>
              {isTest ? (
                <TestsCartIcon style={styles.imageIcon} />
              ) : (
                <PackageIcon style={styles.imageIcon} />
              )}
            </View>

            <Text style={styles.itemTypeText}>in {nameFormater(itemType + 's', 'default')}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderAddToCartView = (pricesForItem: any) => {
    return (
      <TouchableOpacity
        style={{ marginTop: 4 }}
        activeOpacity={1}
        onPress={
          isAlreadyPartOfOrder
            ? () => {}
            : isAddedToCart
            ? props.onPressRemoveFromCart
            : props.onPressAddToCart
        }
      >
        {isAlreadyPartOfOrder ? (
          <View style={[styles.removeCtaView, { width: 80 }]}>
            <Text style={styles.removeCta}>{string.diagnostics.alreadyAdded}</Text>
          </View>
        ) : isAddedToCart ? (
          <View style={styles.removeCtaView}>
            <Text style={styles.removeCta}>{string.diagnostics.removeFromCart}</Text>
          </View>
        ) : (
          <View style={styles.addCtaView}>
            <Text style={styles.addCta}>{string.diagnostics.addToCart}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, props.style]}
      onPress={props.onPress}
    >
      <View style={styles.containerStyle} key={data?.diagnostic_item_id}>
        <View style={styles.iconAndDetailsContainerStyle}>{renderItemNamePrice()}</View>
        {props.showSeparator ? <Spearator /> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {},
  iconAndDetailsContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9.5,
  },
  iconOrImageContainerStyle: {
    backgroundColor: '#F4F4F4',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'transparent',
    padding: 4,
  },
  nameAndPriceViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addCta: {
    ...theme.viewStyles.text('B', isSmallDevice ? 12 : 13, colors.LIGHT_ORANGE_YELLOW, 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  removeCta: {
    ...theme.viewStyles.text('B', isSmallDevice ? 12 : 13, colors.WHITE, 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  testNameText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20),
  },
  priceText: {
    ...theme.viewStyles.text('B', 14, theme.colors.SHERPA_BLUE, 1, 19),
  },
  greyedOutItalicsTextStyle: {
    fontStyle: 'italic',
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.6,
    lineHeight: 18,
    fontSize: 11,
  },
  greyedOutTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 18),
  },
  imageIcon: { height: 25, width: 25, resizeMode: 'contain' },
  itemTypeText: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 20),
    marginHorizontal: 6,
    textAlign: 'center',
  },
  addCtaView: {
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_YELLOW,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
  },
  removeCtaView: {
    backgroundColor: colors.ORANGE,
    borderColor: colors.ORANGE,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
  },
});
