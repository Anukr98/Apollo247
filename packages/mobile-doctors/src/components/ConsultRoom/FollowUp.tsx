import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';

export interface FollowUpProps {}

export const FollowUp: React.FC<FollowUpProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard heading="Follow Up" collapse={show} onPress={() => setShow(!show)} />
    </View>
  );
};
