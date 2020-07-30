import { WhiteSearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Input } from 'react-native-elements';

export interface SearchInputProps {
  _onBlur?: () => void;
  _onChangeText: (_searchText: string) => void;
  _onFocus?: () => void;
  _searchText: string;
  _placeholder: string;
  _isSearchFocused?: boolean;
  _rigthIconView: React.ReactElement;
  _focusSearch?: boolean;
  _onSubmitEditing: () => void;
  _itemsNotFound: boolean;
  _containerStyle?: StyleProp<ViewStyle>;
  _inputStyle?: StyleProp<ViewStyle>;
  _inputContainerStyle?: StyleProp<ViewStyle>;
  _style?: StyleProp<ViewStyle>;
  _rightIconContainerStyle?: StyleProp<ViewStyle>;
  _errorStyle?: StyleProp<ViewStyle>;
}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  const renderSearchBar = () => {
    const isFocusedStyle = props._isSearchFocused;
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 48,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: {
        borderRadius: 5,
        backgroundColor: '#f7f8f5',
        marginHorizontal: 10,
        paddingHorizontal: 16,
        paddingRight: 12,
        borderBottomWidth: 0,
      },
      rightIconContainerStyle: {
        height: 24,
      },
      style: {},
      containerStyle: isFocusedStyle
        ? {
            marginBottom: 20,
            marginTop: 12,
          }
        : {
            marginBottom: 20,
            marginTop: 12,
            alignSelf: 'center',
          },
    });

    const rightSearchIcon = (
      <View>
        <WhiteSearchIcon style={{ height: 24, width: 24 }} />
      </View>
    );

    return (
      <>
        <Input
          autoFocus={props._focusSearch}
          onSubmitEditing={props._onSubmitEditing}
          value={props._searchText}
          autoCapitalize="none"
          spellCheck={false}
          onFocus={props._onFocus}
          onBlur={props._onBlur}
          onChangeText={(value) => props._onChangeText(value)}
          autoCorrect={false}
          rightIcon={props._isSearchFocused ? props._rigthIconView : rightSearchIcon}
          placeholder={props._placeholder}
          selectionColor={props._itemsNotFound ? '#02475b' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={[styles.inputStyle, props._inputStyle]}
          inputContainerStyle={[
            styles.inputContainerStyle,
            props._itemsNotFound ? { borderBottomColor: '#02475b' } : {},
            props._inputContainerStyle,
          ]}
          rightIconContainerStyle={[styles.rightIconContainerStyle, props._rightIconContainerStyle]}
          style={[styles.style, props._style]}
          containerStyle={[styles.containerStyle, props._containerStyle]}
          errorStyle={[
            {
              ...theme.viewStyles.text('M', 14, '#02475b'),
              marginHorizontal: 10,
            },
            props._errorStyle,
          ]}
          errorMessage={
            props._itemsNotFound ? `Hit enter to search for '${props._searchText}'` : undefined
          }
        />
      </>
    );
  };

  return renderSearchBar();
};
