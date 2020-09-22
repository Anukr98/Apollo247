import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CheckedIcon,
  CheckUnselectedIcon,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProductsResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
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
import { CheckBox, ListItem, Overlay, OverlayProps } from 'react-native-elements';

type Filter = MedicineProductsResponse['filters'][0];
type SelectedFilters = { [key: string]: string[] };

export interface Props extends Omit<OverlayProps, 'children'> {
  filters: Filter[];
  selectedFilters: SelectedFilters;
  onApplyFilters: (appliedFilters: SelectedFilters) => void;
  onClose: () => void;
}

export const MedicineListingFilter: React.FC<Props> = ({
  filters,
  selectedFilters: _selectedFilters,
  onApplyFilters,
  onClose,
  ...overlayProps
}) => {
  const [selectedOption, setSelectedOption] = useState<Filter | null>(filters[0]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(_selectedFilters || {});
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const isFiltersApplied = Object.keys(selectedFilters).find((k) => selectedFilters[k]?.length);
  const isFiltersAvailable = !!filters.find((f) => f.values?.length);

  const onRequestClose = () => {
    if (isEqual(_selectedFilters, selectedFilters)) {
      onClose();
    } else {
      setAlertVisible(true);
    }
  };

  const renderFilterOption = (filter: Filter) => {
    const isSelected = filter.attribute === selectedOption?.attribute;
    const onPress = () => setSelectedOption(filter);
    const highlightView = (
      <View style={[styles.highlight, { backgroundColor: isSelected ? APP_GREEN : CLEAR }]} />
    );

    return (
      <ListItem
        key={filter.name}
        leftElement={highlightView}
        title={filter.name}
        rightIcon={isSelected ? <ArrowRight /> : <ArrowRight />} // TODO: change icon to arrow green for isSelected
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

  const renderInScrollView = (children: React.ReactNode, width: number) => {
    return (
      <ScrollView removeClippedSubviews={true} bounces={false} contentContainerStyle={{ width }}>
        {children}
      </ScrollView>
    );
  };

  const renderButton = () => {
    const onPress = () => {
      onApplyFilters(selectedFilters);
    };
    return (
      <Button
        title={'APPLY'}
        style={styles.button}
        titleTextStyle={styles.buttonTitle}
        onPress={onPress}
        disabled={!isFiltersAvailable}
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
      onApplyFilters(selectedFilters);
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
    if (isFiltersAvailable) {
      return (
        <View style={styles.container}>
          {renderInScrollView(filters.map(renderFilterOption), width * 0.4)}
          <View style={styles.verticalDivider} />
          {renderInScrollView(
            selectedOption && renderFilterSubOptions(selectedOption),
            width * 0.55
          )}
        </View>
      );
    }
  };

  const renderFiltersNotAvailable = () => {
    if (!isFiltersAvailable) {
      return <Text style={styles.noFiltersAvailable}>No filters available.</Text>;
    }
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
        {renderFiltersNotAvailable()}
        <View style={styles.horizontalDivider} />
        {renderButton()}
        {renderDiscardChangesAlert()}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(1,48,91,0.2)',
    borderStartColor: 'red',
  },
  optionText: {
    ...text('SB', 14, LIGHT_BLUE),
  },
  selectedOptionText: {
    ...text('SB', 14, APP_GREEN),
  },
  highlight: {
    height: '220%',
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
    ...theme.viewStyles.text('M', 14, LIGHT_BLUE, 1, 17),
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
  noFiltersAvailable: {
    flex: 1,
    ...text('M', 14, LIGHT_BLUE),
    padding: 16,
    textAlign: 'center',
  },
});
