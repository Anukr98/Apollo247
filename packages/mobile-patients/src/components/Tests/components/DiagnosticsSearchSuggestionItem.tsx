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
  const parameterData = data?.diagnostic_inclusions_test_parameter_data?.filter(
    (item: { mandatoryValue: boolean }) => {
      return item?.mandatoryValue == true;
    }
  );
  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={styles.detailContainer}>
        <View style={styles.nameAndPriceViewStyle}>
          <View style={{ width: '70%'}}>
            <Text numberOfLines={2} style={styles.testNameText}>
              {nameFormater(name, 'default')}
            </Text>
          </View>

          <Text style={styles.categories}>
            {data?.diagnostic_inclusions?.length > 1 ? 'in Packages' : 'in Tests'}
          </Text>
        </View>
        <View style={styles.nameAndPriceViewStyle}>
          {parameterData?.length ? (
            <Text style={styles.numberPlate}>{`${parameterData?.length} ${
              parameterData?.length > 1 ? `Tests` : `Test`
            } included`}</Text>
          ) : <Text></Text>}
          <View style={styles.cartViewContainer}>{renderAddToCartView()}</View>
        </View>
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
          {isAddedToCart ? (
            <Text style={styles.removeCta}>REMOVE</Text>
          ) : (
            <Text style={styles.addCta}>ADD TO CART</Text>
          )}
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
    width: '10%',
  },
  nameAndPriceViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  detailContainer: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  numberPlate: { ...theme.viewStyles.text('R', 10, '#01475b', 1, 18)},
  addCta: { ...theme.viewStyles.text('B', 14, '#FCA317', 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'right',
    width:'auto',
  },
  removeCta: { ...theme.viewStyles.text('B', 14, '#FF774B', 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  categories: {
    ...theme.viewStyles.text('SB', 12, '#66909C', 1, 20, 0),
    textAlign:'right',
    width: '30%',
    alignSelf: 'flex-start'
  },
  cartViewContainer: {
    alignSelf: 'center',
    width: '30%'
  },
  testNameText: { ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0), width: '95%' },
  imageIcon: { height: 40, width: 40 },
});
