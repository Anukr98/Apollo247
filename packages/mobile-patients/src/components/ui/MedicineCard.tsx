import {
  AddIcon,
  CheckedIcon,
  CheckUnselectedIcon,
  CircleLogo,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  PendingIcon,
  RemoveIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { getMaxQtyForMedicineItem } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { string } from '../../strings/string';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { Spearator } from './BasicComponents';
import { CircleHeading } from './CircleHeading';

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
    // alignItems: 'center',
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    flex: 1,
    marginRight: 10,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
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
  unitAndRupeeOfferText: {
    ...theme.viewStyles.text('M', 13, '#02475b', 0.6, undefined, 0.33),
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
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
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
});

export interface MedicineCardProps {
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
}

export const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  const [dropDownVisible, setDropDownVisible] = useState(false);
  const {
    isTest,
    isCardExpanded,
    packOfCount,
    medicineName,
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
    onChangeSubscription,
    onEditPress,
    onAddSubscriptionPress,
    maxQty,
  } = props;

  const isSpecialPrice = specialPrice !== price && (!!specialPrice || specialPrice === 0);
  const priceToBeDisplayed = isSpecialPrice ? specialPrice : price;

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

  const renderSubscription = () => {
    if (subscriptionStatus == 'already-subscribed') {
      return (
        <View style={[styles.takeRegularView, styles.alreadySubscribedView]}>
          <Text style={styles.subscriptionTextStyle}>{'You have subscribed to this already'}</Text>
          <View style={styles.editAndSubscriptionViewStyle}>
            {renderTouchable(<Text style={theme.viewStyles.yellowTextStyle}>{'EDIT'}</Text>, () =>
              onEditPress()
            )}
            {renderTouchable(
              <Text style={theme.viewStyles.yellowTextStyle}>{'ADD NEW SUBSCRIPTION'}</Text>,
              () => onAddSubscriptionPress()
            )}
          </View>
        </View>
      );
    }
    return (
      <View style={styles.takeRegularView}>
        <Text style={styles.subscriptionTextStyle}>{'Need to take this regularly ?'}</Text>
        {renderTouchable(
          subscriptionStatus == 'subscribed-now' ? <CheckedIcon /> : <CheckUnselectedIcon />,
          () =>
            onChangeSubscription(
              subscriptionStatus == 'subscribed-now' ? 'unsubscribed' : 'subscribed-now'
            )
        )}
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

  const renderSearchPriceView = () => {
    return (
      <>
        {props.isCareSubscribed && (
          <View style={{ alignSelf: 'flex-end' }}>
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
              {strings.common.Rs} {(specialPrice! ? specialPrice! : price!).toFixed(2)}
            </Text>
          </View>
        )}
        {/**
         * non-sub + no-circle + special price
         */}
        {props.circlePrice == undefined && specialPrice && (
          <View style={{ alignSelf: 'flex-end' }}>
            <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4 }]}>
              {'('}
              <Text style={{ textDecorationLine: 'line-through' }}>
                {`${strings.common.Rs} ${price!.toFixed(2)}`}
              </Text>
              {')'}
            </Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {/**
           * if getting circle price then  promoting.
           */}
          {!props.isCareSubscribed && props.circlePrice! && (
            <>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginRight: 5 }}>
                <CircleHeading />
              </View>

              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.7, 20, 0.04),
                  marginTop: 4,
                  marginRight: 5,
                }}
              >
                {strings.common.Rs} {props.circlePrice?.toFixed(2)}
              </Text>
              <View
                style={{
                  borderLeftWidth: 1,
                  borderLeftColor: '#02475b',
                  opacity: 0.3,
                  marginRight: 4,
                  marginTop: 4,
                }}
              />
            </>
          )}
          {props.isCareSubscribed && props.circlePrice! && (
            <>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginRight: 5 }}>
                <CircleHeading isSubscribed={props.isCareSubscribed} />
              </View>

              <Text
                style={{
                  ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 20, 0.04),
                  marginTop: 4,
                }}
              >
                {strings.common.Rs} {props.circlePrice?.toFixed(2)}
              </Text>
            </>
          )}

          {!props.isCareSubscribed && (
            <Text
              style={{ ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.04), marginTop: 4 }}
            >
              {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
            </Text>
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

  const renderPriceView = () => {
    return (
      <>
        {/**
         * (non-sub + not promote circle + special) || (sub + not-promote cirlce +special)
         */}
        {props.circlePrice == undefined && (
          <View
            style={{
              alignSelf: 'flex-end',
            }}
          >
            {props.specialPrice! && (
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, '#02475B', 0.5, 20, 0.04),
                  textDecorationLine: 'line-through',
                  textAlign: 'right',
                }}
              >
                {strings.common.Rs} ({price!.toFixed(2)})
              </Text>
            )}
            <View style={{ flexDirection: 'row' }}>
              {props.specialPrice! && props.discount! > 0 && (
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(11),
                    color: colors.APP_GREEN,
                    lineHeight: 16,
                    marginHorizontal: 10,
                  }}
                >
                  {Number(props.discount!).toFixed(0)}%off
                </Text>
              )}
              {(!!price || !!specialPrice) && (
                <Text style={{ ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.04) }}>
                  {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/**
         * non - sub + promote circle
         */}

        {!props.isCareSubscribed && props.circlePrice! && (
          <View
            style={{
              flexDirection: 'row',

              marginLeft: -40,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {/**check why this till text was commented */}
              <CircleHeading />
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0.04),
                  marginLeft: 5,
                }}
              >
                {strings.common.Rs} {props.circlePrice!.toFixed(2)}
              </Text>
            </View>
            <View style={{ alignSelf: 'flex-end' }}>
              {(!!price || !!specialPrice) && (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.04),
                    marginLeft: 5,
                  }}
                >
                  {strings.common.Rs} {(specialPrice! || price!).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/**
         * sub - promote circle
         */}
        {props.isCareSubscribed && props.circlePrice! && (
          <View
            style={{
              // alignSelf: 'flex-end',
              marginLeft: -32,
            }}
          >
            {props.price! && (
              <View style={{ alignSelf: 'flex-end' }}>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 14, '#02475B', 0.5, 20, 0.04),
                    textDecorationLine: 'line-through',
                  }}
                >
                  {strings.common.Rs} {price!.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <CircleHeading isSubscribed={props.isCareSubscribed} />
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 11, colors.APP_GREEN, 1, 20, 0.04),
                    marginRight: 5,
                  }}
                >
                  {Number(props.discount!).toFixed(0)}% off
                </Text>
                <Text style={{ ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.04) }}>
                  {strings.common.Rs} {props.circlePrice!.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
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
                : props.isComingFrom == 'testCart'
                ? renderPriceView()
                : renderUnitDropdownAndPrice()}
            </>
          ) : null}
        </View>
      </View>
      <View style={{ height: 13 }} />
    </TouchableOpacity>
  );
};
