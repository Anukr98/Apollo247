import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';

export interface MedicinePrescriptionProps {}

export const MedicinePrescription: React.FC<MedicinePrescriptionProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard
        heading="Medicine Prescription"
        children="hi"
        collapse={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
};
