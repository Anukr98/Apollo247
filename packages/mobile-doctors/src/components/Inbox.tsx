import React from 'react';
import { View } from 'react-native';

export interface InboxProps {}

export const Inbox: React.FC<InboxProps> = (props) => {
  return <View style={{ flex: 1, backgroundColor: 'white' }} />;
};
