import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import {
  nextAvailability,
  timeDiffFromNow,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import moment from 'moment';

export interface AvailabilityCapsuleProps {
  availableTime: string;
  styles?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  availNowText?: string;
}

export const AvailabilityCapsule: React.FC<AvailabilityCapsuleProps> = (props) => {
  const timeDiff: Number = timeDiffFromNow(props.availableTime);

  if (props.availableTime && moment(props.availableTime).isValid())
    return (
      <CapsuleView
        upperCase
        title={props.availNowText || nextAvailability(props.availableTime)}
        style={props.styles}
        titleTextStyle={props.titleTextStyle}
        isActive={!(Number(timeDiff) > 15 || timeDiff < 0)}
      />
    );
  return null;
};
