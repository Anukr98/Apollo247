import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';

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
  medicineTitle: {
    flex: 1,
    marginRight: 0,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 15,
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
  isSellOnline: boolean;
  medicineName: string;
  specialPrice?: number;
  price: number;
  imageUrl?: string;
  quantity: number;
  isInStock: boolean;
  isPrescriptionRequired: boolean;
  onPress: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxOrderQty: number;
  removeCartItem: () => void;
}

export const SearchMedicineGridCard: React.FC<SearchMedicineGridCardProps> = (props) => {
  const {
    isSellOnline,
    medicineName,
    specialPrice,
    price,
    imageUrl,
    isInStock,
    quantity,
    containerStyle,
    isPrescriptionRequired,
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

  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={[styles.addToCartViewStyle, isInStock && { paddingHorizontal: 23.5 }]}
        activeOpacity={1}
        onPress={!isInStock ? onNotifyMeClicked : onPressAdd}
      >
        <Text
          style={{
            ...theme.viewStyles.text(
              'SB',
              !isInStock ? 9 : 10,
              '#fc9916',
              1,
              !isInStock ? 17 : 24.2,
              0
            ),
          }}
        >
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
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: imageUrl }}
            style={{ height: 40, width: 36 }}
            resizeMode="contain"
          />
        ) : isPrescriptionRequired ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderSpecialPrice = () => {
    return isInStock && specialPrice ? (
      <Text style={styles.specialpriceTextStyle}>
        {'('}
        <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price}`}</Text>
        {')'}
      </Text>
    ) : null;
  };

  const renderOutOfStock = () => {
    return !isInStock ? (
      <Text style={styles.outOfStockStyle} numberOfLines={2}>
        {'Out Of Stock'}
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
        {!isSellOnline
          ? renderNotForSaleTag()
          : !quantity
          ? renderAddToCartView()
          : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
