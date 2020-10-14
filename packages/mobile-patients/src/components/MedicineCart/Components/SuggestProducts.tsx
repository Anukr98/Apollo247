import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ProductList } from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { ProductUpSellingCard } from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { NavigationScreenProps } from 'react-navigation';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';

export interface SuggestProductsProps extends NavigationScreenProps {
  products: MedicineProduct[];
}

export const SuggestProducts: React.FC<SuggestProductsProps> = (props) => {
  const { products, navigation } = props;

  const renderHeader = () => {
    return (
      <View style={styles.amountHeader}>
        <Text style={styles.amountHeaderText}>YOU SHOULD ALSO ADD</Text>
      </View>
    );
  };

  const renderProducts = () => {
    return (
      <ProductList
        data={products}
        Component={ProductUpSellingCard}
        navigation={navigation}
        addToCartSource={'Cart'}
        movedFrom={ProductPageViewedSource.CART}
      />
    );
  };

  return products?.length ? (
    <View>
      {renderHeader()}
      {renderProducts()}
    </View>
  ) : null;
};
const styles = StyleSheet.create({
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
