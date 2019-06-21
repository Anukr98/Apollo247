/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
// import SnackBar from './SnackBar';

import BaseComponent from './BaseComponent';

class Spinner extends BaseComponent {
	state = {
		isLoading: this.props.isLoading,
		title: this.props.title,
		subTitle: this.props.subTitle,
		showOffline: this.props.showOffline
	};

	show(isLoading, title, subTitle) {
		this.setState({ isLoading, title, subTitle });
	}

	showOffline(showOffline = true) {
		this.setState({ showOffline });
	}

	renderText(title, style) {
		return title ? <Text style={style}>{title}</Text> : null;
	}

	// renderOffline(styles) {
	// 	return (
	// 		<SnackBar
	// 			visible={this.state.showOffline}
	// 			actions={[
	// 				{
	// 					label: this.ls('retry'),
	// 					textStyle: styles.snackBarRetryText,
	// 					onPress: this.props.onOfflineRetryTapped,
	// 					style: styles.actionRetryStyle
	// 				},
	// 				{
	// 					label: this.ls('cancel'),
	// 					textStyle: styles.snackBarCancelText,
	// 					onPress: () => this.showOffline(false),
	// 					style: styles.actionCancelStyle
	// 				}
	// 			]}
	// 		>
	// 			{this.ls('offlineMsg')}
	// 		</SnackBar>
	// 	);
	// }

	renderSpinner(styles) {
		const { container, titleStyle, subTitleStyle } = styles;
		return (
			<View style={[container, this.props.style]}>
				{this.renderText(this.state.title, titleStyle)}
				{this.renderText(this.state.subTitle, subTitleStyle)}
			</View>
		);
	}

	render() {
		const styles = this.styleSheet();
		// if (this.state.showOffline) {
		// 	return this.renderOffline(styles);
        // } else 
        if (this.props.isLoading || this.state.isLoading) {
			return this.renderSpinner(styles);
		}
		return null;
	}

	defaultStyles() {
		const { Colors } = this.theme();
		const screenWidth = Dimensions.get('window').width;
		return {
			container: {
				width: screenWidth,
				...StyleSheet.absoluteFill,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: Colors.SPINNER_BG,
				elevation: 1,
				zIndex: 100
			},
			animationContainer: {
				height: 120,
				width: 120
			},
			titleStyle: {
				marginTop: 15,
				textAlign: 'center',
				fontSize: 16,
				color: Colors.SPINNER_TITLE_TEXT,
				backgroundColor: Colors.SPINNER_TITLE_BG
			},
			subTitleStyle: {
				textAlign: 'center',
				marginTop: 5,
				fontSize: 12,
				color: Colors.SPINNER_SUB_TITLE_TEXT,
				backgroundColor: Colors.SPINNER_SUB_TITLE_BG
			},
			snackBarRetryText: {
				color: Colors.SNACK_BAR_RETRY_TEXT,
				fontWeight: 'bold'
			},
			snackBarCancelText: {
				color: Colors.SNACK_BAR_CANCEL_TEXT
			},
			actionRetryStyle: {},
			actionCancelStyle: {}
		};
	}

	// customStyles() {
	// 	return this.theme().ComponentStyles.Spinner(this.props);
	// }
}

export default Spinner;
