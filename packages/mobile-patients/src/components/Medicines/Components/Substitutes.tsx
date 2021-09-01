import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  FasterSubstitutes,
  MedicineRxIcon,
  MedicineIcon,
  PrescriptionRequiredIcon,
  ExpressDeliveryLogo,
  DownOrange,
  UpOrange,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  productsThumbnailUrl,
  getMaxQtyForMedicineItem,
  nameFormater,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Image } from 'react-native-elements';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { pharmaSubstitution_pharmaSubstitution_substitutes } from '@aph/mobile-patients/src/graphql/types/pharmaSubstitution';
import { QuantityButton } from '@aph/mobile-patients/src/components/ui/QuantityButton';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  CleverTapEvents,
  CleverTapEventName,
  ProductPageViewedSource,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import moment from 'moment';

export interface SubstitutesProps {
  sku: string;
  name: string;
  onPressAddToCart: (
    item: pharmaSubstitution_pharmaSubstitution_substitutes,
    isFromFastSubstitutes: boolean
  ) => void;
  isProductInStock: boolean;
  isAlternative: boolean; // value will be true for pharma products, and false for non pharma products
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
}

export const Substitutes: React.FC<SubstitutesProps> = (props) => {
  const { cartItems, removeCartItem, updateCartItem, productSubstitutes } = useShoppingCart();
  const { sku, name, onPressAddToCart, isProductInStock, isAlternative } = props;
  const [showSubstitues, setShowSubstitues] = useState<boolean>(!isProductInStock);

  useEffect(() => {
    setShowSubstitues(!isProductInStock);
  }, [isProductInStock]);

  useEffect(() => {
    if (showSubstitues) {
      fireCleverTapEvent();
    }
  }, [showSubstitues]);

  const renderHeading = () => (
    <TouchableOpacity
      onPress={() => {
        if (isProductInStock) {
          setShowSubstitues(!showSubstitues);
        }
      }}
    >
      <View style={styles.flexRow}>
        <FasterSubstitutes style={styles.iconStyle} />
        <Text style={[styles.heading, isProductInStock ? { width: '75%' } : {}]}>
          {isProductInStock
            ? `View FASTER AVAILABLE ${
                isAlternative ? `ALTERNATIVES` : `SUBSTITUTES`
              } for this product !`
            : `Below are the ${
                isAlternative ? `ALTERNATIVES` : `SUBSTITUTES`
              } available for this product you might want to look at!`}
        </Text>
        {isProductInStock &&
          (showSubstitues ? (
            <UpOrange style={styles.arrowIcon} />
          ) : (
            <DownOrange style={styles.arrowIcon} />
          ))}
      </View>
      {!isAlternative && (
        <Text style={styles.subHeading}>
          Substitutes are products with same molecular composition
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderImage = (image: string, isPrescriptionRequired: boolean) => (
    <View style={styles.imageContainer}>
      {isPrescriptionRequired && (
        <View style={styles.rxSymbolContainer}>
          <PrescriptionRequiredIcon style={styles.rxSymbol} />
        </View>
      )}
      <Image
        placeholderStyle={styles.imagePlaceHolder}
        PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
        source={{ uri: productsThumbnailUrl(image) }}
        style={styles.image}
      />
    </View>
  );

  const renderTitle = (name: string) => (
    <Text numberOfLines={3} style={styles.title}>
      {name}
    </Text>
  );

  const renderAddToCartView = (item: any) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => onPressAddToCart(item, true)}>
        <Text style={theme.viewStyles.text('SB', 12, '#fc9916', 1, 24, 0)}>{'ADD TO CART'}</Text>
      </TouchableOpacity>
    );
  };

  const getItemQuantity = (id: string) => {
    const foundItem = cartItems?.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };

  const onPressSubstract = (sku: string) => {
    const q = getItemQuantity(sku);
    q == 1 ? removeCartItem?.(sku) : updateCartItem?.({ id: sku, quantity: q - 1 });
  };

  const onPressAdd = (sku: string, maxOrderQty: number) => {
    const q = getItemQuantity(sku);
    if (q == getMaxQtyForMedicineItem(maxOrderQty)) return;
    updateCartItem!({ id: sku, quantity: q + 1 });
  };

  const renderQuantityView = (sku: string, maxOrderQty: number) => {
    return (
      <View style={styles.quantityView}>
        <QuantityButton
          text={'-'}
          onPress={() => {
            onPressSubstract(sku);
          }}
        />
        <Text style={theme.viewStyles.text('B', 14, '#fc9916', 1, 24, 0)}>
          {getItemQuantity(sku)}
        </Text>
        <QuantityButton
          text={'+'}
          onPress={() => {
            onPressAdd(sku, maxOrderQty);
          }}
        />
      </View>
    );
  };

  const renderExpress = (tatDuration: string) => (
    <View style={styles.expressContainer}>
      <ExpressDeliveryLogo style={styles.expressLogo} />
      <Text
        style={theme.viewStyles.text('SB', 13, '#02475B', 1, 25, 0.35)}
      >{`within ${tatDuration} hours`}</Text>
    </View>
  );

  const renderDeliveryDateTime = (tat: string) => (
    <View>
      <Text style={theme.viewStyles.text('M', 12, '#01475b', 1, 15, 0)}>Delivery By</Text>
      <Text style={theme.viewStyles.text('M', 12, '#01475b', 1, 15, 0)}>
        {moment(new Date(tat), AppConfig.Configuration.MED_DELIVERY_DATE_TAT_API_FORMAT).format(
          'D MMM | hh:mm A'
        )}
      </Text>
    </View>
  );

  const renderPrice = (price: number, tatPrice: number) => {
    const isTatPriceLess = tatPrice < price;
    const percentageDiscount = isTatPriceLess ? ((price - tatPrice) / price) * 100 : 0;
    return (
      <View>
        {isTatPriceLess ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.priceStrikeOff}>{`MRP ${string.common.Rs}${price}`}</Text>
            <Text style={styles.discount}>{`${percentageDiscount.toFixed(1)}% off`}</Text>
            <Text style={styles.price}>
              {string.common.Rs}
              {tatPrice}
            </Text>
          </View>
        ) : (
          <Text style={styles.price}>
            {string.common.Rs}
            {price}
          </Text>
        )}
      </View>
    );
  };

  const renderSubstitutes = () => {
    return productSubstitutes?.map((substitute) => {
      const {
        sku,
        manufacturer,
        image,
        is_prescription_required,
        name,
        tat,
        tatDuration,
        price,
        tatPrice,
        MaxOrderQty,
      } = substitute;
      const quantity = getItemQuantity(sku);
      const manufacturerText = nameFormater(manufacturer, 'title');
      const is_express =
        parseInt(tatDuration?.[0]) <= AppConfig.Configuration.EXPRESS_MAXIMUM_HOURS;
      return (
        <TouchableOpacity
          onPress={() => {
            props.navigation.push(AppRoutes.ProductDetailPage, {
              urlKey: substitute?.url_key,
              sku: substitute?.sku,
              movedFrom: ProductPageViewedSource.PDP_FAST_SUSBTITUTES,
            });
          }}
          style={styles.substituteCard}
        >
          {renderImage(image, is_prescription_required == '1')}
          <View style={styles.cardBody}>
            <View style={styles.nameManufacturer}>
              <View>
                {renderTitle(name)}
                <Text style={styles.manufacturerText}>{manufacturerText}</Text>
              </View>
              {is_express ? renderExpress(tatDuration[0]) : renderDeliveryDateTime(tat)}
            </View>
            <View style={{ justifyContent: 'space-between' }}>
              {renderPrice(price, tatPrice)}
              {!isProductInStock &&
                (!!quantity
                  ? renderQuantityView(sku, MaxOrderQty)
                  : renderAddToCartView(substitute))}
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const fireCleverTapEvent = () => {
    let cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_FAST_SUBSTITUTES_VIEWED] = {
      'Product Code': sku || '',
      'Product Name': name || '',
      'Stock type': isProductInStock ? 'In stock' : 'Out of stock',
      Type: isAlternative ? 'Pharma' : 'Non-Pharma',
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_FAST_SUBSTITUTES_VIEWED,
      cleverTapEventAttributes
    );
  };

  return (
    !!productSubstitutes?.length && (
      <View style={styles.cardStyle}>
        {renderHeading()}
        {showSubstitues && renderSubstitutes()}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 20,
    marginHorizontal: 1,
    paddingVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('M', 13, '#F79521', 1, 16, 0.35),
    width: '80%',
    marginTop: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 12.5, '#02475B', 1, 15, 0),
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flexRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  iconStyle: {
    resizeMode: 'contain',
    width: 60,
    height: 40,
    marginRight: 5,
  },
  separator: {
    height: 1,
    opacity: 0.7,
    borderColor: theme.colors.LIGHT_BLUE,
    borderWidth: 0.6,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  imagePlaceHolder: { backgroundColor: 'transparent' },
  image: {
    resizeMode: 'contain',
    height: 60,
    width: 60,
    marginBottom: 8,
  },
  title: {
    ...theme.viewStyles.text('M', 14, '#01475B', 1, 17),
  },
  rxSymbolContainer: {
    position: 'absolute',
    right: 2,
    zIndex: 9,
  },
  rxSymbol: {
    resizeMode: 'contain',
    width: 15,
    height: 15,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 55,
    height: 20,
    marginRight: 3,
  },
  substituteCard: {
    minHeight: 110,
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    borderColor: theme.colors.LIGHT_BLUE,
    borderTopWidth: 0.4,
    borderRadius: 1,
    marginTop: 4,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceStrikeOff: {
    ...theme.viewStyles.text('M', 13, '#01475b', 1, 20, 0.35),
    textDecorationLine: 'line-through',
    color: '#01475b',
    opacity: 0.6,
    textAlign: 'right',
  },
  quantityView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 25,
  },
  arrowIcon: {
    resizeMode: 'contain',
    width: 18,
    height: 22,
  },
  imageContainer: {
    alignSelf: 'flex-start',
    marginRight: 13,
  },
  expressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  discount: {
    textAlign: 'right',
    ...theme.viewStyles.text('M', 13, '#00B38E', 1, 20, 0.35),
  },
  price: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
    textAlign: 'right',
  },
  nameManufacturer: { justifyContent: 'space-between', flex: 0.9 },
  manufacturerText: {
    ...theme.viewStyles.text('R', 12, '#01475B', 1, 17),
    marginTop: 2,
    marginBottom: 7,
  },
});
