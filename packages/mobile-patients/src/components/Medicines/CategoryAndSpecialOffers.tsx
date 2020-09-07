import { DropdownGreen, Invoice } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface Props {
  onPressShopByCategory: () => void;
  onPressSpecialOffers: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CategoryAndSpecialOffers: React.FC<Props> = ({
  onPressShopByCategory,
  onPressSpecialOffers,
  containerStyle,
}) => {
  const renderShopByCategory = () => {
    return (
      <TouchableOpacity style={styles.shopByCategoryContainer} onPress={onPressShopByCategory}>
        <Text style={styles.shopByCategoryText}>Shop category</Text>
        <DropdownGreen style={styles.dropdownGreen} />
      </TouchableOpacity>
    );
  };

  const renderSpecialOffers = () => {
    return (
      <TouchableOpacity style={styles.specialOffersContainer} onPress={onPressSpecialOffers}>
        {/* TODO: Replace the icon once updated by designer */}
        <Invoice style={styles.invoice} />
        <Text style={styles.specialOffersText}>Special offers</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {renderShopByCategory()}
      {renderSpecialOffers()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  shopByCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#979797',
    borderRadius: 2,
    marginRight: 10,
  },
  specialOffersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopByCategoryText: {
    ...theme.viewStyles.text('M', 14, '#01475B'),
    paddingLeft: 10,
  },
  specialOffersText: {
    ...theme.viewStyles.text('M', 14, '#01475B'),
  },
  invoice: {
    height: 20,
    width: 20,
    paddingLeft: 5,
  },
  dropdownGreen: {
    tintColor: '#01475B',
  },
});
