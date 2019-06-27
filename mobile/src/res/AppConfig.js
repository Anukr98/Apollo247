/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

const dateFormats = {
	PUNCHH_SERVER_DATE_FORMAT: 'YYYY-MM-DDTHH:mm:ssZ',
	PUNCHH_APP_DATE_FORMAT: 'MMM DD YYY',
	PUNCHH_SERVER_BIRTHDAY_DATE_FORMAT: 'YYYY-MM-DD',
	PUNCHH_APP_BIRTHDAY_DATE_FORMAT: 'MMM DD YYYY',
	AC_HISTORY_DATE_FORMAT: 'MMM DD',
	REWARD_DATE_FORMAT: 'MMM DD, YYYY'
};

const user = {
	USER_MINIMUM_AGE_REQUIRED: 13,
	USER_MINIMUM_ANNIVERSARY_YEARS_REQUIRED: 18
};

const registration = {
	FB_READ_PERMISSIONS: ['public_profile', 'user_birthday', 'email'],
	FB_GRAPH_PATH: '/me?fields=id,birthday,email,first_name,last_name'
};

const common = {
	TEXT_INPUT_AUTO_FOCUS_TIME: 500,
	TEXT_INPUT_LABEL_UPPER_CASE: false,
	CURRENT_LOCATION_DELTA: { latitudeDelta: 5, longitudeDelta: 5 },
	MULTIPLE_FAV_LOCATION: false,
	ACTIVE_REDEMPTION_HEIGHT: 40,
	QR_CODE_SIZE: 220,
	OFFLINE_SNACK_BAR_HIDE_TIME: 3000,
	INITIAL_ROUTE_NAME: 'tab2',
	DEFAULT_TAB_NAME: 'tab2',
	PROGRAM_TYPE: 'POINT_BASED', // oneOf(['POINT_BASED', 'POINT_UNLOCK_REDEEMABLE', 'SURPRISE_AND_DELIGHT','VISIT_BASED'])
	OLO_MODULE: false,
	RICH_MESSAGE_ON_TAB: false,
	BUTTON_TITLE_LABEL_UPPER_CASE: false,
	LOCATION_DETAIL_HEADER_TITLE_UPPER_CASE: false
};

const loyalty = {
	BARCODE_MAX_LENGTH: 32,
	CANCEL_REDEMPTION: false,
	IMAGE_DOT_PAGER: true
};

module.exports = {
	...common,
	...dateFormats,
	...registration,
	...user,
	...loyalty
};
