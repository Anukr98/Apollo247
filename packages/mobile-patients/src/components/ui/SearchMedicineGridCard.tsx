import {
  MedicineIcon,
  MedicineRxIcon,
  ExpressDeliveryLogo,
  CircleDiscountBadge,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { CareCashbackBanner } from './CareCashbackBanner';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
  calculateCashbackForItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Image } from 'react-native-elements';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 10,
    paddingTop: 14,
    flex: 0.5,
    minHeight: 175,
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
    ...theme.viewStyles.text('SB', 13, '#02475b', 1, 20, 0.04),
    marginTop: 1,
  },
  specialpriceTextStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0),
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
    paddingTop: 7,
    alignItems: 'center',
    alignSelf: 'center',
  },
  medicineIconAndNameViewStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  qtyViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expressContainer: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 20,
  },
  imageStyle: {
    height: 80,
    width: 80,
  },
  discountBadgeText: {
    color: 'white',
    position: 'absolute',
    left: 10,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  discountBadgeIcon: { height: 17, width: 110 },
  discountBadgeView: { position: 'absolute', top: 0 },
  specialPriceContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: -5,
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
    subcategory,
    sku,
    sell_online,
    is_prescription_required,
    MaxOrderQty,
    quantity,
    containerStyle,
    onPress,
    type_id,
    is_express,
    onPressAddToCart,
    onPressNotify,
    onPressAddQty,
    onPressSubtractQty,
    dc_availability,
    is_in_contract,
    image,
    merchandising,
  } = props;

  const isOutOfStock =
    dc_availability?.toLowerCase() === 'no' && is_in_contract?.toLowerCase() === 'no';

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
        style={[styles.addToCartViewStyle, !isOutOfStock && { paddingHorizontal: 23 }]}
        onPress={isOutOfStock ? onPressNotify : onPressAddToCart}
      >
        <Text style={theme.viewStyles.text('SB', 9, '#fc9916', 1, 24, 0)}>
          {isOutOfStock ? 'NOTIFY ME' : 'ADD'}
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
        {thumbnail || image ? (
          <Image
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: productsThumbnailUrl(thumbnail || image) }}
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
    return !isOutOfStock ? (
      <View style={styles.specialPriceContainer}>
        {!!special_price && [
          <Text style={styles.specialpriceTextStyle}>
            {'('}
            <Text style={{ textDecorationLine: 'line-through' }}>{`MRP ${
              string.common.Rs
            }${convertNumberToDecimal(price)}`}</Text>
            {')'}
          </Text>,
          <Text style={styles.offTextStyle}>{off_text}</Text>,
        ]}
      </View>
    ) : null;
  };

  const renderOutOfStock = () => {
    const discount = getDiscountPercentage(price, special_price);
    return isOutOfStock && sell_online ? (
      <Text style={styles.outOfStockStyle} numberOfLines={2}>
        {'Out Of Stock'}
      </Text>
    ) : (
      <Text style={styles.priceTextCollapseStyle}>
        {!discount && `MRP `}
        {string.common.Rs}
        {convertNumberToDecimal(discount ? special_price : price)}
      </Text>
    );
  };

  const renderCareCashback = () => {
    const finalPrice = Number(special_price) || price;
    const cashback = calculateCashbackForItem(Number(finalPrice), type_id, subcategory, sku);
    if (!!cashback && type_id) {
      return <CareCashbackBanner bannerText={`extra ${string.common.Rs}${cashback} cashback`} />;
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

  const renderMerchandisingTag = () => {
    const text = merchandising == 1 ? 'Apollo\'s Choice' : merchandising == 2 ? 'Recommended' : null;
    if (text) {
      return (
        <View style={styles.discountBadgeView}>
          <CircleDiscountBadge style={styles.discountBadgeIcon} />
          <Text style={styles.discountBadgeText}>{text}</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      {!!merchandising && renderMerchandisingTag()}
      {is_express === 'Yes' && renderExpressFlag()}
      {renderMedicineIcon()}
      <View style={[styles.medicineIconAndNameViewStyle]}>{renderTitleAndIcon()}</View>
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
