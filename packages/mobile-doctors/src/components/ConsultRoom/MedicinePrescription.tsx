import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

export interface MedicinePrescriptionProps {}

export const MedicinePrescription: React.FC<MedicinePrescriptionProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard
        heading={strings.case_sheet.medicine_prescription}
        children={strings.common.hi}
        collapse={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
};
