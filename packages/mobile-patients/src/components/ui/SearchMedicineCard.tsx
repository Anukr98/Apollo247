import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';

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
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
  },
  offTextStyle: {
    ...theme.viewStyles.text('M', 11, '#00B38E', 1, 20, 0),
    marginTop: 4,
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
  isSellOnline: boolean;
  medicineName: string;
  specialPrice?: number;
  price: number;
  imageUrl?: string;
  quantity: number;
  isInStock: boolean;
  isPrescriptionRequired: boolean;
  onPress: () => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxOrderQty: number;
  removeCartItem: () => void;
}

export const SearchMedicineCard: React.FC<SearchMedicineCardProps> = (props) => {
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

  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderQuantityView = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
      <View style={{ width: 40, marginRight: 12, alignItems: 'center', alignSelf: 'center' }}>
        {imageUrl ? (
          <Image
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: imageUrl }}
            style={{ height: 40, width: 40 }}
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

  const renderOutOfStock = () => {
    const off_text = getDiscountPercentage(price, specialPrice)
      ? ' ' + getDiscountPercentage(price, specialPrice) + '%off'
      : '';
    return !isInStock && isSellOnline ? (
      <Text style={styles.outOfStockStyle}>{'Out Of Stock'}</Text>
    ) : (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceTextCollapseStyle}>Rs. {specialPrice || price}</Text>
        {specialPrice && (
          <>
            <Text style={[styles.priceTextCollapseStyle, { marginLeft: 4, letterSpacing: 0 }]}>
              {'('}
              <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price}`}</Text>
              {')'}
            </Text>
            <Text style={styles.offTextStyle}>{off_text}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      <View style={{ flexDirection: 'row' }}>
        {renderMedicineIcon()}
        <View style={styles.flexStyle}>{renderTitleAndIcon()}</View>
        <View style={{ width: 20 }}></View>
        {!isSellOnline
          ? renderNotForSaleTag()
          : !quantity
          ? renderAddToCartView()
          : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
