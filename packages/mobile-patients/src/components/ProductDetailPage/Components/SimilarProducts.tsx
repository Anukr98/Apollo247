import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ProductList } from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { ProductUpSellingCard } from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface SimilarProductsProps {
  heading: string;
  similarProducts: any;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = (props) => {
  const { similarProducts, heading } = props;
  const isSimilarProducts = heading === string.productDetailPage.SIMILAR_PRODUCTS;

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.heading}>{heading}</Text>
      <ProductList
        data={similarProducts}
        Component={ProductUpSellingCard}
        navigation={props.navigation}
        addToCartSource={isSimilarProducts ? 'Similar Widget' : 'Pharmacy PDP'}
        movedFrom={ProductPageViewedSource.SIMILAR_PRODUCTS}
      />
      {/* <TouchableOpacity onPress={() => {}} style={styles.viewAllCTA}>
        <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 25, 0.35)}>
          VIEW ALL PRODUCTS
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  flexRow: {
    flexDirection: 'row',
  },
  viewAllCTA: {
    ...theme.viewStyles.cardViewStyle,
    paddingVertical: 10,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
