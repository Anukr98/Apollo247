import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getMaxQtyForMedicineItem } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { DropdownBlueDown } from '@aph/mobile-patients/src/components/ui/Icons';
import { Substitutes } from '@aph/mobile-patients/src/components/Medicines/Components/Substitutes';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { renderPDPComponentsShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

export interface ProductQuantityProps {
  maxOrderQuantity: number;
  isInStock: boolean;
  packForm: string;
  packSize: string;
  unit: string;
  sku: string;
  onAddCartItem: () => void;
  name: string;
  productQuantity: number;
  setProductQuantity: (qty: number) => void;
  setShowAddedToCart: (show: boolean) => void;
  isSellOnline: boolean;
  isBanned: boolean;
  productForm: string;
  onNotifyMeClick: () => void;
  isPharma: boolean;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  setShowSubstituteInfo?: (show: boolean) => void;
}

export const ProductQuantity: React.FC<ProductQuantityProps> = (props) => {
  const {
    maxOrderQuantity,
    isInStock,
    packForm,
    packSize,
    unit,
    sku,
    onAddCartItem,
    name,
    productQuantity,
    setProductQuantity,
    setShowAddedToCart,
    isSellOnline,
    isBanned,
    productForm,
    onNotifyMeClick,
    isPharma,
    setShowSubstituteInfo,
  } = props;

  const { productSubstitutes } = useShoppingCart();

  const renderQuantityView = () => {
    if (sku) {
      return (
        <View style={styles.flexRow}>
          {isSellOnline && renderQuantity()}
          {isSellOnline && !!packSize && !!productForm && !!packForm && renderPackSize()}
        </View>
      );
    } else {
      return renderPDPComponentsShimmer(styles.quantityShimmer);
    }
  };

  const renderQuantity = () => {
    let maxQuantity: number = getMaxQtyForMedicineItem(maxOrderQuantity);
    const opitons = Array.from({
      length: maxQuantity,
    }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });

    return (
      <View style={styles.quantityContainer}>
        <MaterialMenu
          options={opitons}
          selectedText={productQuantity.toString()}
          selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
          onPress={(selectedQuantity) => {
            setProductQuantity(selectedQuantity.value as number);
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.quantity}>{`${productQuantity} ${packForm}`}</Text>
            </View>
            <DropdownBlueDown />
          </View>
        </MaterialMenu>
      </View>
    );
  };

  const renderPackSize = () => (
    <Text
      style={theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35)}
    >{`  ${packSize}${unit} ${productForm} in 1 ${packForm}`}</Text>
  );

  const renderCartCTA = () => {
    const ctaText = isInStock ? 'ADD TO CART' : 'NOTIFY WHEN IN STOCK';
    if (isSellOnline && !isBanned) {
      return (
        <View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              isInStock ? onAddToCart() : onNotifyMeClick();
            }}
            activeOpacity={0.7}
            style={isInStock ? styles.addToCartCta : styles.notifyCta}
          >
            <Text style={isInStock ? styles.addToCartText : styles.notifyText}>{ctaText}</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const onAddToCart = () => {
    setShowAddedToCart(true);
    setTimeout(() => {
      setShowAddedToCart(false);
    }, 2000);
    onAddCartItem();
  };

  return (
    <View style={{ paddingHorizontal: 15 }}>
      {renderQuantityView()}
      {!!productSubstitutes && productSubstitutes?.length > 0 && (
        <Substitutes
          sku={sku}
          name={name}
          onPressAddToCart={onAddCartItem}
          isProductInStock={isInStock}
          isAlternative={!isPharma}
          navigation={props.navigation}
          setShowSubstituteInfo={setShowSubstituteInfo}
        />
      )}
      {!!sku ? renderCartCTA() : renderPDPComponentsShimmer(styles.ctaShimmer)}
    </View>
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    width: 95,
    borderWidth: 0.5,
    borderRadius: 3,
    justifyContent: 'center',
    borderColor: '#979797',
    paddingLeft: 7,
  },
  quantity: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 25, 0.35),
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  addToCartCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FCB716',
    paddingVertical: 7,
    marginTop: 10,
  },
  addToCartText: {
    ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 25, 0.35),
    textAlign: 'center',
  },
  notifyCta: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCB716',
    paddingVertical: 7,
    marginTop: 10,
  },
  notifyText: {
    ...theme.viewStyles.text('B', 14, '#FCB716', 1, 25, 0.35),
    textAlign: 'center',
  },
  quantityShimmer: {
    height: 30,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
  },
  ctaShimmer: {
    height: 40,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },
});
