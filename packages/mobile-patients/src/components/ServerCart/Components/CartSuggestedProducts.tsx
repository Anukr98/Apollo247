import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  ProductList,
  Props as ProductListProps,
} from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { ProductUpSellingCard } from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { NavigationScreenProps } from 'react-navigation';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CartSuggestProductsProps extends NavigationScreenProps {}

export const CartSuggestProducts: React.FC<CartSuggestProductsProps> = (props) => {
  const { navigation } = props;
  const { cartSuggestedProducts } = useShoppingCart();

  const renderHeader = () => {
    return (
      <View style={styles.amountHeader}>
        <Text style={styles.amountHeaderText}>PEOPLE ALSO BOUGHT</Text>
      </View>
    );
  };

  const renderComponent: ProductListProps['renderComponent'] = ({ item }) => (
    <ProductUpSellingCard {...item} onCartScreen={true} />
  );

  const renderProducts = () => {
    return (
      <ProductList
        data={cartSuggestedProducts}
        renderComponent={renderComponent}
        navigation={navigation}
        addToCartSource={'Pharmacy Cart'}
        movedFrom={ProductPageViewedSource.CART}
      />
    );
  };

  return cartSuggestedProducts?.length ? (
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
