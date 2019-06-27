/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

import { Component } from 'react';

import sharedGRP from '../../GRP';

class BaseComponent extends Component {
	constructor(props) {
		super(props);
	}

	appConfig(k) {
		return k ? sharedGRP.config[k] : sharedGRP.config;
	}

	appImages(k) {
		return k ? sharedGRP.images[k] : sharedGRP.images;
	}

	appLottie(k) {
		return k ? sharedGRP.lottie[k] : sharedGRP.lottie;
	}

	// local strings
	ls(k) {
		return sharedGRP.lsV(k);
	}

	/// Stylesheet
	theme() {
		return sharedGRP.theme;
    }
    styleSheet() {
		return this.defaultStyles();
	}

	customStyles() {
		return null;
	}

	// /// alerts
	// showOKCancelAlert(...args) {
	// 	    Alerts.showOKCancelAlert(...args);
	// }

	// showOKAlert(...args) {
	// 	    Alerts.showOKAlert(...args);
	// }
}

export default BaseComponent;
