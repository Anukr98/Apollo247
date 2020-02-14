import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

export interface PatientHealthVaultProps {}

export const PatientHealthVault: React.FC<PatientHealthVaultProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard
        heading={strings.case_sheet.patient_health_vault}
        collapse={show}
        onPress={() => setShow(!show)}
      />
    </View>
  );
};
