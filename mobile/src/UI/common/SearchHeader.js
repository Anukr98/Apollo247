
import { TouchableOpacity, Text, TextInput, Image, View } from "react-native"
import React from "react"
import BaseScene from "./BaseScene";
import { SearchBar } from 'react-native-elements';

class SearchHeader extends BaseScene {

    constructor(props) {
        super(props);
    }


    renderSearchHeader(styles) {
        const { Colors } = this.theme();
        return (
            <View style={styles.containerStyles}>
                <SearchBar
                    testID="searchDoctor"
                    lightTheme
                    placeholder={this.ls('searchLocation')}
                    placeholderTextColor={Colors.DISABLED_TEXT_COLOR}
                    onChangeText={this.props.onSearchText}
                    onClearText={this.props.onClear}
                    containerStyle={styles.searchBarContainer}
                    inputStyle={styles.searchBarInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    icon={styles.searchIconStyle}
                    value={this.props.searchValue}
                    returnKeyType="search"
                    autoFocus
                    selectionColor={Colors.INPUT_CURSOR_COLOR}
                    autoCorrect={false}
                />
                <View style={styles.separatorStyles} />
            </View>
        );
    }

    render() {
        const styles = this.styleSheet();
        return this.renderSearchHeader(styles)
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        return {
            containerStyles: {
                height: 50,
                width: '100%',
                flex: 1
            },
            separatorStyles: {
                backgroundColor: Colors.SHERPA_BLUE,
                width: '100%',
                height: 2,
                marginTop: 6
            }
        }
    }
}

export default SearchHeader