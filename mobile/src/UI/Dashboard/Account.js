
import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { BaseScene } from "../common";

class Account extends BaseScene {

    constructor(props) {
        super(props);
    }

    render() {
        const styles = this.styleSheet();

        return (
            <View style={styles.headerContainer}>

            </View>
        );
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        const textStyle = {
            color: Colors.HEADER_TEXT
        }
        return {
            headerContainer: {
                height: 49,
                borderColor: '#ddd',
                borderBottomWidth: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            },
            leftViewStyle: {
                width: 24,
                paddingLeft: 17
            },
            rightViewStyle: {
                paddingRight: 17
            }
        }
    }
}

export default Account;
