import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import {
  MedicineIcon,
  MedicineRxIcon,
  OfferIcon,
  ExpressDeliveryLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
  calculateCashbackForItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Divider, Image } from 'react-native-elements';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

export interface Props extends MedicineProduct {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAddQty: () => void;
  onPressSubtractQty: () => void;
  quantity: number;
  containerStyle?: TouchableOpacityProps['style'];
  onCartScreen?: boolean;
  onPressCashback?: () => void;
}

const ProductCardFun: React.FC<Props> = ({
  name,
  price,
  special_price,
  thumbnail,
  subcategory,
  sku,
  image,
  sell_online,
  is_prescription_required,
  MaxOrderQty,
  type_id,
  quantity,
  containerStyle,
  onPress,
  onPressAddToCart,
  onPressAddQty,
  onPressSubtractQty,
  is_express,
  onPressCashback,
}) => {
  const { circleSubscription } = useAppCommonData();
  const { isCircleSubscription } = useShoppingCart();
  const isPrescriptionRequired = is_prescription_required == 1;
  const discount = getDiscountPercentage(price, special_price);

  const renderPrice = () => {
    const mrp = 'MRP ';
    const strikeOffPrice = `(${mrp}${string.common.Rs}${convertNumberToDecimal(price)})`;
    const finalPrice = `${string.common.Rs}${convertNumberToDecimal(
      discount ? special_price : price
    )} `;
    return (
      <View style={styles.priceContainer}>
        {!discount && <Text style={styles.finalPrice}>{mrp}</Text>}
        <Text style={styles.finalPrice}>{finalPrice}</Text>
        {!!discount && (
          <View style={styles.specialPriceContainer}>
            <Text style={styles.priceStrikeOff}>{strikeOffPrice}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderAddToCartButton = () =>
    !quantity ? (
      <TouchableOpacity
        activeOpacity={0.5}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={styles.addToCart}
        onPress={onPressAddToCart}
      >
        <Text style={styles.addToCartText}>{'ADD TO CART'}</Text>
      </TouchableOpacity>
    ) : (
      <AddToCartButtons
        numberOfItemsInCart={quantity}
        maxOrderQty={MaxOrderQty}
        addToCart={onPressAddQty}
        removeItemFromCart={onPressSubtractQty}
        removeFromCart={onPressSubtractQty}
        containerStyle={{
          width: '49%',
        }}
      />
    );

  const renderNotForSaleTag = () => <NotForSaleBadge />;

  const renderImage = () => (
    <View
      style={{
        alignSelf: 'flex-start',
      }}
    >
      <Image
        placeholderStyle={styles.imagePlaceHolder}
        PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
        source={{ uri: productsThumbnailUrl(image || thumbnail) + '?imwidth=100' }}
        style={styles.image}
      />
    </View>
  );

  const renderTitle = () => (
    <Text numberOfLines={3} style={styles.title}>
      {name}
    </Text>
  );

  const renderDiscountTag = () =>
    !!discount && (
      <View style={styles.discountTagView}>
        <OfferIcon />
        <Text style={styles.discountTagText}>-{discount}%</Text>
      </View>
    );

  const renderExpressFlag = () => {
    return (
      <View style={[styles.expressContainer, { top: !!discount ? 40 : 10 }]}>
        <ExpressDeliveryLogo style={styles.expressLogo} />
      </View>
    );
  };

  const renderDivider = () => <Divider style={styles.divider} />;

  const renderCareCashback = () => {
    const finalPrice = discount ? special_price : price;
    const cashback = calculateCashbackForItem(Number(finalPrice), type_id, subcategory, sku);
    if (!!cashback) {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            if (!circleSubscription?._id || !isCircleSubscription) {
              // if not a circle member open circle webview
              onPressCashback && onPressCashback();
            }
          }}
        >
          <CareCashbackBanner bannerText={`extra ₹${cashback} cashback`} />
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  };

  const renderProductActions = () =>
    sell_online ? renderAddToCartButton() : renderNotForSaleTag();

  return (
    <TouchableOpacity activeOpacity={0.5} style={[styles.card, containerStyle]} onPress={onPress}>
      {renderDiscountTag()}
      {is_express === 'Yes' && renderExpressFlag()}
      {renderImage()}
      {renderTitle()}
      {renderDivider()}
      {renderPrice()}
      {renderCareCashback()}
      {renderProductActions()}
    </TouchableOpacity>
  );
};

export const ProductCard = React.memo(ProductCardFun);

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.card(12, 0),
    width: 168,
    height: 245,
  },
  image: {
    resizeMode: 'contain',
    height: 68,
    width: 68,
    marginBottom: 8,
  },
  title: {
    ...text('M', 14, '#01475B', 1, 17),
    height: 51,
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.3,
    width: '100%',
    marginTop: 10,
  },
  priceContainer: {
    paddingVertical: 5,
    flexDirection: 'row',
  },
  specialPriceContainer: {
    flexDirection: 'row',
  },
  finalPrice: {
    ...text('B', 13, '#01475b', 1, 24),
  },
  priceStrikeOff: {
    ...text('M', 13, '#01475b', 0.6, 24),
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
  addToCart: {
    position: 'absolute',
    bottom: 15,
    left: 10,
  },
  addToCartText: {
    ...text('B', 12, '#FC9916', 1, 18),
  },
  imagePlaceHolder: { backgroundColor: 'transparent' },
  discountTagView: {
    elevation: 20,
    position: 'absolute',
    right: 12,
    top: 0,
    zIndex: 1,
  },
  discountTagText: {
    ...theme.viewStyles.text('B', 10, '#ffffff', 1, 24),
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  expressContainer: {
    position: 'absolute',
    right: 12,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 25,
  },
});
