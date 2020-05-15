import {
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 16,
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
    marginRight: 0,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
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

export interface SearchMedicineCardProps {
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
  quantity: number;
  isInStock: boolean;
  unserviceable?: boolean; // If yes, card shows "Not serviceable in your area.", using for TAT API in cart.
  showRemoveWhenOutOfStock?: boolean;
  isPrescriptionRequired: boolean;
  isMedicineAddedToCart: boolean;
  isCardExpanded: boolean;
  onPress: () => void;
  onChangeUnit: (unit: number) => void;
  onChangeSubscription: (status: SearchMedicineCardProps['subscriptionStatus']) => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  onEditPress: () => void;
  onAddSubscriptionPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SearchMedicineCard: React.FC<SearchMedicineCardProps> = (props) => {
  const {
    isTest,
    medicineName,
    personName,
    specialPrice,
    price,
    imageUrl,
    isInStock,
    quantity,
    unserviceable,
    containerStyle,
    isPrescriptionRequired,
    isMedicineAddedToCart,
    onNotifyMeClicked,
    onPressAddQuantity,
    onPressSubtractQuantity,
    onPressAdd,
    onPress,
  } = props;

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle}>{medicineName}</Text>
          {renderOutOfStock()}
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={{ alignSelf: 'center' }}
        activeOpacity={1}
        onPress={!isInStock ? onNotifyMeClicked : onPressAdd}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 12, '#fc9916', 1, 24, 0) }}>
          {!isInStock ? 'NOTIFY ME' : 'ADD TO CART'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuantityView = () => {
    return (
      <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
        <TouchableOpacity activeOpacity={1} onPress={onPressSubtractQuantity}>
          <Text
            style={{
              ...theme.viewStyles.text('SB', 14, '#fc9916', 1, 24, 0),
              paddingRight: 12,
              paddingLeft: 3,
            }}
          >
            {'-'}
          </Text>
        </TouchableOpacity>
        <Text style={{ ...theme.viewStyles.text('B', 14, '#fc9916', 1, 24, 0) }}>{quantity}</Text>
        <TouchableOpacity
          style={{ marginRight: 16 }}
          activeOpacity={1}
          onPress={onPressAddQuantity}
        >
          <Text
            style={{ ...theme.viewStyles.text('SB', 14, '#fc9916', 1, 24, 0), paddingLeft: 12 }}
          >
            {'+'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMedicineIcon = () => {
    return (
      <View style={{ width: 40, marginRight: 12, alignItems: 'center', alignSelf: 'center' }}>
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
    ) : (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceTextCollapseStyle}>Rs. {specialPrice || price}</Text>
        {specialPrice && (
          <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4, letterSpacing: 0 }]}>
            {'('}
            <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price}`}</Text>
            {')'}
          </Text>
        )}
      </View>
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
        <View style={styles.flexStyle}>{renderTitleAndIcon()}</View>
        <View style={{ width: 20 }}></View>
        {!isMedicineAddedToCart ? renderAddToCartView() : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
