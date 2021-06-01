import { colors } from '@aph/mobile-patients/src/theme/colors';
import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

interface Props extends TextProps {
  c?: keyof typeof colors; // color
  o?: TextStyle['opacity'];
  fs?: TextStyle['fontSize'];
  fw?: TextStyle['fontWeight'];
  lh?: TextStyle['lineHeight'];
  ls?: TextStyle['letterSpacing'];
  ta?: TextStyle['textAlign'];
  m?: TextStyle['margin'];
  mh?: TextStyle['marginHorizontal'];
  mv?: TextStyle['marginVertical'];
  mt?: TextStyle['marginTop'];
  mb?: TextStyle['marginBottom'];
  ml?: TextStyle['marginLeft'];
  mr?: TextStyle['marginRight'];
}

export const AppText: React.FC<Props> = ({
  c,
  o,
  fs,
  fw,
  lh,
  ls,
  ta,
  m,
  mh,
  mv,
  mt,
  mb,
  ml,
  mr,
  style,
  ...props
}) => {
  const appliedStyle: TextStyle = {
    ...(c ? { color: colors?.[c!] } : {}),
    ...(o ? { opacity: o } : {}),
    ...(fs ? { fontSize: fs } : {}),
    ...(fw ? { fontWeight: fw } : {}),
    ...(lh ? { lineHeight: lh } : {}),
    ...(ls ? { letterSpacing: ls } : {}),
    ...(ta ? { textAlign: ta } : {}),
    ...(m ? { margin: m } : {}),
    ...(mh ? { marginHorizontal: mh } : {}),
    ...(mv ? { marginVertical: mv } : {}),
    ...(mt ? { marginTop: mt } : {}),
    ...(mb ? { marginBottom: mb } : {}),
    ...(ml ? { marginLeft: ml } : {}),
    ...(mr ? { marginRight: mr } : {}),
  };

  return <Text {...props} style={[styles.text, appliedStyle, style]} />;
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'IBMPlexSans',
    color: colors.SHERPA_BLUE,
    fontWeight: '400',
    fontSize: 14,
  },
});
