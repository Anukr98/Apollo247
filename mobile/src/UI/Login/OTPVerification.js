
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image } from 'react-native';
import SmsListener from 'react-native-android-sms-listener'
import { Card, BaseScene } from '../common';

export default class OTPVerification extends BaseScene {

  constructor(props) {
    super(props);
    this.state = {
      isValidOTP: true,
      otp: ''
    };
  }

  componentDidMount() {
    this.subscription = SmsListener.addListener(message => {
      console.log(message, 'message')
    })
    this.navigate('TabBar')

  }

  componentDidUpdate() {
    console.log(this.ref)
  }

  componentWillUnmount() {
    this.subscription.remove();

  }

  validateNumber = (phoneNumber) => {
    this.setState({
      phoneNumber,
      isValidOTP: (phoneNumber.replace(/^0+/, '').length !== 10 && phoneNumber.length !== 0) ? false : true
    });
  }

  focusNextField(nextField, text) {
    if (text.length === 1) {
      this.refs[nextField].focus();
    }
  }

  resendOTP = () => {

  }

  render() {
    const styles = this.styleSheet();
    return (
      <View style={styles.container}>
        <Card
          heading={this.ls('great')}
          description={this.ls('type_otp_text')}
          buttonIcon={(this.state.isValidOTP) ? 'ic_ok' : 'ok_disabled'}
          onClickButton={() => this.navigate('SignUp')}
          disableButton={this.state.isValidOTP ? false : true}
        >
          <View style={styles.inputView}>
            <TextInput
              ref="1"
              autoFocus
              style={styles.inputStyle}
              keyboardType='numeric'
              maxLength={1}
              textContentType={'oneTimeCode'}
              onChangeText={(text) => this.focusNextField('2', text)}
              secureTextEntry
            />
            <TextInput
              ref="2"
              style={styles.inputStyle}
              keyboardType='numeric'
              maxLength={1}
              onChangeText={(text) => this.focusNextField('3', text)}
              secureTextEntry
            />
            <TextInput
              ref="3"
              style={styles.inputStyle}
              keyboardType='numeric'
              maxLength={1}
              onChangeText={(text) => this.focusNextField('4', text)}
              secureTextEntry
            />
            <TextInput
              ref="4"
              style={styles.inputStyle}
              keyboardType='numeric'
              maxLength={1}
              secureTextEntry
            />
          </View>
          {
            !this.state.isValidOTP &&
            <Text style={styles.errorText}>{this.ls('enter_correct_opt')}</Text>
          }

          <Text
            style={styles.bottomDescription}
            onPress={this.resendOTP}
          >{this.ls('resend_opt')}</Text>
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
        width: '15%',
        color: Colors.INPUT_TEXT,
        textAlign: 'center',
        borderBottomColor: this.state.isValidOTP ? Colors.INPUT_BORDER_SUCCESS : Colors.INPUT_BORDER_FAILURE,
        borderBottomWidth: 2,
      },
      inputView: {
        flexDirection: 'row',
        // alignItems: 'space-between',
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: 4
      },
      errorText: {
        color: Colors.INPUT_FAILURE_TEXT,
        ...Fonts.IBMPlexSansMedium(12),
        paddingTop: 10
      },
      bottomDescription: {
        fontSize: 12,
        color: Colors.INPUT_INFO,
        paddingVertical: 10,
        paddingBottom: 55,
        ...Fonts.IBMPlexSansMedium(12),
      }
    }
  }

}
