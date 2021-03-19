import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getMaxQtyForMedicineItem } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { DropdownBlueDown } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

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
  deliveryError?: string;
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
    deliveryError,
  } = props;
  const { cartItems, updateCartItem } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();

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
            // itemAvailable && onUpdateQuantity(selectedQuantity.value as number);
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
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            isInStock ? onAddToCart() : onNotifyMeClick(name);
          }}
          activeOpacity={0.7}
          style={isInStock ? styles.addToCartCta : styles.notifyCta}
        >
          <Text style={isInStock ? styles.addToCartText : styles.notifyText}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onNotifyMeClick = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const onAddToCart = () => {
    setShowAddedToCart(true);
    setTimeout(() => {
      setShowAddedToCart(false);
    }, 2000);
    const existingCartItem = cartItems?.filter((item) => item?.id === sku);
    if (existingCartItem?.length) {
      existingCartItem?.[0]?.quantity = productQuantity;
      // updateCartItem && updateCartItem({ id: sku, quantity });
    } else {
      onAddCartItem();
    }
  };

  return (
    <View>
      <View style={styles.flexRow}>
        {renderQuantity()}
        {!!packSize && !!productForm && !!packForm && renderPackSize()}
      </View>
      {isSellOnline && !isBanned && renderCartCTA()}
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
});
