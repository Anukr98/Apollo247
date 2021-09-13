import {
  CircleLogo,
  RemoveIcon,
  TestInfoIcon,
  TestTimeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { diagnosticsDisplayPrice } from '@aph/mobile-patients/src/utils/commonUtils';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import moment from 'moment';

interface CartItemCardProps {
  index: number;
  cartItem: any;
  selectedPatient: any;
  isCircleSubscribed: boolean;
  onPressRemove: (test: any) => void; //add patient id
  reportGenItem?: any;
  reportTat?: any;
  showCartInclusions?: boolean;
  duplicateArray?: any;
  comingFrom?: string;
  onPressCard: (test: any) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = (props) => {
  const {
    cartItem,
    isCircleSubscribed,
    reportGenItem,
    reportTat,
    duplicateArray,
    comingFrom,
    showCartInclusions,
    index,
  } = props;

  const inclusionItem =
    duplicateArray?.length > 0 &&
    duplicateArray?.map((item: any) =>
      Number(item?.toKeepItemIds) == Number(cartItem?.id)
        ? nameFormater(item?.itemsToRemovalName, 'default')
        : ''
    );
  const filterInclusions =
    duplicateArray?.length > 0 && inclusionItem?.filter((item: string) => item != '');

  const finalFilterInclusions = filterInclusions?.length > 0 && [...new Set(filterInclusions)];

  const inclusionItemToShow = !!finalFilterInclusions && finalFilterInclusions?.join(', ');

  const hasExtraData =
    !!reportGenItem &&
    (reportGenItem?.itemPrepration || reportTat?.reportTATInUTC || reportGenItem?.itemReportTat);
  const inclusionCount = !!reportGenItem && reportGenItem?.itemParameterCount;

  const showSavingsView =
    isCircleSubscribed &&
    !!cartItem?.circleSpecialPrice &&
    cartItem?.groupPlan === DIAGNOSTIC_GROUP_PLAN.CIRCLE;

  const showDiscountSavingsView =
    !showSavingsView &&
    !!cartItem?.discountSpecialPrice &&
    cartItem?.groupPlan === DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT;

  function _onPressCard(item: DiagnosticsCartItem) {
    props.onPressCard(item);
  }

  const renderCartItems = () => {
    const priceToShow = diagnosticsDisplayPrice(cartItem, isCircleSubscribed)?.priceToShow;
    const slashedPrice = diagnosticsDisplayPrice(cartItem, isCircleSubscribed)?.slashedPrice;
    return (
      <TouchableOpacity style={{}} onPress={() => _onPressCard(cartItem)}>
        <View
          style={[
            styles.cartItemView,
            {
              paddingTop: props.index == 0 ? 22 : 12,
              paddingBottom: !!(hasExtraData || inclusionCount || showSavingsView) ? 0 : 16, //8
            },
          ]}
        >
          <View style={{ width: '87%' }}>
            {!!slashedPrice && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.packageSlashedPrice}>
                  {string.common.Rs}
                  {slashedPrice}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.itemNameView}>
              <Text style={styles.cartItemText}>{nameFormater(cartItem?.name, 'default')}</Text>
            </View>
            <View style={[styles.rightView]}>
              <View style={styles.priceView}>
                <Text style={styles.mainPriceText}>
                  {string.common.Rs}
                  {priceToShow}
                </Text>
              </View>
              <View style={styles.removeIconView}>{renderRemoveIcon(cartItem)}</View>
            </View>
          </View>
        </View>
        {renderInclusionsCount()}
        {(!!reportGenItem || !!reportTat) && renderReportTat_preTestingReqrmnt()}
        {comingFrom == AppRoutes.CartPage && showCartInclusions && !!inclusionItemToShow ? (
          <View style={styles.inclusionView}>
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={styles.inclusionText}>Includes {inclusionItemToShow}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderInclusionsCount = () => {
    return (
      <View
        style={[
          styles.inclusionSavingContainer,
          {
            justifyContent: !!inclusionCount ? 'space-between' : 'flex-end',
            paddingBottom: !!hasExtraData ? 0 : 8,
          },
        ]}
      >
        {!!inclusionCount ? (
          <View>
            <Text style={styles.inclusionCountText}>{`Includes ${inclusionCount} test${
              inclusionCount == 1 ? '' : 's'
            }`}</Text>
          </View>
        ) : null}
        {showSavingsView && renderSavingView(true)}
        {!showSavingsView && showDiscountSavingsView && renderSavingView(false)}
      </View>
    );
  };

  const renderReportTat_preTestingReqrmnt = () => {
    return !!hasExtraData ? (
      <View style={styles.reportView}>
        {reportTat?.reportTATInUTC || reportGenItem?.itemReportTat ? (
          <View style={[styles.reportGenViewStyle, styles.reportViewStyle]}>
            <TestTimeIcon style={[styles.timeIconStyle, { marginLeft: 4 }]} />
            <Text style={[styles.reportGenTextStyle, { textAlign: 'right' }]}>
              {!!reportTat?.reportTATInUTC && reportTat?.reportTATInUTC != ''
                ? `Report by ${moment(reportTat?.reportTATInUTC)?.format('ddd, DD MMM')}`
                : `Report in ${reportGenItem?.itemReportTat}`}
            </Text>
          </View>
        ) : null}
        {reportGenItem?.itemPrepration ? (
          <View
            style={[
              styles.reportGenViewStyle,
              {
                justifyContent: 'flex-start',
                marginLeft: !!reportTat?.reportTATInUTC || !!reportGenItem?.itemReportTat ? -4 : -8,
              },
            ]}
          >
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={[styles.reportGenTextStyle, { marginLeft: 6 }]}>
              {reportGenItem?.itemPrepration}
            </Text>
          </View>
        ) : null}
      </View>
    ) : null;
  };

  const renderRemoveIcon = (cartItem: any) => {
    return (
      <View style={{ flex: 0.1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.onPressRemove(cartItem)}
          style={styles.removeTouch}
        >
          <RemoveIcon style={styles.removeIconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSavingView = (isCircleDiscount: boolean) => {
    const mrpToDisplay = diagnosticsDisplayPrice(cartItem, isCircleSubscribed)?.mrpToDisplay;

    const savingAmount =
      Number((!!cartItem?.packageMrp && cartItem?.packageMrp!) || mrpToDisplay) -
      Number(isCircleDiscount ? cartItem?.circleSpecialPrice! : cartItem?.discountSpecialPrice!);

    return (
      <>
        {!!savingAmount && savingAmount > 0 ? (
          <View style={styles.flexRow}>
            {isCircleDiscount ? (
              <CircleLogo style={styles.circleLogoIcon} />
            ) : (
              <SpecialDiscountText isImage={true} text={'TEST 247'} />
            )}
            <Text
              style={[
                styles.savingTextStyle,
                {
                  marginHorizontal: isCircleDiscount ? 0 : 3,
                },
              ]}
            >
              {'Savings'} {string.common.Rs} {savingAmount}
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  return <View>{renderCartItems()}</View>;
};

const styles = StyleSheet.create({
  packageSlashedPrice: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 11 : 12, theme.colors.SHERPA_BLUE, 0.6, 16),
    textDecorationLine: 'line-through',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 16),
  },
  cartItemText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 22),
  },
  removeTouch: {
    height: 30,
    width: 30,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  priceView: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '70%',
    marginTop: 2,
  },
  rightView: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
  },
  itemNameView: { width: '70%', justifyContent: 'flex-start' },
  cartItemView: {
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 40, //46
  },
  removeIconView: { justifyContent: 'center', alignSelf: 'flex-start' },
  reportGenTextStyle: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHERPA_BLUE, 1, 16),
    marginLeft: 4,
    marginRight: 10,
  },
  reportGenViewStyle: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  timeIconStyle: {
    width: 14,
    height: 14,
    marginLeft: 10,
    resizeMode: 'contain',
  },
  reportViewStyle: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.TEST_CARD_BUTTOM_BG,
    maxWidth: 136, //160
    minWidth: 100,
    justifyContent: 'flex-start',
    paddingRight: 6,
  },
  reportView: {
    paddingLeft: 10, //16
    paddingRight: 16,
    paddingBottom: 10,
    paddingTop: 6,
  },
  inclusionView: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inclusionText: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHERPA_BLUE, 0.6, 16),
    padding: 8,
    width: '87%',
  },
  inclusionCountText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10 : 11, theme.colors.LIGHT_BLUE, 0.6, 18, 0.04),
    marginBottom: 3,
  },
  flexRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  savingTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.APP_GREEN, 1, 18),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleLogoIcon: {
    height: 18,
    width: isSmallDevice ? 30 : 34,
    resizeMode: 'contain',
  },
  inclusionSavingContainer: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
  },
  removeIconStyle: { height: 22, width: 22, resizeMode: 'contain' },
});
