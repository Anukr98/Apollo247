import { SearchSendIcon, WhiteSearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, InputProps } from 'react-native-elements';

export interface Props extends InputProps {
  isLoading: boolean;
  isFocused: boolean;
  onSearchSend: (value: string) => void;
  // Minimum characters to trigger onSearchSend callback
  minCharacterLength: number;
}

export const MedSearchBar: React.FC<Props> = ({
  isLoading,
  isFocused,
  minCharacterLength: minimumCharacterLength,
  onSearchSend,
  value = '',
  ...restOfProps
}) => {
  const rightIcon = isLoading ? (
    <ActivityIndicator size={24} />
  ) : isFocused ? (
    <TouchableOpacity
      onPress={() => onSearchSend(value)}
      disabled={value.length < 3}
      style={{ opacity: value.length < 3 ? 0.5 : 1 }}
    >
      <SearchSendIcon />
    </TouchableOpacity>
  ) : (
    <WhiteSearchIcon />
  );

  const onSubmitEditing = () => {
    if (value.length >= minimumCharacterLength) {
      onSearchSend(value);
    }
  };

  return (
    <Input
      value={value}
      onSubmitEditing={onSubmitEditing}
      placeholder="Search meds, brands &amp; more"
      rightIcon={rightIcon}
      autoFocus={true}
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor="rgba(1,48,91, 0.4)"
      containerStyle={styles.container}
      selectionColor={false ? '#02475b' : '#00b38e'}
      inputContainerStyle={styles.inputContainer}
      inputStyle={styles.input}
      rightIconContainerStyle={styles.rightIconContainer}
      errorProps={{ numberOfLines: 1 }}
      errorStyle={styles.error}
      {...restOfProps}
    />
  );
};

const { text } = theme.viewStyles;
const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, paddingLeft: 13 },
  inputContainer: {
    borderColor: '#979797',
    borderWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRadius: 5,
    height: 33,
  },
  input: {
    ...text('M', 14, '#000'),
    paddingLeft: 9,
  },
  rightIconContainer: {
    paddingRight: 4,
  },
  error: {
    ...text('R', 10, '#02475b'),
    marginVertical: 2,
    marginHorizontal: 0,
    maxWidth: '60%',
  },
});
