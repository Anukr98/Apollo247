import {
  AddIcon,
  DropdownGreen,
  InfoIconRed,
  MedicineIcon,
  MedicineRxIcon,
  RemoveIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
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
import { Image } from 'react-native-elements';
import {
  getMaxQtyForMedicineItem,
  isSmallDevice,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
const width = Dimensions.get('window').width;

export interface MedicineCardProps {
  testId?: string | number;
  isTest?: boolean;
  medicineName: string;
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
  onChangeSubscription: (status: MedicineCardProps['subscriptionStatus']) => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onEditPress: () => void;
  onAddSubscriptionPress: () => void;
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

export const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  const {
    isTest,
    isCardExpanded,
    packOfCount,
    medicineName,
    personName,
    specialPrice,
    price,
    imageUrl,
    unit,
    isInStock,
    unserviceable,
    containerStyle,
    isPrescriptionRequired,
    onChangeUnit,
    onPressRemove,
    onPressAdd,
    onPress,
    maxQty,
    testId,
  } = props;

  const isSpecialPrice = specialPrice !== price && (!!specialPrice || specialPrice === 0);
  const priceToBeDisplayed = isSpecialPrice ? specialPrice : price;

  const renderSpecialDiscountText = (styleObj?: any) => {
    return <SpecialDiscountText isImage={true} text={string.diagnostics.test247Text} />;
  };

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle}>{medicineName}</Text>
          {isTest
            ? !!packOfCount &&
              isCardExpanded && (
                <Text style={styles.packOfTextStyle}>{`Includes ${packOfCount} test${
                  packOfCount == 1 ? '' : 's'
                }`}</Text>
              )
            : !!packOfCount &&
              isCardExpanded &&
              !props.showRemoveWhenOutOfStock && (
                <Text style={styles.packOfTextStyle}>{`Pack of ${packOfCount}`}</Text>
              )}
          {renderOutOfStock()}
        </View>
        <View style={{ flex: 0.1, justifyContent: 'center' }}>
          {isInStock || props.showRemoveWhenOutOfStock
            ? isCardExpanded
              ? renderTouchable(<RemoveIcon />, () => onPressRemove())
              : renderTouchable(<AddIcon />, () => onPressAdd())
            : null}
        </View>
      </View>
    );
  };

  const renderTitleIconForTestResult = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={styles.medicineTitle}>{medicineName}</Text>
            <View style={{ flex: 0.1, justifyContent: 'center' }}>
              {isInStock || props.showRemoveWhenOutOfStock
                ? isCardExpanded
                  ? renderTouchable(<RemoveIcon />, () => onPressRemove())
                  : renderTouchable(<AddIcon />, () => onPressAdd())
                : null}
            </View>
          </View>
          <Spearator style={{ marginBottom: 5 }} />

          {isTest
            ? !!packOfCount &&
              isCardExpanded && (
                <Text style={styles.packOfTextStyle}>{`Includes ${packOfCount} test${
                  packOfCount == 1 ? '' : 's'
                }`}</Text>
              )
            : !!packOfCount &&
              isCardExpanded &&
              !props.showRemoveWhenOutOfStock && (
                <Text style={styles.packOfTextStyle}>{`Pack of ${packOfCount}`}</Text>
              )}
          {renderOutOfStock()}
        </View>
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

  const renderUnitDropdownAndPrice = () => {
    const maxQuantity = priceToBeDisplayed === 0 ? unit : getMaxQtyForMedicineItem(maxQty);
    const opitons = Array.from({
      length: maxQuantity,
    }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });

    return (
      <View style={styles.unitAndPriceView}>
        {isTest ? (
          <></>
        ) : (
          <>
            <View style={{ flex: 0.6 }}>
              <MaterialMenu
                options={opitons}
                selectedText={unit!.toString()}
                selectedTextStyle={{
                  ...theme.viewStyles.text('M', 16, '#00b38e'),
                }}
                onPress={(selectedQuantity) => onChangeUnit(selectedQuantity.value as number)}
              >
                <View style={[styles.unitDropdownContainer, { marginRight: 0 }]}>
                  <View style={[{ flex: 1.4, alignItems: 'flex-start' }]}>
                    <Text style={styles.unitAndRupeeText}>{`QTY : ${unit}`}</Text>
                  </View>
                  <View style={[{ flex: 0.6, alignItems: 'flex-end' }]}>
                    <DropdownGreen />
                  </View>
                </View>
              </MaterialMenu>
            </View>
            <View style={styles.verticalSeparator} />
          </>
        )}
        <View
          style={[
            styles.flexStyle,
            {
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginLeft: 6,
            },
          ]}
        >
          {isSpecialPrice ? (
            <>
              <View
                style={[
                  {
                    flex: 0,
                    marginRight: 4,
                    alignSelf: 'flex-start',
                  },
                ]}
              >
                {!!price && (
                  <Text
                    style={{
                      ...theme.viewStyles.text('SB', 13, '#02475b', 0.7, undefined, 0.33),
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {`${strings.common.Rs} ${price!.toFixed(2)}`}
                  </Text>
                )}
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 10, '#02475b', 0.7, undefined, 0.25),
                    textAlign: 'center',
                  }}
                >
                  (MRP)
                </Text>
              </View>
            </>
          ) : (
            <Text style={[styles.unitAndRupeeText, { flex: 1 }]}>MRP</Text>
          )}
          <Text style={[styles.unitAndRupeeText, { flex: 0, alignSelf: 'center' }]}>
            {`${strings.common.Rs} ${priceToBeDisplayed!.toFixed(2)}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderMedicineIcon = () => {
    return (
      <View style={{ width: 40, marginRight: 12, alignItems: 'center' }}>
        {imageUrl ? (
          <Image
            PlaceholderContent={
              isTest ? (
                <TestsIcon />
              ) : isPrescriptionRequired ? (
                <MedicineRxIcon />
              ) : (
                <MedicineIcon />
              )
            }
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: imageUrl }}
            style={{ height: 40, width: 40 }}
            resizeMode="contain"
          />
        ) : isTest ? (
          <TestsIcon />
        ) : isPrescriptionRequired ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderPersonSelectionView = () => {
    return (
      !!personName && (
        <View style={styles.personSelectionView}>
          <Text style={styles.personNameTextStyle}>{`For ${personName}`}</Text>
          <DropdownGreen />
        </View>
      )
    );
  };

  const renderPackageMrp = (priceToShow: number) => {
    return (
      <Text style={styles.searchSlashedPrice}>
        ({strings.common.Rs} {priceToShow})
      </Text>
    );
  };

  const renderSearchPriceView = () => {
    return (
      <>
        {/**
         * non-sub + no-circle + special price added one more check
         */}
        {props.circlePrice == undefined &&
          specialPrice &&
          specialPrice != price &&
          price > props.packageMrp! && (
            <View style={{ alignSelf: 'flex-end' }}>
              <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4 }]}>
                {'('}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {`${strings.common.Rs} ${price!}`}
                </Text>
                {')'}
              </Text>
            </View>
          )}

        {/**
         * for sub + no circle + special
         */}
        {props.isCareSubscribed &&
          props.circlePrice == undefined &&
          props.specialPrice != props.packageMrp &&
          props.specialPrice! < props.packageMrp! &&
          renderPackageMrp(props.packageMrp!)}
        {/**
         * only special discount
         */}

        {props.isCareSubscribed && (
          <View style={styles.rowRightView}>
            {/**
             * special price text
             */}
            {props.circlePrice! == undefined && props.isSpecialDiscount
              ? renderSpecialDiscountText({
                  marginTop: '3%',
                  paddingRight: 5,
                })
              : null}
            <Text
              style={{
                ...theme.viewStyles.text(
                  'M',
                  props.circlePrice! ? 12 : 14,
                  '#02475B',
                  props.circlePrice! ? 0.5 : 1,
                  20,
                  0.04
                ),
                marginTop: 4,
                marginBottom: -4,
                textDecorationLine: props.circlePrice! ? 'line-through' : 'none',
              }}
            >
              {props.circlePrice! != undefined ? '(' : ''}
              {strings.common.Rs}{' '}
              {props.mrpToDisplay! > price
                ? specialPrice! || props.mrpToDisplay
                : specialPrice!
                ? specialPrice!
                : price!}
              {props.circlePrice! != undefined ? ')' : ''}
            </Text>
          </View>
        )}

        {/**
         * iff specialPrice & price does not match
         */}
        {!props.isCareSubscribed &&
          price != props.mrpToDisplay &&
          price < props.mrpToDisplay! &&
          renderPackageMrp(Number(props.mrpToDisplay!))}

        <View style={styles.rowEndView}>
          {/**
           * if getting circle price then  promoting.
           */}
          {!props.isCareSubscribed && props.circlePrice! && (
            <>
              <View style={styles.circleHeadingView}>
                <CircleHeading />
              </View>

              <Text style={styles.circlePriceText}>
                {strings.common.Rs}
                {props.circlePrice!}
              </Text>
              <View style={styles.verticalSeparator1} />
            </>
          )}
          {props.isCareSubscribed && props.circlePrice! && (
            <>
              <View style={styles.circleHeadingView}>
                <CircleHeading isSubscribed={props.isCareSubscribed} />
              </View>

              <Text
                style={{
                  ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 20, 0.04),
                  marginTop: 4,
                }}
              >
                {strings.common.Rs} {props.circlePrice!}
              </Text>
            </>
          )}

          {!props.isCareSubscribed && (
            <View style={styles.rowRightView}>
              {/**
               * special price text
               */}
              {props.circlePrice! == undefined && props.isSpecialDiscount
                ? renderSpecialDiscountText({
                    marginTop: '3%',
                    paddingRight: 5,
                  })
                : null}
              <Text
                style={{
                  ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.04),
                  marginTop: 4,
                }}
              >
                {strings.common.Rs} {specialPrice! || price!}
              </Text>
            </View>
          )}
        </View>
      </>
    );
  };

  const renderOutOfStock = () => {
    return unserviceable || !isInStock ? (
      <Text style={styles.outOfStockStyle}>
        {unserviceable ? 'Not serviceable in your area.' : 'Out Of Stock'}
      </Text>
    ) : !isCardExpanded && props.isComingFrom == 'testSearchResult' ? (
      renderSearchPriceView()
    ) : !isCardExpanded ? (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceTextCollapseStyle}>
          {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
        </Text>
        {specialPrice && (
          <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4 }]}>
            {'('}
            <Text style={{ textDecorationLine: 'line-through' }}>
              {`${strings.common.Rs} ${price!.toFixed(2)}`}
            </Text>
            {')'}
          </Text>
        )}
      </View>
    ) : null;
  };

  const renderCartPagePackageMrp = () => {
    return (
      <>
        {!!props.packageMrp && props.packageMrp > props.price && (
          <View style={styles.rightView}>
            <Text style={styles.packageSlashedPrice}>
              ({strings.common.Rs} {props.packageMrp?.toFixed(2)})
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderPriceView = () => {
    return (
      <>
        {/**
         * (non-sub + not promote circle + special) || (sub + not-promote cirlce +special)
         */}

        {props.circlePrice == undefined && (
          <>
            {renderCartPagePackageMrp()}
            <View
              style={[props.isSpecialDiscount ? { marginLeft: -32 } : { alignSelf: 'flex-end' }]}
            >
              {props.specialPrice! && props.packageMrp! < price! && (
                <View style={styles.rightView}>
                  <Text style={[styles.packageSlashedPrice]}>
                    ({strings.common.Rs} {price!.toFixed(2)})
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {props.isSpecialDiscount ? renderSpecialDiscountText({}) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: isSmallDevice ? 'flex-start' : 'flex-end',
                  }}
                >
                  {props.specialPrice! && props.discount! > 0 && (
                    <Text
                      style={[
                        styles.percentageDiscountText,
                        { marginLeft: props.isSpecialDiscount ? '13%' : 0 },
                      ]}
                    >
                      {Number(props.discount!).toFixed(0)}%off
                    </Text>
                  )}
                  {(!!price || !!specialPrice) && (
                    <Text
                      style={{
                        ...theme.viewStyles.text(
                          'M',
                          isSmallDevice ? 12 : 14,
                          '#02475B',
                          1,
                          20,
                          0.04
                        ),
                      }}
                    >
                      {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        {/**
         * non - sub + promote circle
         */}

        {!props.isCareSubscribed && props.circlePrice! && (
          <>
            {renderCartPagePackageMrp()}
            <View
              style={{
                flexDirection: 'row',
                marginLeft: -40,
                justifyContent:
                  props.specialPrice! && props.discount! > 0 ? 'center' : 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <CircleHeading />
                <Text style={styles.circlePriceTextSub}>
                  {strings.common.Rs} {props.circlePrice!.toFixed(2)}
                </Text>
              </View>
              {/** % added */}
              <View style={{ flexDirection: 'row' }}>
                {props.discount! > 0 && (
                  <Text style={[styles.percentageDiscountText, { marginLeft: 20 }]}>
                    {Number(props.discount!).toFixed(0)}% off
                  </Text>
                )}
                <View style={[styles.rightView]}>
                  {(!!price || !!specialPrice) && (
                    <Text
                      style={[
                        styles.circlePriceTextSub,
                        { ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14) },
                      ]}
                    >
                      {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        {/**
         * sub - promote circle
         */}
        {props.isCareSubscribed && props.circlePrice! && (
          <>
            {renderCartPagePackageMrp()}
            <View
              style={{
                // alignSelf: 'flex-end',
                marginLeft: -32,
              }}
            >
              {props.price! && props.packageMrp! < price && (
                <View style={styles.rightView}>
                  <Text style={styles.packageSlashedPrice}>
                    ({strings.common.Rs} {price!.toFixed(2)})
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <CircleHeading isSubscribed={props.isCareSubscribed} />
                <View style={styles.circleHeadingView}>
                  <Text
                    style={[
                      styles.percentageDiscountText,
                      {
                        marginRight: 5,
                      },
                    ]}
                  >
                    {Number(props.discount!).toFixed(0)}% off
                  </Text>
                  <Text style={styles.circlePriceTextSub}>
                    {strings.common.Rs} {props.circlePrice!.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </>
    );
  };

  const outOfStockContainerStyle: ViewStyle =
    !isInStock && !props.showRemoveWhenOutOfStock
      ? {
          backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
        }
      : {};

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
      style={[styles.containerStyle, containerStyle, outOfStockContainerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      {renderPersonSelectionView()}
      <View style={{ flexDirection: 'row' }}>
        {renderMedicineIcon()}
        <View style={styles.flexStyle}>
          {props.isComingFrom == 'testSearchResult'
            ? renderTitleIconForTestResult()
            : renderTitleAndIcon()}
          {isCardExpanded && !props.showRemoveWhenOutOfStock ? (
            <>
              <View style={[styles.separator, { marginTop: 0 }]} />

              {props.isComingFrom == 'testSearchResult'
                ? renderSearchPriceView()
                : props.isComingFrom == AppRoutes.TestsCart
                ? renderPriceView()
                : renderUnitDropdownAndPrice()}
            </>
          ) : null}
        </View>
      </View>
      <View style={{ height: 13 }} />
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

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 16,
    paddingBottom: 0,
  },
  rowSpaceBetweenView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    flex: 1,
    marginRight: 10,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 15 : 16),
    lineHeight: 24,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 7,
    marginTop: 7,
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  unitAndRupeeText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.33,
  },
  takeRegularView: {
    backgroundColor: '#f7f8f5',
    borderRadius: 5,
    padding: 8,
    paddingLeft: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
    flexDirection: 'row',
  },
  alreadySubscribedView: {
    padding: 12,
    flexDirection: 'column',
  },
  packOfTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11 : 12, '#02475b', 0.6, 20, 0.04),
    marginBottom: 3,
  },
  unitDropdownContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  editAndSubscriptionViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  unitAndPriceView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personNameTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    marginRight: 4,
  },
  personSelectionView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  outOfStockStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.INPUT_FAILURE_TEXT,
    marginTop: 4,
  },
  priceTextCollapseStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.5, 20, 0.04),
    marginTop: 4,
  },
  searchSlashedPrice: {
    ...theme.viewStyles.text('M', 12, '#02475B', 0.4, 20, 0.04),
    marginTop: 4,
    alignSelf: 'flex-end',
    textDecorationLine: 'line-through',
  },
  rowEndView: { flexDirection: 'row', justifyContent: 'flex-end' },
  circlePriceText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.7, 20, 0.04),
    marginTop: 4,
    marginRight: 5,
    alignSelf: 'flex-end',
  },
  verticalSeparator1: {
    borderLeftWidth: 1,
    borderLeftColor: '#02475b',
    opacity: 0.3,
    marginRight: 4,
    marginTop: 4,
  },
  circleHeadingView: { flexDirection: 'row', alignSelf: 'flex-end', marginRight: 5 },
  packageSlashedPrice: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, '#02475B', 0.5, 20, 0.04),
    textDecorationLine: 'line-through',
    textAlign: 'right',
  },
  rightView: { alignSelf: 'flex-end' },
  percentageDiscountText: {
    ...theme.fonts.IBMPlexSansMedium(width > 380 ? 11 : 9),
    color: colors.APP_GREEN,
    lineHeight: 16,
    marginTop: isSmallDevice ? 2 : 0,
    marginHorizontal: isSmallDevice ? 5 : 10,
  },
  circlePriceTextSub: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11 : 12, '#02475B', 1, 20, 0.04),
    marginLeft: 5,
  },
  rowRightView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
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
});
