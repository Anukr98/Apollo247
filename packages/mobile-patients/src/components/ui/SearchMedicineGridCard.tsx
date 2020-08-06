import {
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { QuantityButton } from '@aph/mobile-patients/src/components/ui/QuantityButton';
import { Doseform } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ViewStyle,
} from 'react-native';
import { Image } from 'react-native-elements';
import { AddToCartButtons } from '../Medicines/AddToCartButtons';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 10,
    paddingTop: 14,
    flex: 0.5,
    minHeight: 122,
  },
  rowSpaceBetweenView: {
    flex: 1,
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    flex: 1,
    marginRight: 0,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(11),
    lineHeight: 15,
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
    flex: 1,
    letterSpacing: 0.04,
    color: theme.colors.INPUT_FAILURE_TEXT,
    marginTop: 1,
  },
  priceTextCollapseStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 1, 20, 0.04),
    marginTop: 1,
  },
  specialpriceTextStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0),
    marginLeft: 2,
  },
  minusQtyViewStyle: {
    marginBottom: 0,
    marginTop: 0,
    marginRight: 10,
    height: 12,
    width: 12,
  },
  plusQtyViewStyle: {
    marginRight: 0,
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 11,
    height: 12,
    width: 12,
  },
  minusPlusTextStyle: {
    marginTop: Platform.OS === 'ios' ? -7.5 : -4,
  },
  priceAndAddToCartViewStyle: {
    marginLeft: 3,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    justifyContent: 'space-between',
  },
  addToCartViewStyle: {
    alignSelf: 'center',
    borderColor: '#fc9916',
    borderWidth: 0.5,
    borderRadius: 1,
    paddingHorizontal: 8,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    backgroundColor: '#fff',
    elevation: 5,
  },
  medicineIconViewStyle: {
    width: 40,
    marginRight: 5,
  },
  medicineIconAndNameViewStyle: {
    flexDirection: 'row',
    marginBottom: 13,
  },
  qtyViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export interface SearchMedicineGridCardProps {
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
  onChangeSubscription: (status: SearchMedicineGridCardProps['subscriptionStatus']) => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  onEditPress: () => void;
  onAddSubscriptionPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxOrderQty: number;
  removeCartItem: () => void;
}

export const SearchMedicineGridCard: React.FC<SearchMedicineGridCardProps> = (props) => {
  const {
    isTest,
    medicineName,
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
    maxOrderQty,
    removeCartItem,
  } = props;

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle} numberOfLines={3}>
            {medicineName}
          </Text>
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={styles.addToCartViewStyle}
        activeOpacity={1}
        onPress={!isInStock ? onNotifyMeClicked : onPressAdd}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 9, '#fc9916', 1, 17, 0) }}>
          {!isInStock ? 'NOTIFY ME' : 'ADD'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuantityView = () => {
    return (
      <View style={styles.qtyViewStyle}>
        <AddToCartButtons
          numberOfItemsInCart={quantity}
          maxOrderQty={maxOrderQty}
          addToCart={onPressAddQuantity}
          removeItemFromCart={onPressSubtractQuantity}
          removeFromCart={removeCartItem}
          isSolidContainer={false}
        />
      </View>
    );
  };

  const renderMedicineIcon = () => {
    return (
      <View style={styles.medicineIconViewStyle}>
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
            style={{ height: 40, width: 36 }}
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

  const renderSpecialPrice = () => {
    return specialPrice ? (
      <Text style={styles.specialpriceTextStyle}>
        {'('}
        <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price}`}</Text>
        {')'}
      </Text>
    ) : null;
  };

  const renderOutOfStock = () => {
    return unserviceable || !isInStock ? (
      <Text style={styles.outOfStockStyle} numberOfLines={2}>
        {unserviceable ? 'Not serviceable in your area.' : 'Out Of Stock'}
      </Text>
    ) : (
      <Text style={styles.priceTextCollapseStyle}>Rs. {specialPrice || price}</Text>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      <View style={styles.medicineIconAndNameViewStyle}>
        {renderMedicineIcon()}
        {renderTitleAndIcon()}
      </View>
      {renderSpecialPrice()}
      <View style={styles.priceAndAddToCartViewStyle}>
        {renderOutOfStock()}
        {!isMedicineAddedToCart ? renderAddToCartView() : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
