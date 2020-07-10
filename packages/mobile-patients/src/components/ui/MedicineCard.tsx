import {
  AddIcon,
  CheckedIcon,
  CheckUnselectedIcon,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  RemoveIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

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
  } = props;

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
    const opitons = Array.from({ length: AppConfig.Configuration.CART_ITEM_MAX_QUANTITY }).map(
      (_, i) => {
        return { key: (i + 1).toString(), value: i + 1 };
      }
    );

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
          {specialPrice ? (
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
                <Text
                  style={{
                    ...theme.viewStyles.text('SB', 13, '#02475b', 0.7, undefined, 0.33),
                    textDecorationLine: 'line-through',
                  }}
                >{`Rs. ${price.toFixed(2)}`}</Text>
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
          <Text style={[styles.unitAndRupeeText, { flex: 0, alignSelf: 'center' }]}>{`Rs. ${(
            specialPrice || price
          ).toFixed(2)}`}</Text>
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

  const renderOutOfStock = () => {
    return unserviceable || !isInStock ? (
      <Text style={styles.outOfStockStyle}>
        {unserviceable ? 'Not serviceable in your area.' : 'Out Of Stock'}
      </Text>
    ) : !isCardExpanded ? (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceTextCollapseStyle}>Rs. {(specialPrice || price).toFixed(2)}</Text>
        {specialPrice && (
          <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4 }]}>
            {'('}
            <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price.toFixed(2)}`}</Text>
            {')'}
          </Text>
        )}
      </View>
    ) : null;
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
          {renderTitleAndIcon()}
          {isCardExpanded && !props.showRemoveWhenOutOfStock ? (
            <>
              <View style={[styles.separator, { marginTop: 0 }]} />
              {renderUnitDropdownAndPrice()}
            </>
          ) : null}
        </View>
      </View>
      <View style={{ height: 13 }} />
    </TouchableOpacity>
  );
};
