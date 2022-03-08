import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { DeleteIconWhite, MinusIconWhite, PlusIconWhite } from '../ui/Icons';
import { theme } from '../../theme/theme';
import { useShoppingCart } from '../ShoppingCartProvider';

const localStyles = StyleSheet.create({
  addRemoveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderColor: '#fc9916',
    paddingRight: 6,
    paddingLeft: 6,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 6,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  addRemoveItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fc9916',
    borderRadius: 5,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    backgroundColor: '#fc9916',
    elevation: 5,
  },
  deleteIconStyle: {
    width: 10,
    height: 14,
  },
  minusIconStyle: {
    resizeMode: 'contain',
    width: 10,
    height: 20,
  },
  plusIconStyle: {
    width: 10,
    height: 10,
  },
});

export interface AddToCartButtonsProps {
  numberOfItemsInCart: number;
  maxOrderQty: number;
  addToCart: (action?: string) => void;
  removeItemFromCart: () => void;
  removeFromCart: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  deleteIconStyle?: StyleProp<ImageStyle>;
  plusIconStyle?: StyleProp<ImageStyle>;
  minusIconStyle?: StyleProp<ImageStyle>;
  isSolidContainer?: boolean;
}

export const AddToCartButtons: React.FC<AddToCartButtonsProps> = (props) => {
  const { serverCartLoading } = useShoppingCart();
  const getDeleteIcon = () => {
    return <DeleteIconWhite style={[localStyles.deleteIconStyle, props.deleteIconStyle]} />;
  };

  const getMinusIcon = () => {
    return <MinusIconWhite style={[localStyles.minusIconStyle, props.minusIconStyle]} />;
  };

  const getAddIcon = () => {
    return (
      <PlusIconWhite
        style={[
          localStyles.plusIconStyle,
          props.plusIconStyle,
          { opacity: props.numberOfItemsInCart !== props.maxOrderQty ? 1 : 0.3 },
        ]}
      />
    );
  };

  const isSingleQty = props.numberOfItemsInCart === 1;

  return (
    <View style={[localStyles.addRemoveItemContainer, props.containerStyle]}>
      {/* minus or delete button */}
      <TouchableOpacity
        activeOpacity={0.5}
        style={localStyles.addRemoveButtonContainer}
        onPress={isSingleQty ? props.removeFromCart : props.removeItemFromCart}
        disabled={serverCartLoading}
      >
        {isSingleQty ? getDeleteIcon() : getMinusIcon()}
      </TouchableOpacity>

      {/* quantity */}
      <View
        style={[
          localStyles.quantityContainer,
          props.numberOfItemsInCart >= 10 && { paddingRight: 1.8, paddingLeft: 1.8 },
        ]}
      >
        <Text
          style={
            props.isSolidContainer
              ? {
                  ...theme.viewStyles.text('M', 19, 'white', 1, 24),
                  paddingLeft: 16,
                  paddingRight: 16,
                }
              : { ...theme.viewStyles.text('M', 14, 'white', 1, 24) }
          }
        >
          {props.numberOfItemsInCart}
        </Text>
      </View>

      {/* add button */}
      <TouchableOpacity
        activeOpacity={0.5}
        style={localStyles.addRemoveButtonContainer}
        disabled={serverCartLoading}
        onPress={() => {
          if (props.numberOfItemsInCart !== props.maxOrderQty) props.addToCart('add');
        }}
      >
        {getAddIcon()}
      </TouchableOpacity>
    </View>
  );
};
