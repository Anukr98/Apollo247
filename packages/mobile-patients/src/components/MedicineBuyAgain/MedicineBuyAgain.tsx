import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import { MedicineListingProducts } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingProducts';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
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
  }> {}

export const MedicineBuyAgain: React.FC<Props> = ({ navigation }) => {
  const [products, setProducts] = useState<MedicineProduct[]>([]);
  const [isLoading, setLoading] = useState(true);

  const { showAphAlert } = useUIElements();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const ids = ['DOV0236', 'DOL0026', 'ALL0206'];
      const response = await medCartItemsDetailsApi(ids);
      setProducts(response?.data?.productdp || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      renderAlert();
    }
  };

  const renderAlert = (title?: string, message?: string) => {
    showAphAlert!({
      title: title || string.common.uhOh,
      description: message || 'Oops! seems like we are having an issue. Please try again.',
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
    </SafeAreaView>
  );
};

const { text, container } = theme.viewStyles;
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
});
