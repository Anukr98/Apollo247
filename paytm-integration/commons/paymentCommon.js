
const logger = require('../winston-logger')('Universal-Error-Logs');
const axios = require('axios');

const getCurrentSellingPrice = async (orderId, planId, subPlanId) => {
	const axiosConfig = {
		headers: {
			'authorization': process.env.API_TOKEN
		}
	};
	let paramString = `plan_id:"${planId}"`;
	if (subPlanId) {
		paramString += `,sub_plan_id:"${subPlanId}"`;
	}
	const getPlanDetails = {
		query:
			`query GetCurrentSellingPrice {
					GetCurrentSellingPrice(${paramString}) {
						price
						code
						message
					}
				}`,
	};
	const planDetails = await axios.post("https://aph.dev.api.popcornapps.com", getPlanDetails, axiosConfig);
	if (planDetails && planDetails.data.errors && planDetails.data.errors.length) {
		logger.error(
			`${orderId} - universal-request-getPlanDetails - ${JSON.stringify(planDetails.data.errors)}`
		);
		throw new Error(`Error occured in getPlanDetails for orderId:${orderId}`);
	}
	logger.info(`${orderId} - universal-request-getPlanDetails - ${JSON.stringify(planDetails.data)}`);
	if (!planDetails.data.data.GetCurrentSellingPrice.price) {
		logger.error(
			`${orderId} - universal-request-getPlanDetails - ${JSON.stringify(planDetails.data.errors)}`
		);
		throw new Error(`${orderId} - universal-request-getPlanDetails - price is missing in response`);
	}
	//console.log(planDetails.data.GetCurrentSellingPrice); process.exit(1);;
	return planDetails.data.data.GetCurrentSellingPrice.price;
};

const additionalMercUnqRef = (mercObj, additionalParams) => {
	mercObj = { ...mercObj, ...additionalParams };
	return JSON.stringify(mercObj);
};

module.exports = {
	getCurrentSellingPrice,
	additionalMercUnqRef
};
