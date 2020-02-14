import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

export interface FollowUpProps {}

export const FollowUp: React.FC<FollowUpProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard
        heading={strings.case_sheet.follow_up}
        collapse={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
};
