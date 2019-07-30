import React, { useState } from 'react';
import { View } from 'react-native';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';

export interface PatientHealthVaultProps {}

export const PatientHealthVault: React.FC<PatientHealthVaultProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <View>
      <CollapseCard heading="Patient Health Vault" collapse={show} onPress={() => setShow(!show)} />
    </View>
  );
};
