import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';

export interface DiagnosisProps {}

export const Diagnosis: React.FC<DiagnosisProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard heading="Diagnosis" collapse={show} onPress={() => setShow(!show)} />
    </View>
  );
};
