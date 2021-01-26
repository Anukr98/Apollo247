import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { AddIcon, RemoveIcon, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '../../DiagnosticsCartProvider';

export interface DiagnosticsSearchSuggestionItemProps {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressRemoveFromCart: () => void;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any; //define the interface
}

export const DiagnosticsSearchSuggestionItem: React.FC<DiagnosticsSearchSuggestionItemProps> = (
  props
) => {
  const { cartItems } = useDiagnosticsCart();
  const { data } = props;
  const name = data?.diagnostic_item_name || '';
  const imageUri = false;
  const isAddedToCart = !!cartItems?.find(
    (item) => Number(item?.id) == Number(data?.diagnostic_item_id)
  );

  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={styles.nameAndPriceViewStyle}>
        <View style={{ width: '87%' }}>
          <Text numberOfLines={2} style={styles.testNameText}>
            {nameFormater(name, 'default')}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>{renderAddToCartView()}</View>
      </View>
    );
  };

  const renderIconOrImage = () => {
    return (
      <View style={styles.iconOrImageContainerStyle}>
        {imageUri ? (
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: imageUri }}
            style={styles.imageIcon}
            resizeMode="contain"
          />
        ) : (
          <TestsIcon />
        )}
      </View>
    );
  };

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={isAddedToCart ? props.onPressRemoveFromCart : props.onPressAddToCart}
      >
        {isAddedToCart ? <RemoveIcon /> : <AddIcon />}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, props.style]}
      onPress={props.onPress}
    >
      <View style={styles.containerStyle} key={data.name}>
        <View style={styles.iconAndDetailsContainerStyle}>
          {renderIconOrImage()}
          <View style={{ width: 16 }} />
          {renderNamePriceAndInStockStatus()}
        </View>
        {props.showSeparator ? <Spearator /> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {},
  iconAndDetailsContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9.5,
  },
  iconOrImageContainerStyle: {
    width: 40,
  },
  nameAndPriceViewStyle: {
    flex: 1,
    flexDirection: 'row',
  },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: { ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0), width: '95%' },
  imageIcon: { height: 40, width: 40 },
});
