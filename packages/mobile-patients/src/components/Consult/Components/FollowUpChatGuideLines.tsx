import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Msgs, Wait, Emergency } from '@aph/mobile-patients/src/components/ui/Icons';
export interface FollowUpChatGuideLinesProps {
  followChatLimit: number;
}

export const FollowUpChatGuideLines: React.FC<FollowUpChatGuideLinesProps> = (props) => {
  const { followChatLimit } = props;

  function line1() {
    return (
      <View style={styles.lineCont}>
        <View style={styles.imageCont}>
          <Msgs />
        </View>
        <Text
          style={styles.line}
        >{`1. You can send ${followChatLimit} text messages before the doctor replies`}</Text>
      </View>
    );
  }
  function line2() {
    return (
      <View style={styles.lineCont}>
        <View style={styles.imageCont}>
          <Wait />
        </View>
        <Text style={styles.line}>
          2. Please wait as this is based on the doctor’s availability
        </Text>
      </View>
    );
  }
  function line3() {
    return (
      <View style={styles.lineCont}>
        <View style={styles.imageCont}>
          <Emergency />
        </View>
        <Text style={styles.line}>
          3. In case of an emergency, please reach out to the nearest hospital
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {line1()}
      {line2()}
      {line3()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 17,
    paddingBottom: 15,
  },
  lineCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  imageCont: {
    width: 31,
    height: 31,
  },
  line: {
    flex: 1,
    marginLeft: 20,
    flexWrap: 'wrap',
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 19,
    color: '#02475B',
  },
});
