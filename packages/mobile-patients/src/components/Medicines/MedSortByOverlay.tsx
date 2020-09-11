{
  /* <MedSortByOverlay
isVisible={true}
title="SORT BY"
options={[
  {
    title: 'New Arrivals',
    isSelected: false,
  },
  {
    title: 'Price : High to Low',
    isSelected: true,
  },
  {
    title: 'Price : Low to High',
    isSelected: false,
  },
]}
onPressOption={() => {}}
/> */
}
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
// import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { CheckBox, Divider, Overlay, OverlayProps } from 'react-native-elements';

type Option = { title: string; isSelected: boolean };

export interface Props extends Omit<OverlayProps, 'children'> {
  title: string;
  options: Option[];
  onPressOption: (option: Option) => void;
}

export const MedSortByOverlay: React.FC<Props> = ({
  title,
  options,
  onPressOption,
  ...otherProps
}) => {
  const renderTitleAndSeparator = () => {
    return [<Text style={styles.title}>SORT BY</Text>, <Divider style={styles.divider} />];
  };

  const renderOptions = () => {
    return options.map(({ title, isSelected }) => (
      <CheckBox
        title={title}
        checked={isSelected}
        onPress={() => onPressOption({ title, isSelected })}
        checkedIcon={<RadioButtonIcon />}
        uncheckedIcon={<RadioButtonUnselectedIcon />}
        containerStyle={styles.checkBoxContainer}
        textStyle={isSelected ? styles.selectedCheckBox : styles.checkBox}
      />
    ));
  };

  return (
    <Overlay
      containerStyle={styles.overlayContainerStyle}
      overlayStyle={styles.overlayStyle}
      {...otherProps}
    >
      <>
        {renderTitleAndSeparator()}
        {renderOptions()}
      </>
    </Overlay>
  );
};

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  overlayStyle: {
    height: 'auto',
    width: 'auto',
    maxWidth: '70%',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  overlayContainerStyle: {
    opacity: 0.31,
  },
  title: {
    ...text('SB', 14, '#02475B'),
    paddingHorizontal: 16,
  },
  divider: {
    backgroundColor: '#02475B',
    opacity: 0.5,
    marginBottom: 15,
    marginTop: 12,
    marginHorizontal: 8,
  },
  checkBox: {
    ...text('M', 12, '#02475B', 0.9),
  },
  selectedCheckBox: {
    ...text('SB', 12, '#02475B'),
  },
  checkBoxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingLeft: 5,
    paddingRight: 20,
  },
});
