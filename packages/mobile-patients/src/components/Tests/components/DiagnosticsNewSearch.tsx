import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { AddIcon, RemoveIconOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { isEmptyObject, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
export interface DiagnosticsNewSearchProps {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressRemoveFromCart: () => void;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
}

export const DiagnosticsNewSearch: React.FC<DiagnosticsNewSearchProps> = (props) => {
  const { cartItems, modifiedOrderItemIds, modifiedOrder } = useDiagnosticsCart();
  const { data } = props;
  const name = data?.diagnostic_item_name || '';
  const imageUri = false;
  const isAddedToCart = !!cartItems?.find(
    (item) => Number(item?.id) == Number(data?.diagnostic_item_id)
  );

  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={{ width: '100%' }}>
        <View style={styles.nameAndPriceViewStyle}>
          <View style={{ width: '85%' }}>
            <Text numberOfLines={2} style={styles.testNameText}>
              {name}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>{renderAddToCartView()}</View>
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    const isModifyOrder = !!modifiedOrder && !isEmptyObject(modifiedOrder);
    const getExisitingOrderItems = isModifyOrder
      ? !!modifiedOrderItemIds && modifiedOrderItemIds
      : [];
    const isAlreadyPartOfOrder =
      getExisitingOrderItems?.length > 0 &&
      getExisitingOrderItems?.find((id: number) => Number(id) == Number(data?.diagnostic_item_id));
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={
          isAlreadyPartOfOrder
            ? () => {}
            : isAddedToCart
            ? props.onPressRemoveFromCart
            : props.onPressAddToCart
        }
      >
        {isAlreadyPartOfOrder ? (
          <RemoveIconOrange />
        ) : isAddedToCart ? (
          <RemoveIconOrange />
        ) : (
          <AddIcon />
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
          <View style={{ width: 16 }} />
          {renderNamePriceAndInStockStatus()}
        </View>
        {props.showSeparator ? <Spearator /> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    width: '100%',
    justifyContent: 'space-between',
    margin: 0,
  },
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
  numberPlate: { ...theme.viewStyles.text('SB', 10, theme.colors.SKY_BLUE, 1, 18) },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: { ...theme.viewStyles.text('M', 12, '#01475b', 1, 24, 0), width: '95%' },
  imageIcon: { height: 40, width: 40 },
});
