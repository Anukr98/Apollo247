import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { PhrCloseIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface SuggestedQuantityNudgeProps {
  suggested_qty: string | null;
  sku: string;
  packForm: string;
  maxOrderQty: number;
  setShownNudgeOnce: (showNudge: boolean) => void;
  showSuggestedQuantityNudge: boolean;
  setShowSuggestedQuantityNudge: (showNudge: boolean) => void;
  setCurrentProductQuantityInCart: (currentQuantity: number) => void;
}

export const SuggestedQuantityNudge: React.FC<SuggestedQuantityNudgeProps> = (props) => {
  const {
    suggested_qty,
    sku,
    packForm,
    maxOrderQty,
    setShownNudgeOnce,
    showSuggestedQuantityNudge,
    setShowSuggestedQuantityNudge,
    setCurrentProductQuantityInCart,
  } = props;

  const { updateCartItem } = useShoppingCart();

  const { cartItems } = useShoppingCart();
  const [selectedQuantity, setSelectedQuantity] = useState<number>(+suggested_qty);
  const title = 'Recommended for monthly purchase';
  const mainText = 'It is recommended that you to buy ';
  const mainText1 = ' and stock this medicine for the next 30 days';
  const itemQuantity = packForm ? `${suggested_qty} ${packForm}s` : `${suggested_qty} items`;

  const onPressCloseBottomSheet = () => {
    setShownNudgeOnce(true);
    setShowSuggestedQuantityNudge(false);
  };

  const increaseQuantity = (selectedQuantity: number) => {
    if (
      (!!maxOrderQty && selectedQuantity < maxOrderQty) ||
      (!!suggested_qty && selectedQuantity < +suggested_qty)
    ) {
      setSelectedQuantity(selectedQuantity + 1);
    }
  };

  const decreaseQuantity = (selectedQuantity: number) => {
    if (selectedQuantity > 2) {
      setSelectedQuantity(selectedQuantity - 1);
    }
  };

  return (
    <Modal isVisible={showSuggestedQuantityNudge} backdropOpacity={0.3} style={styles.modal}>
      <View style={styles.mainView}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.crossContainer}>
            <TouchableOpacity
              onPress={() => {
                onPressCloseBottomSheet();
              }}
            >
              <PhrCloseIcon style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalHeaderContainer}>
            <Text numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
          </View>
          <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>
              {mainText}
              <Text style={styles.itemQuantityStyle}>{itemQuantity}</Text>
              <Text style={styles.mainText}>{mainText1}</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.cartContainer}>
              <TouchableOpacity
                onPress={() => {
                  decreaseQuantity(selectedQuantity);
                }}
                style={styles.buttonStyles}
              >
                <Text
                  style={[
                    styles.buttonTextStyles,
                    selectedQuantity === 2 ? styles.greyedStyle : {},
                  ]}
                >
                  -
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonStyles}>
                <Text style={[styles.buttonTextStyles, styles.quantityStyle]}>
                  {selectedQuantity}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  increaseQuantity(selectedQuantity);
                }}
                style={[styles.buttonStyles, styles.lastButtonStyles]}
              >
                <Text
                  style={[
                    styles.buttonTextStyles,
                    selectedQuantity === maxOrderQty || (!!suggested_qty && +suggested_qty)
                      ? styles.greyedStyle
                      : {},
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                onPress={() => {
                  onPressCloseBottomSheet();
                  if (cartItems.find(({ id }) => id?.toUpperCase() === sku?.toUpperCase())) {
                    updateCartItem?.({
                      id: sku,
                      quantity: selectedQuantity,
                    });
                    setCurrentProductQuantityInCart(selectedQuantity);
                  }
                }}
              >
                {packForm ? (
                  <Text style={styles.addButtonTextStyles}>
                    Add {selectedQuantity} {packForm}(s)
                  </Text>
                ) : (
                  <Text style={styles.addButtonTextStyles}>Add {selectedQuantity} Item(s)</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  mainView: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    height: 192,
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  crossContainer: {
    position: 'absolute',
    right: 14,
    top: 29,
  },
  closeIcon: {
    height: 16,
    width: 16,
  },
  modalHeaderContainer: {
    width: 248,
    height: 22,
    marginLeft: 20,
    marginTop: 27,
    flexDirection: 'row',
  },
  titleText: {
    ...theme.fonts.IBMPlexSansBold(14),
    fontWeight: '600',
    color: '#01475B',
    lineHeight: 22,
  },
  mainTextContainer: {
    height: 42,
    width: 318,
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  mainText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    fontWeight: '400',
    color: '#01475B',
    lineHeight: 18,
  },
  itemQuantityStyle: {
    ...theme.fonts.IBMPlexSansBold(12),
    fontWeight: '600',
    color: '#01475B',
    lineHeight: 15.6,
  },
  cartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: 40,
    width: 123,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#FC9916',
    marginLeft: 20,
  },
  lastButtonStyles: {
    borderRightWidth: 0,
  },
  buttonStyles: {
    width: 41,
    borderColor: '#FC9916',
    borderRightWidth: 0.5,
    justifyContent: 'center',
  },
  buttonTextStyles: {
    ...theme.fonts.IBMPlexSansRegular(16),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    color: '#FC9916',
  },
  greyedStyle: {
    color: '#808080',
  },
  quantityStyle: {
    fontWeight: '700',
  },
  addButtonContainer: {
    height: 40,
    width: 154,
    marginRight: 18,
    borderRadius: 5,
    backgroundColor: '#FC9916',
    justifyContent: 'center',
  },
  addButtonTextStyles: {
    ...theme.fonts.IBMPlexSansRegular(13),
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
