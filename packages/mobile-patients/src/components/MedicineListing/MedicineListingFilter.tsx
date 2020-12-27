import { Accordion } from '@aph/mobile-patients/src/components/MedicineListing/Accordion';
import {
  Filter,
  getSavedFilter,
  saveFilter,
  SelectedFilters,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListing';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  ArrowRightGreen,
  CheckedIcon,
  CheckUnselectedIcon,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  formatFilters,
  getProductsByCategoryApi,
  MedFilter,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isEqual } from 'lodash';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge, CheckBox, ListItem, Overlay, OverlayProps } from 'react-native-elements';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface Props extends Omit<OverlayProps, 'children'> {
  filters: Filter[];
  selectedFilters: SelectedFilters;
  onApplyFilters: (appliedFilters: SelectedFilters) => void;
  onClose: () => void;
}

export const MedicineListingFilter: React.FC<Props> = ({
  filters: _filters,
  selectedFilters: _selectedFilters,
  onApplyFilters,
  onClose,
  ...overlayProps
}) => {
  const { pinCode } = useShoppingCart();
  const categoryFilterKeys = ['category', '__categories'];
  const brandFilterKeys = ['brand', 'product_brand'];
  const gteUpdatedFilters = (_filters: MedFilter[]) => {
    const brandFilter = getSavedFilter();
    const isCategoryFilterApplied =
      _selectedFilters &&
      Object.keys(_selectedFilters).find((key) => categoryFilterKeys.includes(key));
    return (
      brandFilter &&
      isCategoryFilterApplied &&
      _filters.map((filter) => (brandFilterKeys.includes(filter.attribute) ? brandFilter : filter))
    );
  };

  const [filters, setFilters] = useState<Filter[]>(gteUpdatedFilters(_filters) || _filters);
  const [selectedOption, setSelectedOption] = useState<Filter | null>(_filters[0]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(_selectedFilters || {});
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const isFiltersApplied = Object.keys(formatFilters(selectedFilters) || {}).length;
  const { axdcCode } = useAppCommonData();

  const onRequestClose = () => {
    if (isEqual(_selectedFilters, selectedFilters)) {
      onClose();
    } else {
      setAlertVisible(true);
    }
  };

  const stripSymbols = (filters: SelectedFilters) => {
    return Object.keys(filters).reduce(
      (prevVal, currKey) => ({
        ...prevVal,
        ...{ [currKey]: filters[currKey].filter((key) => !key.startsWith('>')) }, // to strip > symbols from ids
      }),
      {}
    );
  };

  const renderFilterOption = (filter: Filter) => {
    const isSelected = filter.attribute === selectedOption?.attribute;
    const onPress = () => setSelectedOption(filter);
    const highlightView = (
      <View style={[styles.highlight, { backgroundColor: isSelected ? APP_GREEN : CLEAR }]} />
    );
    const count = selectedFilters[filter.attribute]?.filter((attr) => !attr.startsWith('>')).length;
    const rightIcon = (
      <>
        {!!count && (
          <Badge
            badgeStyle={isSelected ? styles.badgeGreenStyle : styles.badgeBlueStyle}
            textStyle={styles.badgeTextStyle}
            value={count}
          />
        )}
        {isSelected ? <ArrowRightGreen /> : <ArrowRight />}
      </>
    );

    return (
      <ListItem
        key={filter.name}
        leftElement={highlightView}
        title={filter.name}
        rightIcon={rightIcon}
        onPress={onPress}
        bottomDivider
        containerStyle={styles.optionsContainer}
        titleStyle={isSelected ? styles.selectedOptionText : styles.optionText}
        Component={TouchableOpacity}
      />
    );
  };

  const updateAssociatedBrandFilter = async (categoryId: string) => {
    // update associated brand filter on selection of category
    try {
      setLoading(true);
      const { data } = await getProductsByCategoryApi(categoryId, 1, null, null, axdcCode, pinCode);
      const brandFilter = data.filters.find(({ attribute }) => brandFilterKeys.includes(attribute));
      if (brandFilter) {
        const updatedFilter = filters.map((filter) =>
          brandFilterKeys.includes(filter.attribute) ? brandFilter : filter
        );
        setFilters([...updatedFilter]);
        saveFilter(brandFilter);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const renderFilterSubOptions = (filter: Filter) => {
    return filter.values?.map(({ name, id, child }) => {
      const { select_type, attribute } = filter;
      const isMulti = select_type == 'multi';
      const checkedIcon = isMulti ? <CheckedIcon /> : <RadioButtonIcon />;
      const uncheckedIcon = isMulti ? <CheckUnselectedIcon /> : <RadioButtonUnselectedIcon />;
      const subOptions = selectedFilters[filter.attribute];
      const isSelected = !!subOptions?.find((subOption) => subOption == id);
      const isAccordionType = filter.values?.find(({ child }) => child?.length);

      const onPress = async () => {
        const updatedFilter = isSelected
          ? subOptions?.filter((subOption) => subOption != id)
          : isMulti
          ? [...(subOptions || []), id]
          : [id];
        setSelectedFilters({ ...selectedFilters, [attribute]: updatedFilter });

        if (!isSelected && categoryFilterKeys.includes(attribute)) {
          updateAssociatedBrandFilter(id);
        }
      };

      if ((Array.isArray(child) && child.length) || isAccordionType) {
        const isAccordionSelected = !!subOptions?.find(
          (subOption) =>
            subOption === id ||
            subOption === `>${id}` ||
            child?.find(({ category_id }) => category_id === subOption)
        );
        const onPressAccordion = async (id: string) => {
          const updatedFilter = isAccordionSelected
            ? subOptions?.filter((subOption) => subOption != id)
            : isMulti
            ? [...(subOptions || []), id]
            : [id];
          setSelectedFilters({ ...selectedFilters, [attribute]: updatedFilter });
        };

        return (
          <Accordion
            title={name}
            isOpen={isAccordionSelected}
            onPress={() => onPressAccordion(isAccordionType ? id : `>${id}`)}
          >
            {child?.map(({ title, category_id }) => {
              const isCheckBoxSelected = !!subOptions?.find(
                (subOption) => subOption == category_id
              );
              const onPress = () => {
                const updatedFilter = isCheckBoxSelected
                  ? subOptions?.filter((subOption) => subOption != category_id)
                  : isMulti
                  ? [...(subOptions || []), category_id]
                  : [category_id];
                setSelectedFilters({ ...selectedFilters, [attribute]: updatedFilter });
                if ((!isCheckBoxSelected && categoryFilterKeys.includes(attribute)) || isSelected) {
                  updateAssociatedBrandFilter(id);
                }
              };

              return (
                <CheckBox
                  key={category_id}
                  title={title}
                  checked={isCheckBoxSelected}
                  onPress={onPress}
                  checkedIcon={checkedIcon}
                  uncheckedIcon={uncheckedIcon}
                  containerStyle={styles.checkBoxContainer}
                  textStyle={isCheckBoxSelected ? styles.selectedCheckBoxText : styles.checkBoxText}
                />
              );
            })}
          </Accordion>
        );
      }

      return (
        <CheckBox
          key={id}
          title={name}
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

  const renderInScrollView = (children: React.ReactNode, width: number) => {
    return (
      <ScrollView removeClippedSubviews={true} bounces={false} contentContainerStyle={{ width }}>
        {children}
      </ScrollView>
    );
  };

  const renderButton = () => {
    const onPress = () => {
      onApplyFilters(stripSymbols(selectedFilters));
    };
    return (
      <Button
        title={'APPLY'}
        style={styles.button}
        titleTextStyle={styles.buttonTitle}
        onPress={onPress}
      />
    );
  };

  const renderHeader = () => {
    const onPress = () => {
      setSelectedFilters({});
      setFilters(_filters);
    };
    return (
      <Header
        title={'FILTER BY'}
        rightText={{
          title: isFiltersApplied ? 'CLEAR ALL' : '',
          onPress,
          style: styles.headerRightText,
        }}
        leftIcon="close"
        onPressLeftIcon={onRequestClose}
        container={styles.header}
      />
    );
  };

  const renderApplyAndDiscardButtons = () => {
    const onDiscard = () => {
      setAlertVisible(false);
      onClose();
    };
    const onApply = () => {
      setAlertVisible(false);
      onApplyFilters(stripSymbols(selectedFilters));
    };
    return (
      <View style={styles.alertButtonsContainer}>
        <Button
          title={'APPLY CHANGES'}
          style={[styles.alertButton, styles.alertOutlineButton]}
          titleTextStyle={[styles.alertButtonTitle, styles.alertOutlineButtonTitle]}
          onPress={onApply}
        />
        <Button
          title={'DISCARD CHANGES'}
          style={styles.alertButton}
          titleTextStyle={styles.alertButtonTitle}
          onPress={onDiscard}
        />
      </View>
    );
  };

  const renderDiscardChangesAlert = () => {
    const onPress = () => {
      setAlertVisible(false);
    };
    return (
      <Overlay
        isVisible={!!alertVisible}
        overlayStyle={styles.alertOverlay}
        onBackdropPress={onPress}
      >
        <View style={styles.alertContainer}>
          <View style={styles.alertInnerContainer}>
            <Text style={styles.alertText}>{'Do you want to discard your changes ?'}</Text>
            {renderApplyAndDiscardButtons()}
          </View>
        </View>
      </Overlay>
    );
  };

  const renderFilters = () => {
    return (
      <View style={styles.container}>
        {renderInScrollView(filters.map(renderFilterOption), width * 0.4)}
        <View style={styles.verticalDivider} />
        {renderInScrollView(selectedOption && renderFilterSubOptions(selectedOption), width * 0.55)}
      </View>
    );
  };

  return (
    <Overlay
      fullScreen
      overlayStyle={styles.overlayStyle}
      onRequestClose={onRequestClose}
      {...overlayProps}
    >
      <SafeAreaView style={container}>
        {renderHeader()}
        <View style={styles.horizontalDivider} />
        {renderFilters()}
        <View style={styles.horizontalDivider} />
        {renderButton()}
        {renderDiscardChangesAlert()}
        {isLoading && <Spinner />}
      </SafeAreaView>
    </Overlay>
  );
};

const { text, container } = theme.viewStyles;
const { BUTTON_BG, LIGHT_BLUE, WHITE, APP_GREEN, CLEAR } = theme.colors;
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlayStyle: {
    padding: 0,
  },
  container: { flex: 1, flexDirection: 'row' },
  verticalDivider: { backgroundColor: '#000', opacity: 0.03, width: 5, height: '100%' },
  horizontalDivider: { backgroundColor: '#000', opacity: 0.03, height: 5 },
  checkBoxContainer: {
    backgroundColor: CLEAR,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
    margin: 0,
    paddingVertical: 15,
  },
  checkBoxText: {
    ...text('M', 12, LIGHT_BLUE, 0.9),
  },
  selectedCheckBoxText: {
    ...text('SB', 12, LIGHT_BLUE),
  },
  optionsContainer: {
    backgroundColor: CLEAR,
    paddingLeft: 0,
    paddingRight: 15,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
  },
  optionText: {
    ...text('SB', 14, LIGHT_BLUE),
    paddingVertical: 15,
  },
  selectedOptionText: {
    ...text('SB', 14, APP_GREEN),
    paddingVertical: 15,
  },
  highlight: {
    height: '100%',
    width: 5,
  },
  button: { borderRadius: 0, height: 45, shadowOpacity: 0 },
  buttonTitle: {
    ...text('B', 17, WHITE),
  },
  headerRightText: {
    color: BUTTON_BG,
    paddingRight: 0,
  },
  header: {
    borderBottomWidth: 0,
  },
  alertOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    padding: 0,
  },
  alertContainer: {
    flex: 1,
    backgroundColor: CLEAR,
    justifyContent: 'flex-end',
  },
  alertInnerContainer: {
    backgroundColor: WHITE,
    padding: 16,
    paddingTop: 19,
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  alertText: {
    ...text('M', 14, LIGHT_BLUE, 1, 17),
    marginBottom: 24,
  },
  alertButton: {
    shadowOpacity: 0,
    width: 'auto',
    height: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 8,
  },
  alertOutlineButton: {
    backgroundColor: WHITE,
    borderColor: BUTTON_BG,
    borderWidth: 1,
  },
  alertButtonTitle: {
    ...text('SB', 14, WHITE, 1, 24),
  },
  alertOutlineButtonTitle: {
    color: BUTTON_BG,
  },
  badgeGreenStyle: {
    backgroundColor: APP_GREEN,
  },
  badgeBlueStyle: {
    backgroundColor: LIGHT_BLUE,
  },
  badgeTextStyle: {
    ...text('M', 12, WHITE),
    paddingBottom: 1,
  },
});
