import { NativeModules, Platform } from 'react-native';

const { RNAppSignatureHelper } = NativeModules;

export const AppSignature = {
  getAppSignature: Platform.OS === 'android' ? RNAppSignatureHelper.getAppSignatures : () => {},
  getAppSignatures: Platform.OS === 'android' ? RNAppSignatureHelper.getAppSignatures : () => {},
};
