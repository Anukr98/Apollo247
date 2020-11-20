import {
  MedicineIcon,
  MedicineRxIcon,
  ExpressDeliveryLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { CareCashbackBanner } from './CareCashbackBanner';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
  getCareCashback,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Image } from 'react-native-elements';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 10,
    paddingTop: 14,
    flex: 0.5,
    minHeight: 160,
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
  mrp: {
    ...theme.viewStyles.text('M', 11, '#02475b', 1, 20, 0),
  },
  offTextStyle: {
    ...theme.viewStyles.text('M', 11, '#00B38E', 1, 20, 0),
  },
  priceAndAddToCartViewStyle: {
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
  expressContainer: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 20,
  },
  imageStyle: {
    height: 40,
    width: 40,
  },
});

export interface Props extends MedicineProduct {
  onPress: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxOrderQty: number;
  removeCartItem: () => void;
  type_id?: string | null;
  is_express?: 'Yes' | 'No';
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAddQty: () => void;
  onPressSubtractQty: () => void;
  quantity: number;
}

export const SearchMedicineGridCard: React.FC<Props> = (props) => {
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
    maxOrderQty,
    removeCartItem,
    type_id,
    is_express,
    onPressAddToCart,
    onPressNotify,
    onPressAddQty,
    onPressSubtractQty,
  } = props;

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle} numberOfLines={special_price ? 2 : 3}>
            {name}
          </Text>
        </View>
      </View>
    );
  };

  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={[styles.addToCartViewStyle, !!is_in_stock && { paddingHorizontal: 23 }]}
        onPress={!is_in_stock ? onPressNotify : onPressAddToCart}
      >
        <Text style={theme.viewStyles.text('SB', 9, '#fc9916', 1, 24, 0)}>
          {!is_in_stock ? 'NOTIFY ME' : 'ADD'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuantityView = () => {
    return (
      <View style={styles.qtyViewStyle}>
        <AddToCartButtons
          numberOfItemsInCart={quantity}
          maxOrderQty={MaxOrderQty}
          addToCart={onPressAddQty}
          removeItemFromCart={onPressSubtractQty}
          removeFromCart={onPressSubtractQty}
          isSolidContainer={false}
        />
      </View>
    );
  };

  const renderMedicineIcon = () => {
    const isPrescriptionRequired = is_prescription_required == 1;
    return (
      <View style={styles.medicineIconViewStyle}>
        {thumbnail ? (
          <Image
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: productsThumbnailUrl(thumbnail) }}
            style={styles.imageStyle}
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
    const discount = getDiscountPercentage(price, special_price);
    const off_text = discount ? ' ' + discount + '%off' : '';
    return is_in_stock ? (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.mrp}>{'MRP '}</Text>
        {!!special_price && [
          <Text style={styles.specialpriceTextStyle}>
            {'('}
            <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${price}`}</Text>
            {')'}
          </Text>,
          <Text style={styles.offTextStyle}>{off_text}</Text>,
        ]}
      </View>
    ) : null;
  };

  const renderOutOfStock = () => {
    const discount = getDiscountPercentage(price, special_price);
    return !is_in_stock && sell_online ? (
      <Text style={styles.outOfStockStyle} numberOfLines={2}>
        {'Out Of Stock'}
      </Text>
    ) : (
      <Text style={styles.priceTextCollapseStyle}>Rs. {discount ? special_price : price}</Text>
    );
  };

  const renderCareCashback = () => {
    const finalPrice = price - Number(specialPrice) ? Number(specialPrice) : price;
    const cashback = getCareCashback(Number(finalPrice), type_id);
    if (!!cashback && type_id) {
      return (
        <CareCashbackBanner
          bannerText={`Extra Care ₹${cashback.toFixed(2)} Cashback`}
          textStyle={{
            left: -5,
          }}
        />
      );
    } else {
      return <></>;
    }
  };

  const renderExpressFlag = () => {
    return (
      <View style={styles.expressContainer}>
        <ExpressDeliveryLogo style={styles.expressLogo} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      {is_express === 'Yes' && renderExpressFlag()}
      <View style={styles.medicineIconAndNameViewStyle}>
        {renderMedicineIcon()}
        {renderTitleAndIcon()}
      </View>
      {!!type_id && renderCareCashback()}
      {renderSpecialPrice()}
      <View style={styles.priceAndAddToCartViewStyle}>
        {renderOutOfStock()}
        {!sell_online
          ? renderNotForSaleTag()
          : !quantity
          ? renderAddToCartView()
          : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
