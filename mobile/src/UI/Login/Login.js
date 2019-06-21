
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { Card, BaseScene } from '../common';

export default class Login extends BaseScene {

  constructor(props) {
    super(props);
    this.state = {
      isValidNumber: true,
      phoneNumber: ''
    };
  }


  

  validateNumber = (phoneNumber) => {
    this.setState({
      phoneNumber,
      isValidNumber: (phoneNumber.replace(/^0+/, '').length !== 10 && phoneNumber.length !== 0) ? false : true
    });
  }

  render() {
		const styles = this.styleSheet();
    return (
      <View style={styles.container}>
        <Card
          heading={this.ls('hello')}
          description={this.ls('please_enter_no')}
          buttonIcon={(this.state.isValidNumber && this.state.phoneNumber.replace(/^0+/, '').length === 10) ? 'arrow_yellow' : 'arrow_disabled'}
          onClickButton={() => this.navigate('OTPVerification')}
            disableButton={this.state.isValidOTP ? false : true}

        >
          <View style={styles.inputView}>
            <Text style={styles.inputTextStyle}>{this.ls('numberPrefix')}</Text>
            <TextInput
              autoFocus
              style={styles.inputStyle}
              keyboardType='numeric'
              maxLength={10}
              onChangeText={this.validateNumber}
            />
          </View>
          <Text style={styles.bottomDescription}>{ this.state.isValidNumber ? this.ls('otp_sent_to') : this.ls('wrong_number')}</Text>
        </Card>
      </View>
    );
  }
  defaultStyles() {
    const { Colors, ViewStyles, Fonts } = this.theme();
    return {
      container: {
        ...ViewStyles.container,
        paddingTop: 2
      },
      inputTextStyle: {
        ...Fonts.IBMPlexSansMedium(18),
        color: Colors.INPUT_TEXT,
        paddingRight: 6
      },
      inputStyle: {
        ...Fonts.IBMPlexSansMedium(18),
        height: 28,
        width: '80%',
        color: Colors.INPUT_TEXT
      },
      inputView: {
        borderBottomColor: this.state.isValidNumber ? Colors.INPUT_BORDER_SUCCESS : Colors.INPUT_BORDER_FAILURE,
        borderBottomWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 4
      },
      bottomDescription: {
        fontSize: 12,
        color: this.state.isValidNumber ? Colors.INPUT_SUCCESS_TEXT : Colors.INPUT_FAILURE_TEXT,
        opacity: 0.6,
        paddingVertical: 10,
        paddingBottom: 55,
        ...Fonts.IBMPlexSansMedium(12)
      }
    }
  }

}
