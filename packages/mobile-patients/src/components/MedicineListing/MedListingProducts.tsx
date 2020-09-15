import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, StyleSheet, View, Text } from 'react-native';

export interface MedListingProductProps extends MedicineProduct {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAdd: () => void;
  onPressSubstract: () => void;
  quantity: number;
}
type ListProps = FlatListProps<MedListingProductProps>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  view: 'list' | 'grid';
}

export const MedListingProducts: React.FC<Props> = ({
  data,
  view,
  style,
  contentContainerStyle,
  ...restOfProps
}) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<MedicineProduct>) => {
    return (
      <View style={{ height: 100, width: '100%', backgroundColor: 'blue' }}>
        <Text style={{ color: 'white', fontSize: 30 }}>{index}</Text>
        <Text style={{ color: 'white', fontSize: 14 }}>
          {item.sku}, {item.name}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={({ sku }) => `${sku}`}
      keyboardShouldPersistTaps="always"
      bounces={false}
      showsVerticalScrollIndicator={false}
      numColumns={view == 'grid' ? 2 : 1}
      key={view}
      removeClippedSubviews={true}
      style={[styles.flatList, style]}
      ItemSeparatorComponent={() => <View style={{ margin: 4 }} />}
      contentContainerStyle={[styles.flatListContainer, contentContainerStyle]}
      {...restOfProps}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {},
  flatListContainer: {
    marginHorizontal: 20,
  },
  item: {},
});
