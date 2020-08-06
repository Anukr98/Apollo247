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
import { 
  DeleteIconOrange, 
  MinusIconOrange, 
  PlusIconOrange, 
  DeleteIconWhite, 
  MinusIconWhite, 
  PlusIconWhite 
} from '../ui/Icons';
import { theme } from '../../theme/theme';

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
  },
  addRemoveItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fc9916',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    backgroundColor: '#fff',
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
  }
})

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
};

export const AddToCartButtons: React.FC<AddToCartButtonsProps> = (props) => {

  const getDeleteIcon = () => {
    return (
      props.isSolidContainer ? 
        <DeleteIconWhite style={[localStyles.deleteIconStyle, props.deleteIconStyle]} /> : 
        <DeleteIconOrange style={localStyles.deleteIconStyle}/>
    );
  };

  const getMinusIcon = () => {
    return (
      props.isSolidContainer ?
      <MinusIconWhite style={[localStyles.minusIconStyle, props.minusIconStyle]} /> :
      <MinusIconOrange style={[
        localStyles.minusIconStyle,
        { opacity: props.numberOfItemsInCart > 0 ? 1 : 0.3 }
      ]}/>
    );
  };

  const getAddIcon = () => {
    return (
      props.isSolidContainer ?
      <PlusIconWhite style={[localStyles.plusIconStyle, props.plusIconStyle, { opacity: props.numberOfItemsInCart !== props.maxOrderQty ? 1 : 0.3 }]} /> :
      <PlusIconOrange style={[
        localStyles.plusIconStyle,
        { opacity: props.numberOfItemsInCart !== props.maxOrderQty ? 1 : 0.3 }
      ]}/>
    );
  };
  

  return (
    <View style={[localStyles.addRemoveItemContainer, props.containerStyle]}>
      {/* minus or delete button */}
      <TouchableOpacity 
        style={[
          localStyles.addRemoveButtonContainer,
          { 
            borderRightWidth: 1,
            borderColor: props.isSolidContainer ? '#f7f8f5' : '#fcb716',
          }
        ]}
        onPress={() => {
          (props.numberOfItemsInCart === 1) ? props.removeFromCart() : props.removeItemFromCart();
        }}
      >
        {
          props.numberOfItemsInCart === 1 ? 
          getDeleteIcon() : 
          getMinusIcon()
        }
      </TouchableOpacity>

      {/* quantity */}
      <View style={localStyles.quantityContainer}>
        <Text
          style={
            props.isSolidContainer ? {
              ...theme.viewStyles.text('M', 19, 'white', 1, 24),
              paddingLeft: 15,
              paddingRight: 15,
            } :
            {
              ...theme.viewStyles.text('M', 13, '#fc9916', 1, 24),
              textAlign: 'center',
            }
          }
        >{props.numberOfItemsInCart}</Text>
      </View>

      {/* add button */}
      <TouchableOpacity 
        style={[
          localStyles.addRemoveButtonContainer,
          { 
            borderLeftWidth: 1,
            padding: 0,
            borderColor: props.isSolidContainer ? '#f7f8f5' : '#fcb716',
          }
        ]}
        onPress={() => {
          if (props.numberOfItemsInCart !== props.maxOrderQty) props.addToCart('add');
        }}
      >
        {getAddIcon()}
      </TouchableOpacity>
    </View>
  );
};