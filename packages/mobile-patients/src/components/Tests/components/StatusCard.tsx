import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getTestOrderStatusText,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY,
  DIAGNOSTIC_FAILURE_STATUS_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface StatusCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  titleText: DIAGNOSTIC_ORDER_STATUS;
  titleStyle?: StyleProp<TextStyle>;
}

export const StatusCard: React.FC<StatusCardProps> = (props) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY.includes(props.titleText)
            ? colors.COMPLETE_STATUS_BGK
            : DIAGNOSTIC_FAILURE_STATUS_ARRAY.includes(props.titleText)
            ? colors.FAILURE_STATUS_BGK
            : colors.INTERMITTENT_STATUS_BGK,
        },
      ]}
    >
      <Text
        style={[
          styles.titleStyle,
          {
            color: DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY.includes(props.titleText)
              ? colors.COMPLETE_STATUS_TEXT
              : DIAGNOSTIC_FAILURE_STATUS_ARRAY.includes(props.titleText)
              ? colors.FAILURE_STATUS_TEXT
              : colors.SHERPA_BLUE,
          },
        ]}
      >
        {nameFormater(getTestOrderStatusText(props.titleText!), 'title')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 6,
    height: 27,
    justifyContent: 'center',
  },
  titleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 14,
    textAlign: 'center',
  },
});
