import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

export interface DiagnosisProps {}

export const Diagnosis: React.FC<DiagnosisProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard
        heading={strings.case_sheet.diagnosis}
        collapse={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
};
