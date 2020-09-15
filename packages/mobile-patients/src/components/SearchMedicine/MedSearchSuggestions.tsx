import {
  MedicineSearchSuggestionItem,
  MedicineSearchSuggestionItemProps,
} from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, StyleSheet } from 'react-native';

type ListProps = FlatListProps<MedicineSearchSuggestionItemProps>;

export interface Props extends Omit<ListProps, 'renderItem'> {}

export const MedSearchSuggestions: React.FC<Props> = ({ data, style, ...restOfProps }) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<MedicineSearchSuggestionItemProps>) => {
    const showSeparator = index + 1 !== data!.length;
    return (
      <MedicineSearchSuggestionItem style={styles.item} showSeparator={showSeparator} {...item} />
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(_, index) => `${index}`}
      keyboardShouldPersistTaps="always"
      bounces={false}
      showsVerticalScrollIndicator={false}
      style={[styles.flatList, style]}
      {...restOfProps}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {
    paddingTop: 5,
    maxHeight: 266,
  },
  item: { marginHorizontal: 20 },
});
