
'use strict';

import { apiGet, apiPost, apiDelete, apiPut } from '../APIClient';
import { USER } from '../EndPoints';

export default class UserManager {

	static postRequest(path, params, excludeError) {
		return apiPost(path, params, { needAuthentication: false, excludeError });
	}

	static signUpUser(params) {
		return new Promise((resolve, reject) => {
            this.postRequest(USER.SIGNUP, params, [401])
                .then(resolve)
                .catch(reject);
		});
	}

	static loginUser(params) {
		return new Promise((resolve, reject) => {
            this.postRequest(USER.LOGIN, params, [401])
                .then(resolve)
                .catch(reject);
        });
	}

	static connectWithFacebook(fbGraphUser, accessToken) {
		return new Promise((resolve, reject) => {
            const params = {
                name: fbGraphUser.name,
                email: fbGraphUser.email,
                first_name: fbGraphUser.first_name,
                last_name: fbGraphUser.last_name,
                fb_uid: fbGraphUser.id,
                access_token: accessToken,
                privacy_policy: true
            };
            this.postRequest(USER.FB_LOGIN, params, [401])
                .then(resolve)
                .catch(reject);
        });
	}

	static logoutUser() {
		return apiDelete(USER.LOGOUT);
	}

	static forgotPassword(email) {
		return this.postRequest(USER.FORGOT_PASSWORD, { email });
	}

	static updateProfile(params) {
		return apiPut(USER.UPDATE_USER, params);
	}

	static fetchRewards() {
		return apiGet(USER.REWARD_LIST);
	}

	static webSSO() {
		return apiPost(USER.WEBSSO, { service: 'ordering' });
	}


	static getUser() {
		return apiGet(USER.GET_USER);
	}

	/// Only use for migrate user api/v1 to api/mobile (fetch user.auth_token.token using user.authentication_token)
	static fetchNewUserAuthToken(token) {
		const config = { headers: { Authorization: 'Basic ' + token } };
		return apiGet(USER.GET_USER, config);
	}

	static getPreSignedUrl(fileName) {
		return apiPost(USER.PRE_SIGNED_URL.sformat(fileName), { filename: fileName });
	}
}
