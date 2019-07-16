import React from 'react';
import { View } from 'react-native';

export interface PatientsProps {}

export const Patients: React.FC<PatientsProps> = (props) => {
  return <View style={{ flex: 1, backgroundColor: 'white' }} />;
};
