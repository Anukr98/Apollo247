import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import {
  CircleLogo,
  RemoveIcon,
  TestInfoIcon,
  TestTimeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  default as string,
  default as strings,
} from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const width = Dimensions.get('window').width;

export interface TestItemCardProps {
  testId?: string | number;
  reportGenItem?: any;
  testName: string;
  specialPrice?: number;
  price: number;
  circlePrice?: number;
  packOfCount?: number;
  showRemoveWhenOutOfStock?: boolean;
  isCardExpanded: boolean;
  onPress: () => void;
  onPressRemove: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  isCareSubscribed?: boolean;
  isComingFrom?: string;
  discount?: number | string;
  mrpToDisplay?: number | string;
  packageMrp?: number;
  isSpecialDiscount?: boolean;
  showCartInclusions?: boolean;
  duplicateArray?: any;
}

export const TestItemCard: React.FC<TestItemCardProps> = (props) => {
  const {
    isCardExpanded,
    packOfCount,
    reportGenItem,
    testName,
    specialPrice,
    price,
    containerStyle,
    onPressRemove,
    onPress,
    testId,
  } = props;

  const renderSpecialDiscountText = (styleObj?: any) => {
    return <SpecialDiscountText isImage={true} text={'TEST 247'} styleObj={styleObj} />;
  };

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.testNameTextStyle}>{testName}</Text>
          {!!packOfCount && isCardExpanded ? (
            <Text style={styles.packOfTextStyle}>{`Includes ${packOfCount} test${
              packOfCount == 1 ? '' : 's'
            }`}</Text>
          ) : null}
        </View>
        <View style={{ flex: 0.1 }}>{renderTouchable(<RemoveIcon />, () => onPressRemove())}</View>
      </View>
    );
  };

  const renderTouchable = (item: Element, onPress: () => void) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.removeTouch}>
        {item}
      </TouchableOpacity>
    );
  };

  const renderSavingView = () => {
    const savingAmount = Number(props.packageMrp || props.mrpToDisplay) - Number(props.circlePrice);
    return (
      <View style={styles.flexRow}>
        <CircleLogo style={styles.circleLogoIcon} />
        <Text style={styles.savingTextStyle}>
          {'Savings'} {string.common.Rs} {savingAmount}
        </Text>
      </View>
    );
  };

  const renderCircleSavingView = () => {
    return (
      <View style={styles.flexRow}>
        <Text style={[styles.circleText, { marginRight: isSmallDevice ? 2 : 1 }]}>For</Text>
        <CircleLogo style={styles.circleLogoIcon} />
        <Text style={[styles.circleText, { marginLeft: isSmallDevice ? 0 : -3 }]}>Members </Text>
        <Text style={styles.circleText}>
          {string.common.Rs} {props.circlePrice}
        </Text>
      </View>
    );
  };

  const renderCartPagePackageMrp = () => {
    return !!props.packageMrp && props.packageMrp > props.price ? (
      <View style={styles.rightView}>
        <Text style={styles.packageSlashedPrice}>
          ({strings.common.Rs} {props.packageMrp?.toFixed(2)})
        </Text>
      </View>
    ) : null;
  };

  const renderPriceView = () => {
    return (
      <>
        {/**
         * (non-sub + not promote circle + special) || (sub + not-promote cirlce +special)
         */}

        {props.circlePrice == undefined ? (
          <>
            {props.isSpecialDiscount ? renderSpecialDiscountText({ alignSelf: 'flex-end' }) : null}
            <View style={[styles.priceViewStyle]}>
              <View style={styles.circleHeadingView}>
                {props.specialPrice! && props.discount! > 0 ? (
                  <Text style={styles.percentageDiscountText}>
                    {Number(props.discount!).toFixed(0)}%off
                  </Text>
                ) : null}
                {!!price || !!specialPrice ? (
                  <Text style={styles.circlePriceTextSub}>
                    {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                  </Text>
                ) : null}
              </View>
              {renderCartPagePackageMrp()}
              {props.specialPrice! && props.packageMrp! < price! ? (
                <View style={styles.rightView}>
                  <Text style={[styles.packageSlashedPrice]}>
                    ({strings.common.Rs} {price!.toFixed(2)})
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {/**
         * non - sub + promote circle
         */}

        {!props.isCareSubscribed && props.circlePrice! ? (
          <View style={styles.priceViewStyle}>
            <View style={styles.circleHeadingView}>
              {props.discount! > 0 ? (
                <Text style={styles.percentageDiscountText}>
                  {Number(props.discount!).toFixed(0)}% off
                </Text>
              ) : null}
              {!!price || !!specialPrice ? (
                <Text style={styles.circlePriceTextSub}>
                  {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                </Text>
              ) : null}
            </View>
            {renderCartPagePackageMrp()}
          </View>
        ) : null}

        {/**
         * sub - promote circle
         */}
        {props.isCareSubscribed && props.circlePrice! ? (
          <View style={styles.priceViewStyle}>
            <View style={styles.circleHeadingView}>
              <Text style={[styles.percentageDiscountText]}>
                {Number(props.discount!)?.toFixed(0)}% off
              </Text>
              <Text style={styles.circlePriceTextSub}>
                {strings.common.Rs} {props.circlePrice!.toFixed(2)}
              </Text>
            </View>
            {renderCartPagePackageMrp()}
            {props.price && props.packageMrp! < price ? (
              <View style={styles.rightView}>
                <Text style={styles.packageSlashedPrice}>
                  ({strings.common.Rs} {price?.toFixed(2)})
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </>
    );
  };

  const renderReportTimeAndInfoView = () => {
    return reportGenItem?.itemPrepration || reportGenItem?.itemReportTat ? (
      <View style={styles.timeAndInfoMainViewStyle}>
        {reportGenItem?.itemReportTat ? (
          <View style={styles.reportGenViewStyle}>
            <TestTimeIcon style={styles.timeIconStyle} />
            <Text
              style={styles.reportGenTextStyle}
            >{`Report Generation time - ${reportGenItem?.itemReportTat}`}</Text>
          </View>
        ) : null}
        {reportGenItem?.itemPrepration ? (
          <View style={styles.reportGenViewStyle}>
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={styles.reportGenTextStyle}>{reportGenItem?.itemPrepration}</Text>
          </View>
        ) : null}
        {props.isComingFrom == AppRoutes.TestsCart &&
        props.showCartInclusions &&
        !!inclusionItemToShow ? (
          <View style={styles.reportGenViewStyle}>
            <TestInfoIcon style={styles.timeIconStyle} />
            <Text style={styles.reportGenTextStyle}>Includes {inclusionItemToShow}</Text>
          </View>
        ) : null}
      </View>
    ) : null;
  };

  const inclusionItem =
    props.duplicateArray?.length > 0 &&
    props.duplicateArray?.map((item: any) =>
      Number(item?.id) == Number(testId) ? nameFormater(item?.removalName, 'default') : ''
    );
  const filterInclusions =
    props.duplicateArray?.length > 0 && inclusionItem?.filter((item: string) => item != '');
  const inclusionItemToShow =
    filterInclusions?.length > 0 && filterInclusions && filterInclusions?.join(', ');
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      <View style={styles.flexStyle}>
        {renderTitleAndIcon()}
        {props.isCareSubscribed && props.circlePrice ? renderSavingView() : null}
        {!props.isCareSubscribed && props.circlePrice! ? renderCircleSavingView() : null}
        {renderPriceView()}
      </View>
      {renderReportTimeAndInfoView()}
    </TouchableOpacity>
  );
};

const { SHERPA_BLUE, WHITE, LIGHT_BLUE, APP_GREEN, TEST_CARD_BUTTOM_BG } = theme.colors;
const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  containerStyle: {
    ...cardViewStyle,
    backgroundColor: WHITE,
  },
  rowSpaceBetweenView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexStyle: {
    flex: 1,
    padding: 12,
    paddingRight: 16,
    paddingBottom: 0,
    marginBottom: 12,
  },
  testNameTextStyle: {
    flex: 1,
    ...text('M', 14, SHERPA_BLUE, 1, 22),
  },
  packOfTextStyle: {
    ...text('M', isSmallDevice ? 11 : 12, LIGHT_BLUE, 0.6, 20, 0.04),
    marginBottom: 3,
  },
  circleHeadingView: { flexDirection: 'row', alignItems: 'center', marginRight: 4 },
  packageSlashedPrice: {
    ...text('SB', isSmallDevice ? 11 : 12, SHERPA_BLUE, 0.6, 16),
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  rightView: { alignSelf: 'flex-end' },
  percentageDiscountText: {
    ...text('M', width > 380 ? 10 : 8, APP_GREEN, 1, 12),
    marginRight: 4,
  },
  circlePriceTextSub: {
    ...text('B', isSmallDevice ? 12 : 14, SHERPA_BLUE, 1, 18),
  },
  savingTextStyle: {
    ...text('M', isSmallDevice ? 10.5 : 11, APP_GREEN, 1, 18),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleLogoIcon: {
    height: 18,
    width: isSmallDevice ? 30 : 34,
    resizeMode: 'contain',
  },
  flexRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  priceViewStyle: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  circleText: {
    ...text('M', isSmallDevice ? 10 : 10.5, SHERPA_BLUE, 1, 13),
    textAlign: 'center',
    alignSelf: 'center',
  },
  timeAndInfoMainViewStyle: {
    ...cardViewStyle,
    backgroundColor: TEST_CARD_BUTTOM_BG,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 12,
    paddingBottom: 4,
  },
  timeIconStyle: {
    width: 16,
    height: 16,
  },
  reportGenTextStyle: {
    ...text('M', 10, SHERPA_BLUE, 0.6, 16),
    marginLeft: 8,
  },
  reportGenViewStyle: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  removeTouch: {
    height: 30,
    width: 30,
    alignSelf: 'center',
    alignItems: 'center',
  },
});
