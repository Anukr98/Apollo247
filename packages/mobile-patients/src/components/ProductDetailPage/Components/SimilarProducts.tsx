import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ProductList } from '@aph/mobile-patients/src/components/Medicines/ProductList';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { ProductUpSellingCard } from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { PendingIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface SimilarProductsProps {
  heading: string;
  similarProducts: any;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  composition?: string | null;
  setShowSubstituteInfo?: (show: boolean) => void;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = (props) => {
  const { similarProducts, heading, composition, setShowSubstituteInfo } = props;
  const isSimilarProducts = heading === string.productDetailPage.SIMILAR_PRODUCTS;
  const isSubstituteProducts = heading === string.productDetailPage.PRODUCT_SUBSTITUTES;

  return (
    <View style={styles.cardStyle}>
      <View style={styles.flexRow}>
        <Text style={styles.heading}>{heading}</Text>
        {isSubstituteProducts && (
          <TouchableOpacity
            onPress={() => {
              setShowSubstituteInfo && setShowSubstituteInfo(true);
            }}
          >
            <PendingIcon style={styles.pendingIcon} />
          </TouchableOpacity>
        )}
      </View>
      {!!composition && (
        <Text style={styles.subHeading}>{`Alternate brands for ${composition}`}</Text>
      )}
      <ProductList
        data={similarProducts}
        Component={ProductUpSellingCard}
        navigation={props.navigation}
        addToCartSource={
          isSubstituteProducts
            ? 'PDP All Substitutes'
            : isSimilarProducts
            ? 'Similar Widget'
            : 'Pharmacy PDP'
        }
        movedFrom={ProductPageViewedSource.SIMILAR_PRODUCTS}
        contentContainerStyle={{ marginLeft: -18 }}
      />
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
    ...theme.viewStyles.text('R', 15, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  flexRow: {
    flexDirection: 'row',
  },
  pendingIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
    marginTop: 5,
    marginLeft: 7,
  },
});
