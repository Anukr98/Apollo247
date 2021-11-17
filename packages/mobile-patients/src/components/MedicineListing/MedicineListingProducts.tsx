import {
  ProductList,
  Props as ProductListProps,
} from '@aph/mobile-patients/src/components/Medicines/ProductList';
import {
  Props as SearchMedicineCardProps,
  SearchMedicineCard,
} from '@aph/mobile-patients/src/components/ui/SearchMedicineCard';
import { SearchMedicineGridCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineGridCard';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface Props extends ProductListProps {
  view: 'list' | 'grid';
  totalProducts?: number;
}

export const MedicineListingProducts: React.FC<Props> = ({
  data,
  view,
  totalProducts,
  contentContainerStyle,
  ...restOfProps
}) => {
  const isGridView = view == 'grid';

  const renderItem: ProductListProps['renderComponent'] = ({ item, index }) => {
    const props: SearchMedicineCardProps = {
      ...item,
      containerStyle: !isGridView
        ? styles.itemListContainer
        : index == data!.length - 1 && index % 2 == 0
        ? styles.itemGridLastContainer
        : index % 2 == 0
        ? styles.itemGridEvenContainer
        : styles.itemGridOddContainer,
    };
    return isGridView ? <SearchMedicineGridCard {...props} /> : <SearchMedicineCard {...props} />;
  };

  const renderItemSeparator = () => <View style={styles.itemSeparator} />;

  return (
    <ProductList
      data={data}
      totalProducts={totalProducts}
      renderComponent={renderItem}
      numColumns={isGridView ? 2 : 1}
      key={view}
      ItemSeparatorComponent={renderItemSeparator}
      contentContainerStyle={[styles.flatListContainer, contentContainerStyle]}
      horizontal={false}
      {...restOfProps}
    />
  );
};

const itemSpacing = 12;
const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: 20,
  },
  itemSeparator: { margin: 4 },
  itemListContainer: {
    marginHorizontal: itemSpacing,
  },
  itemGridEvenContainer: {
    marginLeft: itemSpacing,
  },
  itemGridOddContainer: {
    marginLeft: itemSpacing,
    marginRight: itemSpacing,
  },
  itemGridLastContainer: {
    marginLeft: itemSpacing,
    marginRight: itemSpacing * 3,
  },
});
