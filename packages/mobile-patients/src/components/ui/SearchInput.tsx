import { WhiteSearchIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, InputProps } from 'react-native-elements';

export interface SearchInputProps extends InputProps {
  _isSearchFocused?: boolean;
  _rigthIconView: React.ReactElement;
  _itemsNotFound: boolean;
  _rightIconStyle?: any;
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
        backgroundColor: '#F7F8F5',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 5,
        marginHorizontal: 10,
        paddingHorizontal: 16,
        paddingRight: 12,
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
        <WhiteSearchIcon style={props._rightIconStyle ? props._rightIconStyle : {}} />
      </View>
    );

    return (
      <>
        <Input
          {...props}
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          rightIcon={props._isSearchFocused ? props._rigthIconView : rightSearchIcon}
          selectionColor={props._itemsNotFound ? '#02475b' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={[styles.inputStyle, props.inputStyle]}
          inputContainerStyle={[
            styles.inputContainerStyle,
            props._itemsNotFound ? { borderBottomColor: '#02475b' } : {},
            props.inputContainerStyle,
          ]}
          rightIconContainerStyle={[styles.rightIconContainerStyle, props.rightIconContainerStyle]}
          style={[styles.style, props.style]}
          containerStyle={[styles.containerStyle, props.containerStyle]}
          errorStyle={
            props._itemsNotFound
              ? [
                  {
                    ...theme.viewStyles.text('M', 14, '#02475b'),
                    marginHorizontal: 10,
                  },
                  props.errorStyle,
                ]
              : { maxHeight: 0 }
          }
          errorMessage={
            props._itemsNotFound ? `Hit enter to search for '${props.value}'` : undefined
          }
        />
      </>
    );
  };

  return renderSearchBar();
};
