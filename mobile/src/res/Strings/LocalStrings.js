/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

const common = {
	add: 'Add',
};

const login ={ 
	hello: 'hello',
	please_enter_no: 'Please enter your mobile number to login',
	otp_sent_to : 'OTP will be sent to this number',
	wrong_number: 'This seems like a wrong number',
	numberPrefix: '+91',
	great: 'great',
	type_otp_text: 'Type in the OTP sent to you, to authenticate',
	resend_opt: 'RESEND OTP',
	enter_correct_opt: 'Please enter the correct OTP',
	welcome_text:'welcome\nto apollo 24/7',
	welcome_desc:'Let us quickly get to know you so that we can get you the best help :)'

}

module.exports = {
	...common,
	...login
};
