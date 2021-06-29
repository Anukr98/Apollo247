import {
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

interface CartItemCardProps {
  cartItem: any;
  selectedPatient: any;
  isCircleSubscribed: boolean;
  onPressRemove: (test: any) => void; //add patient id
  reportGenItem?: any;
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
    duplicateArray,
    comingFrom,
    showCartInclusions,
  } = props;

  const inclusionItem =
    duplicateArray?.length > 0 &&
    duplicateArray?.map((item: any) =>
      Number(item?.id) == Number(cartItem?.id) ? nameFormater(item?.removalName, 'default') : ''
    );
  const filterInclusions =
    duplicateArray?.length > 0 && inclusionItem?.filter((item: string) => item != '');
  const inclusionItemToShow =
    filterInclusions?.length > 0 && filterInclusions && filterInclusions?.join(', ');

  function _onPressCard(item: DiagnosticsCartItem) {
    props.onPressCard(item);
  }

  const renderCartItems = () => {
    const priceToShow = diagnosticsDisplayPrice(cartItem, isCircleSubscribed)?.priceToShow;
    const slashedPrice = diagnosticsDisplayPrice(cartItem, isCircleSubscribed)?.slashedPrice;

    return (
      <TouchableOpacity style={{}} onPress={() => _onPressCard(cartItem)}>
        <View style={styles.cartItemView}>
          <View style={styles.itemNameView}>
            <Text style={styles.cartItemText}>{nameFormater(cartItem?.name, 'title')}</Text>
          </View>
          <View style={styles.rightView}>
            <View style={styles.priceView}>
              {!!slashedPrice && (
                <View style={{ marginTop: -10 }}>
                  <Text style={styles.packageSlashedPrice}>
                    {string.common.Rs}
                    {slashedPrice}
                  </Text>
                </View>
              )}
              <Text style={styles.mainPriceText}>
                {string.common.Rs}
                {priceToShow}
              </Text>
            </View>
            <View
              style={[styles.removeIconView, { alignSelf: !!slashedPrice ? 'flex-end' : 'center' }]}
            >
              {renderRemoveIcon(cartItem)}
            </View>
          </View>
        </View>
        {!!reportGenItem && renderReportTat_preTestingReqrmnt()}
        {comingFrom == AppRoutes.CartPage && showCartInclusions && !!inclusionItemToShow ? (
          <View
            style={[
              styles.reportGenViewStyle,
              { backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG },
            ]}
          >
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={styles.reportGenTextStyle}>Includes {inclusionItemToShow}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderReportTat_preTestingReqrmnt = () => {
    return reportGenItem?.itemPrepration || reportGenItem?.itemReportTat ? (
      <View style={styles.reportView}>
        {reportGenItem?.itemReportTat ? (
          <View style={[styles.reportGenViewStyle, styles.reportViewStyle]}>
            <TestTimeIcon style={styles.timeIconStyle} />
            <Text style={styles.reportGenTextStyle}>
              {`Report in ${reportGenItem?.itemReportTat}`}
            </Text>
          </View>
        ) : null}
        {reportGenItem?.itemPrepration ? (
          <View
            style={[
              styles.reportGenViewStyle,
              {
                maxWidth: 180,
                marginLeft: !!reportGenItem?.itemReportTat ? 10 : 0,
              },
            ]}
          >
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={styles.reportGenTextStyle}>{reportGenItem?.itemPrepration}</Text>
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
          <RemoveIcon />
        </TouchableOpacity>
      </View>
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
    alignSelf: 'center',
    alignItems: 'center',
  },
  priceView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
  },
  rightView: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
  },
  itemNameView: { width: '70%', justifyContent: 'center' },
  cartItemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 50,
  },
  removeIconView: { justifyContent: 'center' },
  reportGenTextStyle: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHERPA_BLUE, 0.6, 16),
    marginLeft: 8,
    marginRight: 10,
  },
  reportGenViewStyle: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  timeIconStyle: {
    width: 16,
    height: 16,
    marginLeft: 10,
    resizeMode: 'contain',
  },
  reportViewStyle: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.TEST_CARD_BUTTOM_BG,
    maxWidth: 160,
  },
  reportView: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 10,
    paddingTop: 6,
  },
});
