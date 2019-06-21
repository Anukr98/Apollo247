
import React from 'react';
import { Platform, StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { Card, BaseScene, TextInputComponent, Button } from '../common';

export default class SignUp extends BaseScene {

  constructor(props) {
    super(props);
    this.state = {
      genderOptions: ['Male', 'Female', 'Other'],
      gender: '',
      phoneNumber: ''
    };
  }

  renderGenderButtons = (styles) => {

    return this.state.genderOptions.map((option) => (
      <Button
        title={option}
        style={[styles.buttonViewStyle, this.state.gender === option ? styles.selectedButtonViewStyle : null]}
        titleTextStyle={this.state.gender === option ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle}
        onPress={() => this.setState({ gender: option })}
      />
    ))
    
              // <Button
              //   title={'Female'}
              //   style={styles.buttonViewStyle}
              //   titleTextStyle={styles.buttonTitleStyle}
              //   onPress={() => this.setState({ gender: 'Female' })}
              // />
              // <Button
              //   title={'Other'}
              //   style={styles.buttonViewStyle}
              //   titleTextStyle={styles.buttonTitleStyle}
              //   onPress={() => this.setState({ gender: 'Other' })}
              // />
  }



  render() {
		const styles = this.styleSheet();
    return (
      <ScrollView style={styles.container}>
        <View style={styles.mascotStyle}>
          <Image {...this.appImages(this.props.buttonIcon)} />
        </View>
        <Card
          cardContainer={{marginHorizontal: 0, marginTop: 120}}
          heading={this.ls('welcome_text')}
          description={this.ls('welcome_desc')}
        >
            <TextInputComponent
              label={'Full Name'}
              placeholder={'Example, Jonathan Donut'}
            />
            <TextInputComponent
              label={'Date Of Birth'}
              placeholder={'mm/dd/yyyy'}
            />
            <TextInputComponent
              label={'Gender'}
              noInput={true}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {this.renderGenderButtons(styles)}
            </View>
            <TextInputComponent
              label={'Email Address (Optional)'}
              placeholder={'name@email.com'}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
              <Button
                title={'FILL LATER'}
                style={{width: '40%', backgroundColor: 'white'}}
                titleTextStyle={{color: '#fc9916'}}
              />
              <Button
              style={{width: '40%'}}
                title={'SUBMIT'}
              />
            </View>
        </Card>
      </ScrollView>
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
        ...Fonts.IBMPlexSansMedium(12),
      },
      mascotStyle: {
        position: 'absolute',
        top: 90,
        backgroundColor: 'red',
				right: 0,
				height: 64,
        width: 64,
        zIndex: 2
      },
      buttonViewStyle: {
        width: '30%',
        backgroundColor: 'white'
      },
      selectedButtonViewStyle: {
        backgroundColor: Colors.APP_GREEN
      },
      buttonTitleStyle: {
        color: Colors.APP_GREEN
      },
      selectedButtonTitleStyle: {
        color: Colors.WHITE
      },
      submitButtonView: {
        width: '40%',
        backgroundColor: 'white'
      },
      submitButtonTitleStyle: {
        color:'#fc9916'
      },
    }
  }

}
