import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import {
  CircleTestLogoIcon,
  InfoIconRed,
  RemoveIcon,
  TestTimeIcon,
  TestInfoIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  default as string,
  default as strings,
} from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
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
  isTest?: boolean;
  testName: string;
  personName?: string;
  specialPrice?: number;
  price: number;
  circlePrice?: number;
  imageUrl?: string;
  type?: Doseform;
  subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  packOfCount?: number;
  unit?: number;
  isInStock: boolean;
  unserviceable?: boolean; // If yes, card shows "Not serviceable in your area.", using for TAT API in cart.
  showRemoveWhenOutOfStock?: boolean;
  isPrescriptionRequired: boolean;
  isCardExpanded: boolean;
  onPress: () => void;
  onChangeUnit: (unit: number) => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxQty?: number;
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
  const [dropDownVisible, setDropDownVisible] = useState(false);
  const {
    isTest,
    isCardExpanded,
    packOfCount,
    testName,
    personName,
    specialPrice,
    price,
    imageUrl,
    type,
    unit,
    isInStock,
    unserviceable,
    containerStyle,
    subscriptionStatus,
    isPrescriptionRequired,
    onChangeUnit,
    onPressRemove,
    onPressAdd,
    onPress,
    maxQty,
    testId,
  } = props;

  const renderSpecialDiscountText = (styleObj?: any) => {
    return <SpecialDiscountText isImage={true} text={'TEST 247'} />;
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
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        {item}
      </TouchableOpacity>
    );
  };

  const renderSavingView = () => {
    return (
      <View style={styles.flexRow}>
        <CircleTestLogoIcon style={styles.circleLogoIcon} />
        <Text style={styles.savingTextStyle}>
          {'Savings'} {string.common.Rs} {Number(props.packageMrp) - Number(props.circlePrice)}
        </Text>
      </View>
    );
  };

  const renderCircleSavingView = () => {
    return (
      <View style={styles.flexRow}>
        <Text style={[styles.circleText, { marginRight: isSmallDevice ? 2 : 1 }]}>For</Text>
        <CircleTestLogoIcon style={styles.circleLogoIcon} />
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
          <View style={styles.priceViewStyle}>
            {props.isSpecialDiscount ? renderSpecialDiscountText({}) : null}
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
    return (
      <View style={styles.timeAndInfoMainViewStyle}>
        <View style={styles.reportGenViewStyle}>
          <TestTimeIcon style={styles.timeIconStyle} />
          <Text style={styles.reportGenTextStyle}>{'Report Generation time - 12 to 14 hrs'}</Text>
        </View>
        <View style={styles.reportGenViewStyle}>
          <TestInfoIcon style={styles.timeIconStyle} />
          <Text style={styles.reportGenTextStyle}>{'10 to 12 hrs fasting required'}</Text>
        </View>
      </View>
    );
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
      {props.isComingFrom == AppRoutes.TestsCart &&
        props.showCartInclusions &&
        !!inclusionItemToShow && (
          <View style={styles.inclusionsView}>
            <InfoIconRed style={styles.infoIconStyle} />
            <Text style={styles.inclusionsText}>Includes {inclusionItemToShow}</Text>
          </View>
        )}
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
  inclusionsView: {
    backgroundColor: '#FCFDDA',
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    marginLeft: -16,
    width: width - 40,
  },
  infoIconStyle: { resizeMode: 'contain', height: 16, width: 16 },
  inclusionsText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 16,
    letterSpacing: 0.04,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  savingTextStyle: {
    ...text('M', isSmallDevice ? 10.5 : 11, APP_GREEN, 1, 18),
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
  },
  circleLogoIcon: {
    height: 17,
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
});
