/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React from 'react';
import { Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const windowWidth = Dimensions.get('window').width;

export const textComponent = (
  message: string,
  numOfLines: number | undefined,
  color: string,
  needStyle: boolean
) => {
  return (
    <Text
      style={{
        ...theme.viewStyles.text('SB', 13, color, 1, 20),
        marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
      }}
      numberOfLines={numOfLines}
    >
      {message}
    </Text>
  );
};
