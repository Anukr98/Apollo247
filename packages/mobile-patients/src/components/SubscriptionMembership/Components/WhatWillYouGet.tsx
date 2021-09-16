import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DownOrange, UpOrange } from '@aph/mobile-patients/src/components/ui/Icons';

export interface WhatWillYouGetProps {
  benefits: any;
  getEllipseBulletPoint: (text: string) => Element;
}

export const WhatWillYouGet: React.FC<WhatWillYouGetProps> = (props) => {
  const { benefits, getEllipseBulletPoint } = props;
  const [isWhatWillYouGetVisible, setIsWhatWillYouGetVisible] = useState<boolean>(true);
  return (
    <View style={styles.cardStyle}>
      <TouchableOpacity
        onPress={() => {
          setIsWhatWillYouGetVisible(!isWhatWillYouGetVisible);
        }}
        style={styles.sectionsHeading}
      >
        <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 20, 0.35)}>
          What Will You Get!
        </Text>
        {isWhatWillYouGetVisible ? (
          <DownOrange style={styles.arrowStyle} />
        ) : (
          <UpOrange style={styles.arrowStyle} />
        )}
      </TouchableOpacity>
      {isWhatWillYouGetVisible && (
        <View
          style={{
            marginTop: 15,
          }}
        >
          {benefits.map((value) => {
            return getEllipseBulletPoint(value.headerContent);
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  sectionsHeading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrowStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
});
