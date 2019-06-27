import { TouchableOpacity, Text, View, Image } from "react-native"
import React from "react"
import BaseScene from "./BaseScene";

export default class Button extends BaseScene {

    constructor(props) {
        super(props);
    }

    render() {
        const styles = this.styleSheet();
        return (
            <TouchableOpacity
                style={[styles.containerStyles, this.props.style]}
                onPress={this.props.onPress}>
                <Text style={[styles.titleTextStyle, this.props.titleTextStyle]}>{this.props.title}</Text>
            </TouchableOpacity>
        );
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        return {
            containerStyles: {
                height: 40,
                borderRadius: 10,
                backgroundColor: this.props.disabled ? Colors.BUTTON_DISABLED_BG : Colors.BUTTON_BG,
                width: this.props.width ? this.props.width : '100%',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                shadowColor: 'rgba(0,0,0,0.2)',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 1,
            },
            titleTextStyle: {
                ...Fonts.IBMPlexSansBold(14),
                color: Colors.BUTTON_TEXT
            }
        }
    }
}
