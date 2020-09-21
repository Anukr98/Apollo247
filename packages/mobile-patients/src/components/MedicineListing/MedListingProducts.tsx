import {
  Props as SearchMedicineCardProps,
  SearchMedicineCard,
} from '@aph/mobile-patients/src/components/ui/SearchMedicineCard';
import { SearchMedicineGridCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineGridCard';
import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, StyleSheet, View } from 'react-native';

export interface MedListingProductProps extends SearchMedicineCardProps {}
type ListProps = FlatListProps<MedListingProductProps>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  view: 'list' | 'grid';
}

export const MedListingProducts: React.FC<Props> = ({
  data,
  view,
  contentContainerStyle,
  ...restOfProps
}) => {
  const isGridView = view == 'grid';

  const renderItem = ({ item, index }: ListRenderItemInfo<SearchMedicineCardProps>) => {
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
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={({ sku }) => `${sku}`}
      keyboardShouldPersistTaps="always"
      bounces={false}
      showsVerticalScrollIndicator={false}
      numColumns={isGridView ? 2 : 1}
      key={view}
      removeClippedSubviews={true}
      ItemSeparatorComponent={renderItemSeparator}
      contentContainerStyle={[styles.flatListContainer, contentContainerStyle]}
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
