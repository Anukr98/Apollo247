
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import SmsListener from 'react-native-android-sms-listener'
import { BaseScene } from '../common';

export default class Card extends BaseScene {

	constructor(props) {
		super(props);
		this.state = { otp: '' };
	}


	componentDidMount() {
		this.subscription = SmsListener.addListener(message => {
			console.log(message, 'message')
		})
	}

	componentWillUnmount() {
		this.subscription.remove();
	}

	render() {
		const styles = this.styleSheet();
		return (
			<View style={[styles.cardContainer, this.props.cardContainer]}>
				<Text style={styles.headingText}>{this.props.heading}</Text>
				<Text style={styles.descriptionText}>{this.props.description}</Text>
				<TouchableOpacity style={styles.buttonStyle} onPress={this.props.onClickButton} activeOpacity={this.props.disableButton ? 1 : 0.5} >
					<Image {...this.appImages(this.props.buttonIcon)} />
				</TouchableOpacity>
				{this.props.children}
			</View>
		);
	}

	defaultStyles() {
		const { Colors, Fonts } = this.theme();
		return {
			cardContainer: {
				margin: 40,
				borderRadius: 10,
				backgroundColor: Colors.CARD_BG,
				padding: 20,
				marginBottom: 0
			},
			headingText: {
				paddingVertical: 10,
				color: Colors.CARD_HEADER,
				...Fonts.IBMPlexSansSemiBold(36),
			},
			descriptionText: {
				color: Colors.CARD_DESCRIPTION,
				paddingBottom: 35,
				...Fonts.IBMPlexSansMedium(17),
			},
			buttonStyle: {
				position: 'absolute',
				bottom: 15,
				right: -20,
				height: 64,
				width: 64
			}
		}
	}
}
