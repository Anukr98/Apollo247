import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import { MedicineListingProducts } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingProducts';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GET_PREVIOUS_ORDERS_SKUS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPreviousOrdersSkus,
  getPreviousOrdersSkusVariables,
  getPreviousOrdersSkus_getPreviousOrdersSkus_SkuDetails,
} from '@aph/mobile-patients/src/graphql/types/getPreviousOrdersSkus';
import { medCartItemsDetailsApi, MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
export interface Props
  extends NavigationScreenProps<{
    movedFrom?: AppRoutes;
  }> {}
type SkuDetails = getPreviousOrdersSkus_getPreviousOrdersSkus_SkuDetails;

export const MedicineBuyAgain: React.FC<Props> = ({ navigation }) => {
  const [products, setProducts] = useState<MedicineProduct[]>([]);
  const [isLoading, setLoading] = useState(true);

  const { showAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const skuResponse = await client.mutate<
        getPreviousOrdersSkus,
        getPreviousOrdersSkusVariables
      >({
        mutation: GET_PREVIOUS_ORDERS_SKUS,
        variables: {
          previousOrdersSkus: {
            patientId: currentPatient?.id,
            fromDate: moment()
              .subtract(6, 'months')
              .toDate()
              .getTime(),
            toDate: new Date().getTime(),
          },
        },
        fetchPolicy: 'no-cache',
      });
      const skuDetails = skuResponse?.data?.getPreviousOrdersSkus?.SkuDetails as SkuDetails[];
      const skuArray = skuDetails?.map(({ sku }) => sku!) || [];
      const productsResponse = await medCartItemsDetailsApi(skuArray);
      setProducts(productsResponse?.data?.productdp || []);
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
