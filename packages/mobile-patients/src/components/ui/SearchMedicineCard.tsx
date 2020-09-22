import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { TouchableOpacityProps, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';

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
});

export interface Props extends MedicineProduct {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAdd: () => void;
  onPressSubstract: () => void;
  quantity: number;
  containerStyle?: TouchableOpacityProps['style'];
}

export const SearchMedicineCard: React.FC<Props> = (props) => {
  const {
    name,
    price,
    special_price,
    thumbnail,
    is_in_stock,
    sell_online,
    is_prescription_required,
    MaxOrderQty,
    quantity,
    containerStyle,
    onPress,
    onPressAddToCart,
    onPressNotify,
    onPressAdd,
    onPressSubstract,
  } = props;

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle}>{name}</Text>
          {renderOutOfStock()}
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={[styles.addToCartViewStyle, !!is_in_stock && { paddingHorizontal: 23 }]}
        onPress={!is_in_stock ? onPressNotify : onPressAddToCart}
      >
        <Text style={theme.viewStyles.text('SB', 10, '#fc9916', 1, 24, 0)}>
          {!is_in_stock ? 'NOTIFY ME' : 'ADD'}
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
          maxOrderQty={MaxOrderQty}
          addToCart={onPressAdd}
          removeItemFromCart={onPressSubstract}
          removeFromCart={onPressSubstract}
          isSolidContainer={false}
        />
      </View>
    );
  };

  const renderMedicineIcon = () => {
    const isPrescriptionRequired = is_prescription_required == 1;
    return (
      <View style={{ width: 40, marginRight: 12, alignItems: 'center', alignSelf: 'center' }}>
        {thumbnail ? (
          <Image
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: productsThumbnailUrl(thumbnail) }}
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
    const off_text = getDiscountPercentage(price, special_price)
      ? ' ' + getDiscountPercentage(price, special_price) + '%off'
      : '';
    return !is_in_stock && sell_online ? (
      <Text style={styles.outOfStockStyle}>{'Out Of Stock'}</Text>
    ) : (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.priceTextCollapseStyle}>Rs. {special_price || price}</Text>
        {!!special_price && (
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
        {!sell_online
          ? renderNotForSaleTag()
          : !quantity
          ? renderAddToCartView()
          : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
