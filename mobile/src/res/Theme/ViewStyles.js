/**
 * Copyright (c) 2017-Present, Punchh, Inc.
 * All rights reserved.
 *
 * @flow
 */
'use strict';

import Colors from './Colors';

const viewStyles = {
	container: {
		flex: 1,
		backgroundColor: Colors.DEFAULT_BACKGROUND_COLOR
	},
	separator: {
		flex: 0,
		height: 1,
		marginHorizontal: 8,
		backgroundColor: Colors.LIGHT_SEPARATOR_COLOR
	},
	shadow: {
		shadowColor: Colors.SHADOW_COLOR,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.8,
		shadowRadius: 5
	},
	borderRadius: {
		borderRadius: 5,
		overflow: 'hidden'
	},
	disabled: {
		opacity: 0.5
	},
	footerButtonStyle: {
		margin: 16
	}
};

module.exports = {
	...viewStyles
};
