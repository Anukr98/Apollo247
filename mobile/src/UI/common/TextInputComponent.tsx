import React, { Component } from 'react';
import { View, Text, Image, TextInput } from 'react-native';
import { BaseScene } from '.';
// import BaseScene from './BaseScene';

export interface TextInputComponentProps {
  noInput: boolean;
}

export class TextInputComponent<TextInputComponentProps> extends BaseScene {
  render() {
    const styles = super.styleSheet();
    return (
      <View style={[styles.mainveiw, super.props.conatinerstyles]}>
        {super.props.label && (
          <View style={styles.textview}>
            <Text style={styles.labelStyle}>{super.props.label}</Text>
          </View>
        )}
        {super.props.noInput ? null : (
          <TextInput
            placeholder={super.props.placeholder ? super.props.placeholder : ''}
            style={[styles.textInputStyle, super.props.inputStyle]}
            multiline={super.props.multiline}
            numberOfLines={super.props.numberOfLines}
          />
        )}
      </View>
    );
  }

  defaultStyles() {
    const { Colors, Fonts } = this.theme();
    return {
      mainveiw: {
        width: this.props.width ? this.props.width : '100%',
        paddingTop: 12,
        paddingBottom: 6,
      },
      labelStyle: {
        ...Fonts.IBMPlexSansMedium(14),
        marginTop: 5,
        color: Colors.INPUT_TEXT,
        marginBottom: 6,
      },
      textInputStyle: {
        height: 35,
        borderColor: Colors.INPUT_BORDER_SUCCESS,
        ...Fonts.IBMPlexSansMedium(18),
        borderBottomWidth: 2,
      },
      requiredindicationText: {
        backgroundColor: 'transparent',
        color: 'rgb(248, 104, 122)',
        ...Fonts.IBMPlexSansMedium(18),
      },
      textview: {
        flexDirection: 'row',
      },
    };
  }
}
