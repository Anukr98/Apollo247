import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  MedicineIcon,
  MedicineRxIcon,
  DropdownGreen,
  DeleteBoldIcon,
  DeleteIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { getMaxQtyForMedicineItem } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
export interface CartItemCard2Props {
  item: ShoppingCartItem;
  index?: number;
  onUpdateQuantity: (quantity: number) => void;
  onPressDelete: () => void;
}

export const CartItemCard2: React.FC<CartItemCard2Props> = (props) => {
  const { item, onUpdateQuantity, onPressDelete } = props;
  const [discountedPrice, setDiscountedPrice] = useState<any>(undefined);
  const [mrp, setmrp] = useState<number>(0);
  const itemAvailable = !item.unserviceable && !item.unavailableOnline;

  useEffect(() => {
    setmrp(item.price);
    item.couponPrice || item.couponPrice == 0
      ? setDiscountedPrice(item.couponPrice)
      : item.specialPrice || item.specialPrice == 0
      ? setDiscountedPrice(item.specialPrice)
      : setDiscountedPrice(undefined);
  }, [item]);

  function getImageUrl(item: ShoppingCartItem) {
    let imageUrl = item.prescriptionRequired
      ? ''
      : item.thumbnail && !item.thumbnail.includes('/default/placeholder')
      ? item.thumbnail.startsWith('http')
        ? item.thumbnail
        : `${AppConfig.Configuration.IMAGES_BASE_URL}${item.thumbnail}`
      : '';
    return imageUrl;
  }

  const renderImage = () => {
    const imageUrl = getImageUrl(item);
    return (
      <View style={{ width: 50, justifyContent: 'center' }}>
        {imageUrl ? (
          <Image
            PlaceholderContent={item.prescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: imageUrl }}
            style={{ height: 40, width: 40 }}
            resizeMode="contain"
          />
        ) : item.prescriptionRequired ? (
          <MedicineRxIcon style={{ marginLeft: 10 }} />
        ) : (
          <MedicineIcon style={{ marginLeft: 10 }} />
        )}
      </View>
    );
  };

  const renderProduct = () => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 5,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.mou && <Text style={styles.info}>{`(Pack of ${item.mou})`}</Text>}
          </View>
          {renderQuantity()}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {discountedPrice || discountedPrice == 0
            ? renderPrice(discountedPrice)
            : renderPrice(mrp)}
          {/* {renderDelete()} */}
        </View>
      </View>
    );
  };

  const renderQuantity = () => {
    let maxQuantity: number = getMaxQtyForMedicineItem(item.maxOrderQty);
    if (!!item.isFreeCouponProduct && item.quantity === 1) {
      maxQuantity = 1;
    }
    const opitons = Array.from({
      length: maxQuantity,
    }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });
    return (
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>{`QTY : ${item.quantity}`}</Text>
      </View>
    );
    /*
    return !item?.isFreeCouponProduct || item?.quantity > 1 ? (
      <View style={{ ...styles.quantityContainer, opacity: itemAvailable ? 1 : 0.3 }}>
        <MaterialMenu
          options={opitons}
          selectedText={item.quantity!.toString()}
          selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
          onPress={(selectedQuantity) => {
            itemAvailable && onUpdateQuantity(selectedQuantity.value as number);
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.quantity}>{`QTY : ${item.quantity}`}</Text>
            </View>
            <DropdownGreen />
          </View>
        </MaterialMenu>
      </View>
    ) : (
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>{`QTY : ${item.quantity}`}</Text>
      </View>
    );
    */
  };

  function getDiscountPercent() {
    return (((mrp - discountedPrice) / mrp) * 100).toFixed(1);
  }
  const renderDiscount = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.mrp}>{'MRP'}</Text>
        <Text style={styles.initialPrice}>{`₹${(mrp * item.quantity).toFixed(2)}`}</Text>
        <Text style={styles.dicountPercent}>{`${getDiscountPercent()}%off`}</Text>
      </View>
    );
  };

  const renderPrice = (price: number) => {
    const discount = !!(discountedPrice || discountedPrice == 0);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.finalPrice}>{`${discount ? '' : 'MRP'} ₹${(
          price * item.quantity
        ).toFixed(2)}`}</Text>
        {discount && renderDiscount()}
      </View>
    );
  };

  const renderDelete = () => {
    return (
      <TouchableOpacity onPress={onPressDelete} style={styles.delete}>
        {itemAvailable ? (
          (!item?.isFreeCouponProduct || item?.quantity > 1) && <DeleteIcon />
        ) : (
          <DeleteBoldIcon />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      {renderImage()}
      {renderProduct()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 9,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 14,
    minHeight: 95,
  },
  itemName: {
    color: 'rgb(1,28,36)',
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
  },
  info: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.8,
  },
  delete: {
    flex: 0.15,
    marginBottom: 3,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  quantityContainer: {
    height: 23,
    borderWidth: 0.5,
    borderRadius: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    borderColor: '#979797',
    flexDirection: 'row',
  },
  quantity: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 17,
    textAlign: 'center',
  },
  initialPrice: {
    textDecorationLine: 'line-through',
    ...theme.fonts.IBMPlexSansRegular(13),
    color: '#02475B',
    opacity: 0.7,
    marginRight: 6,
  },
  mrp: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: '#02475B',
    opacity: 0.7,
    marginHorizontal: 6,
  },
  dicountPercent: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 20,
    color: '#00B38E',
    marginRight: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  finalPrice: {
    color: '#02475B',
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 19,
    letterSpacing: 0.33,
  },
  Savings: {
    color: '#02475B',
    opacity: 0.7,
    ...theme.fonts.IBMPlexSansRegular(9),
    lineHeight: 20,
    marginRight: 3,
  },
  savingsValue: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 20,
    letterSpacing: 0.25,
    color: '#00B38E',
    opacity: 0.7,
  },
  coupon: {
    marginTop: 3,
    backgroundColor: 'rgba(0, 179, 142, 0.2)',
    borderRadius: 2,
  },
  couponText: {
    ...theme.fonts.IBMPlexSansRegular(9),
    lineHeight: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    color: '#01475B',
  },
});
