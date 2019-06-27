/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

import { AppConfig, AnalyticStrings, Images, Lottie, LocalStrings, Theme } from './res';

let analyticStrings = null;
let appConfig = null;
let appImages = null;
let appLottie = null;
let appStrings = null;
let appTheme = null;

class GlobalResourceProvider {
	constructor() {
		analyticStrings = AnalyticStrings;
		appConfig = AppConfig;
		appImages = Images;
		appLottie = Lottie;
		appStrings = LocalStrings;
		appTheme = Theme;
		return this;
	}

	/// analytics strings
	gasV(k) {
		return this.gas[k] || '';
	}

	get gas() {
		return analyticStrings;
	}

	/// Config
	get config() {
		return appConfig;
	}

	/// Images
	get images() {
		return appImages;
	}

	/// Lottie
	get lottie() {
		return appLottie;
	}

	/// Strings
	lsV(k) {
		return this.ls[k] || '';
	}

	get ls() {
		return appStrings;
	}

	/// theme
	get theme() {
		return appTheme;
	}
}

const sharedGRP = new GlobalResourceProvider();

export default sharedGRP;
