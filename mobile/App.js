/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import BaseScene from './src/UI/common/BaseScene';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

type Props = {};
// eslint-disable-next-line
export default class App extends BaseScene {
  constructor(props) {
    super(props);
    this.state = { otp: '' };
  }

  componentDidMount() {
    this.subscription = SmsListener.addListener((message) => {
      console.log(message, 'message');
    });
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ margin: 30, borderRadius: 5, backgroundColor: 'white', padding: 20 }}>
          <Text style={{ fontSize: 40, paddingVertical: 10 }}>Hello</Text>
          <Text style={{ fontSize: 22, color: 'blue', paddingBottom: 30 }}>
            Please enter your mobile number to login
          </Text>
          <TextInput
            style={{
              height: 50,
              width: '100%',
              borderBottomColor: 'green',
              borderBottomWidth: 3,
              fontSize: 20,
            }}
          />
          <Text style={{ fontSize: 16, color: '#ddd', paddingVertical: 15, paddingBottom: 70 }}>
            OTP will be send to this number
          </Text>
          <View
            style={{
              position: 'absolute',
              bottom: 25,
              right: -20,
              height: 60,
              width: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image {...this.appImages('arrow_disabled')} />
          </View>
        </View>
        {/* <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1, width: '70%'}}
        onChangeText={(otp) => this.setState({otp})}
        value={this.state.otp}
        textContentType='oneTimeCode'
        autoFocus
      /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#dddddd',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
