
'use strict';

const APP = {
	VERSION_NOTES: 'version_notes?version={0}&os={1}&model={2}'
};

const FEEDBACK = {
	CREATE_FEEDBACK: 'feedbacks'
};

const USER = {
	LOGIN: 'customers/login',
	SIGNUP: 'customers',
	LOGOUT: 'customers/logout',
	FB_LOGIN: 'customers/connect_with_facebook',
	GET_USER: 'customers',
	USER_LOYALTY: 'users/balance',
	UPDATE_USER: 'customers',
	ACCOUNT_HISTORY: 'accounts',
	FORGOT_PASSWORD: 'customers/forgot_password',
	REWARD_LIST: 'users/offers',
	COUPONS: 'coupons',
	WEBSSO: 'secure_tokens',
	MIGRATION_VALIDATE_USER: 'verify_token',
	FETCH_REDEMPTION: 'redemptions',
	PRE_SIGNED_URL: 'aws_s3_pre_signed_url?filename={0}'
};

module.exports = {
	APP,
	FEEDBACK,
	USER,
};
