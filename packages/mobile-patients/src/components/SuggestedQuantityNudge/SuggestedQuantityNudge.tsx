import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { PhrCloseIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  getCleverTapCircleMemberValues,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

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

  const { pharmacyCircleAttributes } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();

  const { serverCartItems } = useShoppingCart();
  const [selectedQuantity, setSelectedQuantity] = useState<number>(+suggested_qty);
  const title = 'Recommended for monthly purchase';
  const mainText = 'It is recommended that you to buy ';
  const mainText1 = ' and stock this medicine for the next 30 days';
  const itemQuantity = packForm ? `${suggested_qty} ${packForm}s` : `${suggested_qty} items`;
  const maxQuantity = maxOrderQty ? maxOrderQty : +suggested_qty;
  const source = 'Chronic Upsell Nudge';

  useEffect(() => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CHRONIC_UPSELL_NUDGE] = {
      'SKU ID': sku,
      'Quantity shown': +suggested_qty,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHRONIC_UPSELL_NUDGE, eventAttributes);
  }, []);

  const onPressCloseBottomSheet = () => {
    setShownNudgeOnce(true);
    setShowSuggestedQuantityNudge(false);
  };

  const increaseQuantity = (selectedQuantity: number) => {
    if (selectedQuantity < maxQuantity) {
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
      <TouchableWithoutFeedback
        onPress={() => {
          onPressCloseBottomSheet();
        }}
      >
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
                      selectedQuantity === maxQuantity ? styles.greyedStyle : {},
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
                    if (
                      serverCartItems?.find(({ sku }) => sku?.toUpperCase() === sku?.toUpperCase())
                    ) {
                      const itemAddedFromNudge = serverCartItems?.find(
                        ({ sku }) => sku?.toUpperCase() === sku?.toUpperCase()
                      );
                      setUserActionPayload?.({
                        medicineOrderCartLineItems: [
                          {
                            medicineSKU: sku,
                            quantity: 1,
                          },
                        ],
                      });
                      setCurrentProductQuantityInCart(selectedQuantity);

                      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_ADD_TO_CART] = {
                        'product name': itemAddedFromNudge?.name,
                        'product id (SKUID)': sku,
                        'Category Name': undefined,
                        'Section Name': undefined,
                        'Category ID': undefined,
                        Price: itemAddedFromNudge?.price,
                        'Discounted Price': Number(itemAddedFromNudge?.sellingPrice) || undefined,
                        Quantity: selectedQuantity,
                        Source: source,
                        'Circle Member':
                          getCleverTapCircleMemberValues(
                            pharmacyCircleAttributes?.['Circle Membership Added']!
                          ) || undefined,
                        'Circle Membership Value':
                          pharmacyCircleAttributes?.['Circle Membership Value'] || undefined,
                      };
                      postCleverTapEvent(
                        CleverTapEventName.PHARMACY_ADD_TO_CART,
                        cleverTapEventAttributes
                      );
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
      </TouchableWithoutFeedback>
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
    top: 25,
  },
  closeIcon: {
    height: 22,
    width: 22,
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
