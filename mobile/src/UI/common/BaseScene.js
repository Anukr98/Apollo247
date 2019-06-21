/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, BackHandler, Platform, InteractionManager } from 'react-native';

import BaseComponent from './BaseComponent';
import Spinner from './Spinner';

class BaseScene extends BaseComponent {
	constructor(props) {
		super(props);
		this.navigate = this.navigate.bind(this);
		this.showSpinner = this.showSpinner.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleError = this.handleError.bind(this);
		this.goBack = this.goBack.bind(this);
		this.registerEvents();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBack);
	}

	registerEvents() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBack);
	}

	backButton({ cancel = false, showOnAndroid = false, title = null } = {}) {
		if (Platform.OS === 'ios' || showOnAndroid) {
			return {
				title: title || (cancel ? this.ls('cancel') : this.ls('back')),
				onPress: () => this.goBack()
			};
		}
		return null;
	}

	/// Navigation
	handleBack() {
		const navigator = this.props.navigator;
		if (navigator) {
			try {
				const navLength = navigator.getCurrentRoutes().length;
				const mainNav = this.props.mainNavigator;
				if (navigator.jumpBack && navigator.jumpBack === true) {
					navigator._jumpN(-1);
					return true;
				} else if (navigator.popBack) {
					return false;
				} else if (mainNav && mainNav.pop && navLength === 1) {
					mainNav.pop();
					return true;
				} else if (navLength === 1) {
					return false;
				} else if (navigator.pop) {
					navigator.pop();
					return true;
				}
			} catch (e) {
				console.log(e);
			}
		}
		return false;
	}

	goBack() {
		if (this.props.navigation && this.props.navigation.goBack) {
			this.props.navigation.goBack();
		}
	}

	navigate(scene, ...params) {
		if (this.props.navigation && this.props.navigation.navigate) {
			this.props.navigation.navigate(scene, ...params);
		}
	}

	replace(scene, ...params) {
		if (this.props.navigation && this.props.navigation.replace) {
			this.props.navigation.replace(scene, ...params);
		}
	}

	/// Text Input Auto focus
	textFieldAutoFocus(ref) {
		if (!!ref) {
			InteractionManager.runAfterInteractions(() => ref.focus());
		}
	}

	/// Spinner
	onOfflineRetry() {
		if (__DEV__) {
			console.warn('This is BaseScene, override onOfflineRetry method in customScene...');
		}
		this.showOffline(false);
	}

	handleError(
		error,
		{
			alert = true,
			errorTitle = this.ls('oops'),
			hideSpinner = true,
			showOffline = true,
			onAlertOkPress = () => {}
		} = {}
	) {
		hideSpinner && this.showSpinner(false);
		if (showOffline && error && typeof error !== 'string' && !error.response) {
			try {
				const errorJSON = JSON.stringify(error, null, 2);
				console.log(errorJSON, error);
			} catch (e) {
				console.log(error);
			}
			this.showOffline();
			return null;
		}
		const msg = error.message ? error.message : 'Something went wrong!'
		if (alert) {
			if (!(error && error.response && error.response.status === 401)) {
				this.showOKAlert(errorTitle, msg, onAlertOkPress);
			}
		}
		return msg;
	}

	showSpinner(isLoading = true, title = this.ls('loadingTitle'), subTitle = this.ls('loaderSubTitle')) {
		if (this.Spinner) {
			this.showOffline(false);
			this.Spinner.show(isLoading, title, subTitle);
		}
	}

	showOffline(show = true) {
		if (this.Spinner) {
			this.Spinner.showOffline(show);
		}
	}

	renderSpinner(showAppBackgroundColor = true, title = null, subtitle = null) {
		return (
			<Spinner
				ref={o => (this.Spinner = o)}
				title={title}
				subTitle={subtitle}
				onOfflineRetryTapped={this.onOfflineRetry.bind(this)}
				showAppBackgroundColor={showAppBackgroundColor}
			/>
		);
	}

	renderTab(height = 49) {
		return <View style={{ flex: 0, height, backgroundColor: 'transparent' }} />;
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<Text>I am the BaseScene component, Super Class of all Scenes.</Text>
				{this.renderSpinner()}
			</View>
		);
	}
}

BaseScene.propTypes = {
	navigation: PropTypes.object
};

BaseScene.defaultProps = {
	navigation: { goBack: () => null, navigate: () => null }
};

export default BaseScene;
