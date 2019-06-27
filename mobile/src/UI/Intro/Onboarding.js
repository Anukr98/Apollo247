
import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import AppIntroSlider from "react-native-app-intro-slider";
import { connect } from 'react-redux';
import BaseScene from '../common/BaseScene';

class Onboarding extends BaseScene {
  constructor(props) {
    super(props);

    this.onNextPress = this.onNextPress.bind(this)
  }

  onNextPress(slideValue) {
    const value = parseInt(slideValue)
    if (value == 4) {
      this.navigate('Login')
    } else {
      this.refs.appIntro.goToSlide(value)
    }
  }

  renderItem = (item, style) => {
    return (
      <View style={style.itemContainer}>
        <Image source={item.image} style={style.imageStyle} resizeMode='cover' />
        <Text style={style.titleStyle}>{item.title}</Text>
        <Text style={style.descptionText}>{item.text}</Text>
        <TouchableOpacity onPress={() => this.onNextPress(item.index)}>
          <Image {...this.appImages().nextButton} />
        </TouchableOpacity>

      </View>
    );
  }

  render() {
    const styles = this.styleSheet();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mainView}>
          {this.renderSlides()}
        </View>

        <View style={styles.skipView}>
          <Text style={styles.skipTextStyle} onPress={() => this.navigate('Login')}>SKIP</Text>
        </View>
      </SafeAreaView>
    );
  }

  renderSlides() {
    const styles = this.styleSheet();
    return (
      <View style={{ flex: 7 }}>
        <AppIntroSlider
          ref="appIntro"
          slides={slides}
          renderItem={(item) => this.renderItem(item, styles)}
          hidePagination
        />
      </View>
    );
  }

  defaultStyles() {
    const { Colors, ViewStyles, Fonts } = this.theme();
    return {
      container: {
        ...ViewStyles.container
      },
      mainView: {
        flex: 9,
        backgroundColor: 'transparent',
      },
      itemContainer: {
        height: '82%',
        margin: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        shadowColor: '#808080',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 1,
      },
      descptionText: {
        marginTop: 10,
        color: 'rgba(0,0,0,0.4)',
        textAlign: 'center',
        marginHorizontal: 50,
        lineHeight: 20,
        ...Fonts.IBMPlexSansMedium(14)
      },
      titleStyle: {
        marginTop: 8,
        marginHorizontal: 53,
        color: '#02475b',
        ...Fonts.IBMPlexSansSemiBold(25),
        textAlign: 'center'
      },
      skipView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      },
      imageStyle: {
        marginTop: 12,
      },
      skipTextStyle: {
        color: '#a4a4a4',
        lineHeight: 24,
        ...Fonts.IBMPlexSansBold(13),
        textAlign: 'center',
      }
    }
  }
}




const styles = StyleSheet.create({
  image: {
    width: 32,
    height: 30,
    marginTop: 200
  },
  textStyle: {
    color: 'red'
  }
});

const slides = [
  {
    key: "somethun",
    title: "anytime, anywhere",
    text: "Talk to an Apollo certified doctor in under 15 minutes, anytime, anywhere!",
    image: require("../../res/Images/Common/onBoard.png"),
    imageStyle: styles.image,
    titleStyle: styles.titleStyle,
    textStyle: styles.textStyle,
    backgroundColor: '"FBFCFD"',
    index: 1
  },
  {
    key: "somethun-dos",
    title: "health vault",
    text: "Keep all your medical records in one digital vault, with you controlling access",
    image: require("../../res/Images/Common/onBoard.png"),
    imageStyle: styles.image,
    backgroundColor: "#FBFCFD",
    index: 2
  },
  {
    key: "somethun1",
    title: "at your doorstep",
    text: "Order medicines, tests and health checkups from the comfort of your home",
    image: require("../../res/Images/Common/onBoard.png"),
    imageStyle: styles.image,
    backgroundColor: "#FBFCFD",
    index: 3
  },
  {
    key: "somethun2",
    title: "star doctors",
    text: "Leverage the Apollo expertise using our Star Doctors",
    image: require("../../res/Images/Common/onBoard.png"),
    imageStyle: styles.image,
    backgroundColor: "#FBFCFD",
    index: 4
  }
];


export default connect(
  state => ({ todos: state.todos.list })
)(Onboarding);
