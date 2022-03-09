import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import _ from 'lodash';
import DiscountPercentage from '@aph/mobile-patients/src/components/Tests/components/DiscountPercentage';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';

interface TestDetailsPriceViewProps {
  testInfo: any;
  isCircleSubscribed: boolean;
  slashedPrice: number;
  priceToShow: number;
  isTop: boolean;
}

export const TestDetailsPriceView: React.FC<TestDetailsPriceViewProps> = (props) => {
  const { testInfo, isCircleSubscribed, slashedPrice, priceToShow, isTop } = props;

  const renderSlashedView = (
    slashedPrice: number,
    priceToShow: number,
    showPercentage: boolean
  ) => {
    const promoteCircle = testInfo?.promoteCircle;
    const promoteDiscount = testInfo?.promoteDiscount;
    const circleDiscount = testInfo?.circleDiscount;
    const specialDiscount = testInfo?.specialDiscount;
    const discount = testInfo?.discount;

    return (
      <View style={{ flexDirection: 'row' }}>
        {(!isCircleSubscribed && testInfo?.promoteCircle && priceToShow == slashedPrice) ||
        priceToShow == slashedPrice ? null : (
          <Text style={styles.slashedPriceText}>
            MRP {string.common.Rs}
            <Text style={{ textDecorationLine: 'line-through' }}>
              {convertNumberToDecimal(slashedPrice)}
            </Text>
          </Text>
        )}
        {/**percentage discount */}
        {showPercentage &&
          renderPercentageDiscount(
            promoteCircle && isCircleSubscribed
              ? circleDiscount
              : promoteDiscount
              ? specialDiscount
              : discount,
            promoteCircle && isCircleSubscribed ? true : false,
            promoteDiscount && specialDiscount > 0 ? specialDiscount : 0,
            discount > 0 ? discount : 0
          )}
      </View>
    );
  };

  const renderPercentageDiscount = (
    discount: string | number,
    isOnlyCircle: boolean,
    specialDiscount: number,
    hasOtherDiscount: number
  ) => {
    const discountPrice =
      specialDiscount > 0 ? specialDiscount : hasOtherDiscount > 0 ? hasOtherDiscount : 0;
    return (
      <DiscountPercentage
        discount={discount}
        isOnlyCircle={isOnlyCircle}
        discountPrice={discountPrice}
      />
    );
  };

  const renderMainPriceView = (priceToShow: number, showSavings: boolean) => {
    return (
      <View style={styles.rowStyle}>
        {!!priceToShow && (
          <Text style={styles.mainPriceText}>
            {string.common.Rs} {convertNumberToDecimal(priceToShow)}
          </Text>
        )}
        {showSavings ? renderDiscountView() : null}
      </View>
    );
  };

  const renderDiscountView = () => {
    const circleSpecialPrice = testInfo?.circleSpecialPrice!;
    const circleDiscountSaving = testInfo?.circleDiscountDiffPrice;
    const specialDiscountSaving = testInfo?.specialDiscountDiffPrice;
    const groupPlan = testInfo?.groupPlan?.groupPlan;

    return (
      <View style={styles.savingsOuterView}>
        {isCircleSubscribed &&
        circleDiscountSaving > 0 &&
        !testInfo?.promoteDiscount &&
        groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            {renderSavingView('save', circleDiscountSaving, {}, styles.savingsText)}
          </View>
        ) : testInfo?.promoteDiscount &&
          specialDiscountSaving > 0 &&
          !testInfo?.promoteCircle &&
          groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={styles.rowStyle}>
            <SpecialDiscountText isImage={false} text={string.diagnostics.test247Text} />
            {renderSavingView(
              'save',
              specialDiscountSaving,
              {
                marginHorizontal: '2%',
              },
              styles.savingsText
            )}
          </View>
        ) : circleDiscountSaving > 0 && groupPlan != DIAGNOSTIC_GROUP_PLAN.ALL ? (
          <View style={[styles.rowStyle, { alignSelf: 'flex-end' }]}>
            <CircleHeading isSubscribed={false} />
            {renderSavingView(
              '',
              circleSpecialPrice,
              { marginHorizontal: '2%' },
              styles.savingsText
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderSavingView = (
    text: string,
    price: number | string,
    mainViewStyle: any,
    textStyle: any
  ) => {
    return (
      <View style={mainViewStyle}>
        <Text style={textStyle}>
          {text} {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  return (
    <View>
      {renderSlashedView(slashedPrice, priceToShow, isTop)}
      {!_.isEmpty(testInfo) && renderMainPriceView(priceToShow, isTop)}
    </View>
  );
};

const styles = StyleSheet.create({
  flexRowView: { flexDirection: 'row', justifyContent: 'space-between' },
  rowStyle: { flexDirection: 'row' },
  slashedPriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    opacity: 0.5,
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  circleLogoIcon: {
    height: 20,
    width: isSmallDevice ? 32 : 36,
    resizeMode: 'contain',
  },
  savingsText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.SHERPA_BLUE, 0.9, 18),
    textAlign: 'center',
    alignSelf: 'center',
  },
  savingsOuterView: { marginLeft: '3%', justifyContent: 'center' },
});
