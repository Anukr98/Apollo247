import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  MedicineIcon,
  MedicineRxIcon,
  DropdownGreen,
  DeleteIcon,
  DeleteBoldIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { getMaxQtyForMedicineItem } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CartItemCardProps {
  item: ShoppingCartItem;
  index?: number;
  onUpdateQuantity: (quantity: number) => void;
  onPressDelete: () => void;
  onPressProduct: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = (props) => {
  const { coupon } = useShoppingCart();
  const { item, onUpdateQuantity, onPressDelete, onPressProduct } = props;
  const [discountedPrice, setDiscountedPrice] = useState<any>(undefined);
  const [mrp, setmrp] = useState<number>(0);

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
      <View style={{ width: 50, justifyContent: 'center', opacity: !item.unserviceable ? 1 : 0.3 }}>
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
      <TouchableOpacity style={{ flex: 1 }} onPress={onPressProduct}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <View style={{ flex: 0.85 }}>
            <Text style={{ ...styles.itemName, opacity: !item.unserviceable ? 1 : 0.3 }}>
              {item.name}
            </Text>
            {item.mou && (
              <Text
                style={{ ...styles.info, opacity: !item.unserviceable ? 1 : 0.3 }}
              >{`(Pack of ${item.mou})`}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onPressDelete} style={styles.delete}>
            {!item.unserviceable ? <DeleteIcon /> : <DeleteBoldIcon />}
          </TouchableOpacity>
        </View>
        {renderLowerCont()}
      </TouchableOpacity>
    );
  };

  const renderLowerCont = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          {renderQuantity()}
          {!item.unserviceable && coupon && renderCoupon()}
        </View>
        {discountedPrice || discountedPrice == 0 ? renderPrice(discountedPrice) : renderPrice(mrp)}
      </View>
    );
  };

  const renderQuantity = () => {
    const opitons = Array.from({
      length: getMaxQtyForMedicineItem(item.maxOrderQty),
    }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });
    return (
      <View>
        <View style={{ ...styles.quantityContainer, opacity: !item.unserviceable ? 1 : 0.3 }}>
          <MaterialMenu
            options={opitons}
            selectedText={item.quantity!.toString()}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={(selectedQuantity) => {
              !item.unserviceable && onUpdateQuantity(selectedQuantity.value as number);
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
      </View>
    );
  };

  const renderCoupon = () => {
    return item.couponPrice || item.couponPrice == 0 ? (
      <View style={styles.coupon}>
        <Text style={styles.couponText}>{`${coupon?.coupon} Applied`}</Text>
      </View>
    ) : (
      <View style={{ ...styles.coupon, backgroundColor: 'rgba(137,0,0,0.2)' }}>
        <Text style={styles.couponText}>{`${coupon?.coupon} Not Applicable`}</Text>
      </View>
    );
  };

  function getDiscountPercent() {
    return (((mrp - discountedPrice) / mrp) * 100).toFixed(1);
  }
  const renderDiscount = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.dicountPercent}>{`${getDiscountPercent()}%off`}</Text>
        <Text style={styles.initialPrice}>{`₹${(mrp * item.quantity).toFixed(2)}`}</Text>
      </View>
    );
  };
  const renderSavings = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.Savings}>Savings</Text>
        <Text style={styles.savingsValue}>{`₹${((mrp - discountedPrice) * item.quantity).toFixed(
          2
        )}`}</Text>
      </View>
    );
  };
  const renderPrice = (price: number) => {
    return !item.unserviceable ? (
      <View style={{ alignItems: 'flex-end' }}>
        {(discountedPrice || discountedPrice == 0) && renderDiscount()}
        <Text style={styles.finalPrice}>{`₹${(price * item.quantity).toFixed(2)}`}</Text>
        {(discountedPrice || discountedPrice == 0) && renderSavings()}
      </View>
    ) : (
      renderNoStock()
    );
  };

  const renderNoStock = () => {
    return (
      <View style={styles.noStockCont}>
        <Text style={styles.noStockTxt}>Not in stock in your area</Text>
      </View>
    );
  };

  return (
    <View style={{ ...styles.card, backgroundColor: !item.unserviceable ? '#fff' : '#F0F1EC' }}>
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
    marginBottom: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    width: 75,
    borderWidth: 0.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderColor: '#979797',
  },
  quantity: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 17,
    textAlign: 'center',
  },
  initialPrice: {
    textDecorationLine: 'line-through',
    ...theme.fonts.IBMPlexSansRegular(11),
    color: '#02475B',
    opacity: 0.7,
  },
  dicountPercent: {
    ...theme.fonts.IBMPlexSansMedium(11),
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
  noStockTxt: {
    ...theme.fonts.IBMPlexSansRegular(9),
    lineHeight: 12,
    color: '#fff',
    marginHorizontal: 5,
  },
  noStockCont: {
    backgroundColor: '#01475B',
    borderRadius: 2,
    height: 18,
    justifyContent: 'center',
  },
});
