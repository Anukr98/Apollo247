import React from 'react';
import { View } from 'react-native';

export interface MedicineProps {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  return <View style={{ flex: 1, backgroundColor: 'white' }} />;
};
