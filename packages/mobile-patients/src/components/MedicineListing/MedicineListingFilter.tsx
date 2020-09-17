import {
  ArrowRight,
  CheckedIcon,
  CheckUnselectedIcon,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProductsResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CheckBox, ListItem } from 'react-native-elements';
import {} from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '../ui/Button';
import { Header } from '../ui/Header';

type Filter = MedicineProductsResponse['filters'][0];
type SelectedFilters = { [key: string]: string[] };

export interface Props extends NavigationScreenProps {
  filters: Filter[];
  onApplyFilters: (appliedFilters: SelectedFilters) => void;
}

export const MedicineListingFilter: React.FC<Props> = ({ filters, onApplyFilters }) => {
  const [selectedOption, setSelectedOption] = useState<Filter | null>(filters[0]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const isFiltersApplied = Object.keys(selectedFilters).length;
  console.log(selectedFilters);

  const renderFilterOption = (filter: Filter) => {
    const isSelected = filter.attribute === selectedOption?.attribute;
    const onPress = () => setSelectedOption(filter);
    const highlightView = (
      <View
        style={[styles.highlight, { backgroundColor: isSelected ? '#00B38E' : 'transparent' }]}
      />
    );

    return (
      <ListItem
        key={filter.name}
        leftElement={highlightView}
        title={filter.name}
        rightIcon={isSelected ? <ArrowRight /> : <ArrowRight />}
        onPress={onPress}
        bottomDivider
        containerStyle={styles.optionsContainer}
        titleStyle={isSelected ? styles.selectedOptionText : styles.optionText}
        Component={TouchableOpacity}
      />
    );
  };

  const renderFilterSubOptions = (filter: Filter) => {
    return filter.values?.map(({ label, value }) => {
      const { select_type, attribute } = filter;
      const isMulti = select_type == 'multi';
      const checkedIcon = isMulti ? <CheckedIcon /> : <RadioButtonIcon />;
      const uncheckedIcon = isMulti ? <CheckUnselectedIcon /> : <RadioButtonUnselectedIcon />;
      const subOptions = selectedFilters[filter.attribute];
      const isSelected = !!subOptions?.find((subOption) => subOption == value);

      const onPress = () => {
        const updatedFilter = isSelected
          ? subOptions?.filter((subOption) => subOption != value)
          : isMulti
          ? [...(subOptions || []), value]
          : [value];
        setSelectedFilters({ ...selectedFilters, [attribute]: updatedFilter });
      };

      return (
        <CheckBox
          key={value}
          title={label}
          checked={isSelected}
          onPress={onPress}
          checkedIcon={checkedIcon}
          uncheckedIcon={uncheckedIcon}
          containerStyle={styles.checkBoxContainer}
          textStyle={isSelected ? styles.selectedCheckBoxText : styles.checkBoxText}
        />
      );
    });
  };

  const renderInScrollView = (children: React.ReactNode) => {
    return (
      <ScrollView
        removeClippedSubviews={true}
        bounces={false}
        contentContainerStyle={styles.scrollView}
      >
        {children}
      </ScrollView>
    );
  };

  const renderButton = () => {
    return (
      <Button
        title={'APPLY'}
        style={styles.button}
        titleTextStyle={styles.buttonTitle}
        onPress={() => onApplyFilters(selectedFilters)}
        disabled={isFiltersApplied ? false : true}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'FILTER BY'}
        rightText={{
          title: isFiltersApplied ? 'CLEAR ALL' : '',
          onPress: () => setSelectedFilters({}),
          style: styles.headerRightText,
        }}
        leftIcon="close"
        container={styles.header}
      />
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      <View style={styles.horizontalDivider} />
      <View style={styles.container}>
        {renderInScrollView(filters.map(renderFilterOption))}
        <View style={styles.verticalDivider} />
        {renderInScrollView(selectedOption && renderFilterSubOptions(selectedOption))}
      </View>
      <View style={styles.horizontalDivider} />
      {renderButton()}
    </SafeAreaView>
  );
};

const { container } = theme.viewStyles;
const { text } = theme.viewStyles;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  scrollView: {},
  verticalDivider: { backgroundColor: '#000', opacity: 0.05, width: 5, height: '100%' },
  horizontalDivider: { backgroundColor: '#000', opacity: 0.05, height: 5 },
  checkBoxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
    margin: 0,
    paddingVertical: 15,
  },
  checkBoxText: {
    ...text('M', 12, '#02475B', 0.9),
  },
  selectedCheckBoxText: {
    ...text('SB', 12, '#02475B'),
  },
  optionsContainer: {
    backgroundColor: 'transparent',
    paddingLeft: 0,
    paddingRight: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
    borderStartColor: 'red',
  },
  optionText: {
    ...text('SB', 14, '#02475B'),
  },
  selectedOptionText: {
    ...text('SB', 14, '#00B38E'),
  },
  highlight: {
    height: '220%',
    width: 5,
  },
  button: { borderRadius: 0, height: 45 },
  buttonTitle: {
    ...text('B', 17, '#fff'),
  },
  headerRightText: {
    color: '#FCB716',
  },
  header: {
    borderBottomWidth: 0,
  },
});
