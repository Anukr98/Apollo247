import React, { Component } from 'react';
import { View, Text, Image, TextInput } from 'react-native';
import BaseScene from "./BaseScene";


export default class TextInputComponent extends BaseScene {
  render() {
    const styles = this.styleSheet();
    return (
      <View style={[styles.mainveiw, this.props.conatinerstyles]}>
        {this.props.label &&
          <View style={styles.textview}>
            <Text style={styles.labelStyle}>{this.props.label}</Text>
          </View>
        }
        { this.props.noInput ? null :
          <TextInput
            placeholder={this.props.placeholder ? this.props.placeholder : ''}
            style={[styles.textInputStyle, this.props.inputStyle]}
            multiline={this.props.multiline}
            numberOfLines={this.props.numberOfLines}
          />
        }
      </View>

    );
  }

  defaultStyles() {
    const { Colors, Fonts } = this.theme();
    return {
      mainveiw: {
        width: this.props.width ? this.props.width : '100%',
        paddingTop: 12,
        paddingBottom: 6
      },
      labelStyle: {
        ...Fonts.IBMPlexSansMedium(14),
        marginTop: 5,
        color: Colors.INPUT_TEXT,
        marginBottom: 6 
      },
      textInputStyle: {
        height: 35,
        borderColor: Colors.INPUT_BORDER_SUCCESS,
        ...Fonts.IBMPlexSansMedium(18),
        borderBottomWidth: 2
      },
      requiredindicationText: {
        backgroundColor: "transparent",
        color: "rgb(248, 104, 122)",
        ...Fonts.IBMPlexSansMedium(18),
      },
      textview: {
        flexDirection: "row",

      }
    }
  }
}