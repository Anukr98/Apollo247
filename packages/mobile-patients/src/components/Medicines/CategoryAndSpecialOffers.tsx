import { DropdownGreen, SpecialOffers } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
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
        <Text style={styles.shopByCategoryText}>Shop by Category</Text>
        <DropdownGreen style={styles.dropdownGreen} />
      </TouchableOpacity>
    );
  };

  const renderSpecialOffers = () => {
    return (
      <TouchableOpacity style={styles.specialOffersContainer} onPress={onPressSpecialOffers}>
        <SpecialOffers style={styles.specialOffers} />
        <Text style={styles.specialOffersText}>{string.specialOffers}</Text>
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
    marginRight: 15,
  },
  specialOffersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopByCategoryText: {
    ...theme.viewStyles.text('M', 15, '#01575B'),
    paddingLeft: 10,
    paddingVertical: 5,
  },
  specialOffersText: {
    ...theme.viewStyles.text('M', 15, '#01475B'),
    paddingLeft: 5,
    paddingVertical: 5,
  },
  specialOffers: {
    height: 20,
    width: 20,
  },
  dropdownGreen: {
    tintColor: '#01475B',
  },
});
