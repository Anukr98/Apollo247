import {
  MedicineSearchSuggestionItem,
  MedicineSearchSuggestionItemProps,
} from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import React from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export interface Props {
  products: MedicineSearchSuggestionItemProps[];
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const MedSearchSuggestions: React.FC<Props> = ({ products, style, containerStyle }) => {
  const renderItem = ({ item, index }: ListRenderItemInfo<MedicineSearchSuggestionItemProps>) => {
    const showSeparator = index + 1 !== products.length;
    return (
      <MedicineSearchSuggestionItem
        style={styles.medicineSearchSuggestionItem}
        showSeparator={showSeparator}
        {...item}
      />
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(_, index) => `${index}`}
      keyboardShouldPersistTaps="always"
      bounces={false}
      showsVerticalScrollIndicator={false}
      style={[styles.flatList, style]}
      contentContainerStyle={containerStyle}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {
    paddingTop: 5,
    maxHeight: 266,
  },
  medicineSearchSuggestionItem: { marginHorizontal: 20 },
});
