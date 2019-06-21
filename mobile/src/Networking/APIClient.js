
'use strict';

import axios from 'axios';

class APIClient {
	static timeout = 15000;

	constructor() {
		this.client = null;
		this.reset = this.reset.bind(this);
		this.signRequest = this.signRequest.bind(this);
		this.apiGet = this.apiGet.bind(this);
		this.apiPost = this.apiPost.bind(this);
		this.apiPut = this.apiPut.bind(this);
		this.apiDelete = this.apiDelete.bind(this);
	}

	reset() {
		this.client = null;
	}

	updateHeader(obj) {
		const updateHeader = () => {
			Object.keys(obj).forEach(k => {
				this.client.defaults.headers.common[k] = obj[k];
			});
		};
		if (!!this.client) {
			updateHeader();
		} else {
			this.prepare(true).then(updateHeader);
		}
	}

	updateAuthToken(token = null) {
		const Authorization = token ? `Bearer ${token}` : null;
		this.updateHeader({ Authorization });
	}

	prepare(needAuthentication) {
		return new Promise((resolve, reject) => {
			if (this.client) {
				if (needAuthentication && !this.client.defaults.headers.common.Authorization) {
					reject('Unauthorized: Access token not found');
					return;
				}
				resolve(this.client);
			} else {
                if (config) {
                    const { headers, auth_token, base_url } = config;
                    this.client = axios.create({ baseURL: base_url, headers, timeout: APIClient.timeout });
                    this.client.config = config;
                    resolve(this.client);
                    // NOTE: this line is not much more useful. Used on hybrid project.
                    auth_token && this.updateAuthToken(auth_token);
                } else {
                    reject('Error: Cannot fetch client config');
                }
			}
		});
    }

	apiGet(url, { config = null, needAuthentication = true, excludeError = [], fullResponse = false } = {}) {
		return new Promise((resolve, reject) => {
			this.prepare(needAuthentication)
				.then(apiClient => {
					apiClient
						.get(url, config)
						.then(response => this.handleResponse(response, resolve, fullResponse))
						.catch(error => this.handleError(error, reject, excludeError));
				})
				.catch(error => this.handleError(error, reject));
		});
	}

	apiDelete(url, { config = null, needAuthentication = true, excludeError = [], fullResponse = false } = {}) {
		return new Promise((resolve, reject) => {
			this.prepare(needAuthentication)
				.then(apiClient => {
					apiClient
						.delete(url, config)
						.then(response => this.handleResponse(response, resolve, fullResponse))
						.catch(error => this.handleError(error, reject, excludeError));
				})
				.catch(error => this.handleError(error, reject));
		});
	}

	apiPost(url, params, { config = null, needAuthentication = true, excludeError = [], fullResponse = false } = {}) {
		return new Promise((resolve, reject) => {
			this.prepare(needAuthentication)
				.then(apiClient => {
					apiClient
						.post(url, params, config)
						.then(response => this.handleResponse(response, resolve, fullResponse))
						.catch(error => this.handleError(error, reject, excludeError));
				})
				.catch(error => this.handleError(error, reject));
		});
	}

	apiPut(url, params, { config = null, needAuthentication = true, excludeError = [], fullResponse = false } = {}) {
		return new Promise((resolve, reject) => {
			this.prepare(needAuthentication)
				.then(apiClient => {
					apiClient
						.put(url, params, config)
						.then(response => this.handleResponse(response, resolve, fullResponse))
						.catch(error => this.handleError(error, reject, excludeError));
				})
				.catch(error => this.handleError(error, reject));
		});
	}

	handleResponse(response, resolve, fullResponse = false) {
		resolve(fullResponse ? response : response.data);
	}

	handleError(error, reject, excludeError = []) {
		if (error && error.response && error.response.status) {
			if (error.response.status === 401 && !excludeError.includes(401)) {
				// AppEvents.emitUserSessionTimeout();
			}
		}
		reject(error);
	}
}

const sharedAPIClient = new APIClient();
const apiGet = sharedAPIClient.apiGet;
const apiDelete = sharedAPIClient.apiDelete;
const apiPost = sharedAPIClient.apiPost;
const apiPut = sharedAPIClient.apiPut;

module.exports = {
	sharedAPIClient,
	apiGet,
	apiDelete,
	apiPost,
	apiPut,
	APIClient
};
