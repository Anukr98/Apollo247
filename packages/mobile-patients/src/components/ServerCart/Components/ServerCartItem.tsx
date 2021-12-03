import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Image } from 'react-native-elements';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  MedicineIcon,
  MedicineRxIcon,
  DropdownGreen,
  DeleteIcon,
  DeleteBoldIcon,
  PrescriptionRequiredIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  getMaxQtyForMedicineItem,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { saveCart_saveCart_data_medicineOrderCartLineItems } from '@aph/mobile-patients/src/graphql/types/saveCart';
import { CouponApplicable } from '@aph/mobile-patients/src/graphql/types/globalTypes';

export interface ServerCartItemProps {
  item: saveCart_saveCart_data_medicineOrderCartLineItems;
  index?: number;
  onUpdateQuantity: (quantity: number) => void;
  onPressDelete: () => void;
  onPressProduct: () => void;
}

const { width } = Dimensions.get('window');

export const ServerCartItem: React.FC<ServerCartItemProps> = (props) => {
  const { isCircleCart, cartCoupon } = useShoppingCart();
  const couponApplied = cartCoupon?.coupon && cartCoupon?.valid;
  const { item, onUpdateQuantity, onPressDelete, onPressProduct } = props;
  const [discountedPrice, setDiscountedPrice] = useState<any>(undefined);
  const [mrp, setmrp] = useState<number>(item?.price || 0);
  const itemAvailable = item?.isShippable && item?.sellOnline;

  useEffect(() => {
    setmrp(item?.price);
    item?.isCouponApplicable == CouponApplicable.APPLIED && item?.couponDiscountPrice != 0
      ? setDiscountedPrice(item?.couponDiscountPrice)
      : item?.sellingPrice !== item?.price
      ? setDiscountedPrice(item?.sellingPrice)
      : setDiscountedPrice(undefined);
  }, [item]);

  const renderImage = () => {
    const imageUrl = productsThumbnailUrl(item?.thumbnail!);
    const isPrescriptionRequired = item?.isPrescriptionRequired == '1';
    return (
      <View style={[styles.imageContainer, { opacity: itemAvailable ? 1 : 0.3 }]}>
        {isPrescriptionRequired && (
          <View style={styles.rxSymbolContainer}>
            <PrescriptionRequiredIcon style={styles.rxSymbol} />
          </View>
        )}
        <Image
          PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
          placeholderStyle={{ backgroundColor: 'transparent' }}
          source={{ uri: imageUrl }}
          style={{ height: 75, width: 75 }}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderProduct = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
          <View style={{ flex: 0.85 }}>
            <TouchableOpacity onPress={onPressProduct}>
              <Text style={{ ...styles.itemName, opacity: itemAvailable ? 1 : 0.3 }}>
                {item?.name}
              </Text>
            </TouchableOpacity>
            {item?.mou && (
              <Text
                style={{ ...styles.info, opacity: itemAvailable ? 1 : 0.3 }}
              >{`(Pack of ${item?.mou})`}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onPressDelete} style={styles.delete}>
            {renderDelete()}
          </TouchableOpacity>
        </View>
        {renderLowerCont()}
      </View>
    );
  };

  const renderDelete = () => {
    return itemAvailable ? (
      (!item?.freeProduct || item?.quantity > 1) && <DeleteIcon />
    ) : (
      <DeleteBoldIcon />
    );
  };

  const renderLowerCont = () => {
    return (
      <View style={styles.lowerCountContainer}>
        <View style={styles.lowerCountInnerView}>
          {renderQuantity()}
          {itemAvailable && !item?.freeProduct && !!couponApplied && renderCoupon()}
          {isCircleCart && renderCareCashback()}
        </View>
        {!item?.freeProduct
          ? discountedPrice || discountedPrice == 0
            ? renderPrice(discountedPrice)
            : renderPrice(mrp)
          : item?.quantity > 1
          ? renderPrice(discountedPrice)
          : renderFree()}
      </View>
    );
  };

  const renderCareCashback = () => {
    const cashback = item?.cashback;
    if (cashback && !couponApplied) {
      return (
        <CareCashbackBanner
          bannerText={`Extra ₹${cashback?.toFixed(2)} Cashback`}
          textStyle={styles.careText}
          logoStyle={{
            resizeMode: 'contain',
            width: 40,
            height: 30,
          }}
        />
      );
    } else {
      return <></>;
    }
  };

  const renderFree = () => {
    return (
      <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), lineHeight: 20, color: '#00B38E' }}>
        FREE
      </Text>
    );
  };

  const renderQuantity = () => {
    let maxQuantity: number = getMaxQtyForMedicineItem(item?.maxOrderQty);
    if (!!item?.freeProduct && item?.quantity === 1) {
      maxQuantity = 1;
    }
    const opitons = Array.from({
      length: maxQuantity,
    }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });
    return !item?.freeProduct || item?.quantity > 1 ? (
      <View style={{ ...styles.quantityContainer, opacity: itemAvailable ? 1 : 0.3 }}>
        <MaterialMenu
          options={opitons}
          selectedText={item?.quantity!.toString()}
          selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
          onPress={(selectedQuantity) => {
            itemAvailable && onUpdateQuantity(selectedQuantity.value as number);
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.quantity}>{`QTY : ${item?.quantity}`}</Text>
            </View>
            <DropdownGreen />
          </View>
        </MaterialMenu>
      </View>
    ) : (
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>{`QTY : ${item?.quantity}`}</Text>
      </View>
    );
  };

  const renderCoupon = () => {
    return item?.isCouponApplicable == CouponApplicable.APPLIED ||
      item?.couponDiscountPrice ||
      item?.freeProduct ? (
      <View style={styles.coupon}>
        <Text style={styles.couponText}>{`${cartCoupon?.coupon} Applied`}</Text>
      </View>
    ) : (
      <View style={{ ...styles.coupon, backgroundColor: 'rgba(137,0,0,0.2)' }}>
        <Text style={styles.couponText}>
          {item?.isCouponApplicable == CouponApplicable.NOT_APPLICABLE
            ? `${cartCoupon?.coupon} Not Applicable`
            : 'Item already at higher discount'}
        </Text>
      </View>
    );
  };

  function getDiscountPercent() {
    return (((mrp - discountedPrice) / mrp) * 100).toFixed(1);
  }
  const renderDiscount = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!item?.freeProduct && (
          <Text style={styles.dicountPercent}>{`${getDiscountPercent()}%off`}</Text>
        )}
        <Text style={styles.mrp}>{`MRP `}</Text>
        <Text style={styles.initialPrice}>{`₹${(mrp * item?.quantity).toFixed(2)}`}</Text>
      </View>
    );
  };
  const renderSavings = () => {
    const savingsAmount =
      item?.freeProduct && item?.quantity > 1
        ? discountedPrice
        : ((mrp - discountedPrice) * item?.quantity).toFixed(2);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.Savings}>Savings</Text>
        <Text style={styles.savingsValue}>{`₹${savingsAmount}`}</Text>
      </View>
    );
  };
  const renderPrice = (price: number) => {
    const discount = !!(discountedPrice || discountedPrice == 0);
    const finalAmount =
      item?.freeProduct && item?.quantity > 1
        ? (price * item?.quantity - discountedPrice).toFixed(2)
        : (price * item?.quantity).toFixed(2);
    return itemAvailable ? (
      <View style={{ alignItems: 'flex-end' }}>
        {discount && renderDiscount()}
        <Text style={styles.finalPrice}>{`${discount ? '' : 'MRP '} ₹${finalAmount}`}</Text>
        {discount && renderSavings()}
      </View>
    ) : (
      renderNoStock()
    );
  };

  const renderNoStock = () => {
    return (
      <View style={styles.noStockCont}>
        <Text style={styles.noStockTxt}>
          {!item?.sellOnline ? string.notForSale : string.notInStockInYourArea}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ ...styles.card, backgroundColor: itemAvailable ? '#fff' : '#F0F1EC' }}>
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
    minHeight: 110,
  },
  itemName: {
    color: 'rgb(1,28,36)',
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
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
  mrp: {
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
  careText: {
    ...theme.viewStyles.text('M', 10, '#00A0E3', 1, 15),
    paddingVertical: 7,
  },
  lowerCountContainer: {
    flexDirection: 'row',
    justifyContent: width <= 360 ? 'space-around' : 'space-between',
  },
  lowerCountInnerView: {
    flex: 1,
  },
  rxSymbolContainer: {
    position: 'absolute',
    top: 50,
    left: 25,
    zIndex: 9,
  },
  rxSymbol: {
    resizeMode: 'contain',
    width: 15,
    height: 15,
  },
  imageContainer: {
    width: 80,
    justifyContent: 'center',
    marginRight: 7,
  },
});
