import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import {
  nextAvailability,
  timeDiffFromNow,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface AvailabilityCapsuleProps {
  availableTime: string;
  styles?: StyleProp<ViewStyle>;
}

export const AvailabilityCapsule: React.FC<AvailabilityCapsuleProps> = (props) => {
  const timeDiff: Number = timeDiffFromNow(props.availableTime);
  if (props.availableTime)
    return (
      <CapsuleView
        upperCase
        title={nextAvailability(props.availableTime)}
        style={props.styles}
        isActive={Number(timeDiff) > 15 || timeDiff < 0 ? false : true}
      />
    );
  return null;
};
