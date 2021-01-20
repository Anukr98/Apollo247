import { Events } from '@aph/mobile-patients/src/components/MedicineBuyAgain';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import { MedicineListingProducts } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingProducts';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { medCartItemsDetailsApi, MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

export interface Props
  extends NavigationScreenProps<{
    movedFrom?: AppRoutes;
    skuList?: string[];
  }> {}

export const MedicineBuyAgain: React.FC<Props> = ({ navigation }) => {
  const skuList = navigation.getParam('skuList') || [];
  const [products, setProducts] = useState<MedicineProduct[]>([]);
  const [isLoading, setLoading] = useState(true);
  const { showAphAlert } = useUIElements();
  const { cartItems } = useShoppingCart();
  const { buyAgainPageViewed } = Events.Events;

  useEffect(() => {
    fetchProducts();
    buyAgainPageViewed({});
  }, []);

  const fetchProducts = async () => {
    try {
      if (!skuList.length) {
        renderAlert();
        setLoading(false);
        renderAlert('', string.sorryNoProductsHere);
      }
      const productsResponse = await medCartItemsDetailsApi(skuList);
      setProducts(productsResponse?.data?.productdp?.filter(({ sku, id }) => sku && id) || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      renderAlert();
    }
  };

  const renderAlert = (title?: string, message?: string) => {
    showAphAlert!({
      title: title || string.common.uhOh,
      description: message || string.genericError,
    });
  };

  const renderHeader = () => {
    return <MedicineListingHeader navigation={navigation} movedFrom={'home'} />;
  };

  const renderProducts = () => {
    return (
      <MedicineListingProducts
        data={isLoading ? [] : products}
        ListFooterComponent={renderLoading()}
        navigation={navigation}
        addToCartSource={'Pharmacy List'}
        movedFrom={ProductPageViewedSource.BUY_AGAIN}
        productPageViewedEventProps={{
          SectionName: 'Buy Again',
        }}
        view={'list'}
      />
    );
  };

  const renderProceedToCheckout = () => {
    const count = cartItems.length;
    return (
      <View style={styles.proceedToCheckout}>
        <Button
          onPress={() => navigation.navigate(AppRoutes.MedicineCart)}
          title={
            count
              ? string.proceedToCheckoutItems.replace('{0}', `${count}`)
              : string.proceedToCheckout
          }
          disabled={!count}
        />
      </View>
    );
  };

  const renderLoading = () => {
    return isLoading ? <ActivityIndicator color="green" size="large" /> : null;
  };

  const renderSelectFromItems = () => {
    return (
      <View style={styles.selectFromItemsContainer}>
        <Text style={styles.selectFromItemsText}>{string.selectFromOrderedItems}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderSelectFromItems()}
      {renderProducts()}
      {renderProceedToCheckout()}
    </SafeAreaView>
  );
};

const { text, card, container } = theme.viewStyles;
const { LIGHT_BLUE, WHITE } = theme.colors;
const styles = StyleSheet.create({
  selectFromItemsContainer: {
    marginBottom: 15,
    backgroundColor: WHITE,
  },
  selectFromItemsText: {
    ...text('M', 13, LIGHT_BLUE, 0.8),
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  proceedToCheckout: {
    ...card(0, 0, 0),
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
