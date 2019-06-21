
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import AppIntroSlider from "react-native-app-intro-slider";
import { connect } from 'react-redux';
// import BaseScene from '../common/BaseScene';
import { BaseScene, Button } from "../common";
const { width, height } = Dimensions.get('window')

class Bording extends BaseScene {

    constructor(props) {
        super(props);
        this.state = {
            arrayTest: [
                {
                    title: "Are you looking for a particular doctor?",
                    descripiton: 'SEARCH SPECIALIST',
                    color: 'red'
                },
                {
                    title: "Do you want to buy some medicines?",
                    descripiton: 'SEARCH MEDICINE',
                    color: 'green'
                },
                {
                    title: "Do you want to get some tests done?",
                    descripiton: 'BOOK A TEST',
                    color: 'yellow'
                }
            ]
        }
    }

    render() {
        const scrollViewWidth = (this.state.arrayTest.length * 320) + (this.state.arrayTest.length * 20)
        return (
            <View style={styles.doctorView}>
                <Text style={styles.doctorStyle}>Learn about Apollo Star Doctor Program</Text>
                <ScrollView style={{ marginTop: 20, backgroundColor: 'transparent' }}
                    contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 3, width: scrollViewWidth }}
                    horizontal={true}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    directionalLockEnabled={true}>
                    {this.state.arrayTest.map((serviceTitle, i) =>
                        <View key={i}>
                            <TouchableHighlight key={i}>
                                <View style={{
                                    marginLeft: 0,
                                    marginRight: 0,
                                    width: width,
                                    height: height,
                                    backgroundColor: 'white',
                                    shadowColor: '#808080',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 5,
                                    elevation: 1,
                                    borderRadius: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }} key={i}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        width: 77,
                                        height: 24,
                                        borderRadius: 5,
                                        backgroundColor: serviceTitle.color
                                    }}>

                                    </View>

                                </View>
                            </TouchableHighlight>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }
}

export default Bording; 