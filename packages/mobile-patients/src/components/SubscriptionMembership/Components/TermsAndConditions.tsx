import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Hdfc_values, Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DownOrange, UpOrange } from '@aph/mobile-patients/src/components/ui/Icons';

export interface TermsAndConditionsProps {
  isCirclePlan?: boolean;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = (props) => {
  const [isTnCVisible, setIsTnCVisible] = useState<boolean>(false);
  const TnC = props.isCirclePlan ? Circle.TnC : Hdfc_values.TnC;
  return (
    <View style={[styles.cardStyle, styles.tncContainer]}>
      <TouchableOpacity
        onPress={() => {
          setIsTnCVisible(!isTnCVisible);
        }}
        style={styles.sectionsHeading}
      >
        <Text style={styles.tncHeading}>Terms and Conditions</Text>
        {isTnCVisible ? (
          <DownOrange style={styles.arrowStyle} />
        ) : (
          <UpOrange style={styles.arrowStyle} />
        )}
      </TouchableOpacity>
      {isTnCVisible && (
        <View
          style={{
            padding: 10,
          }}
        >
          {TnC.map((text, index) => {
            return <Text style={styles.tncText}>{`${index + 1}. ${text}`}</Text>;
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
  tncContainer: {
    backgroundColor: '#FFFFFF',
    marginVertical: 20,
    borderRadius: 0,
    marginHorizontal: -10,
  },
  sectionsHeading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tncHeading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 20, 0.35),
    paddingLeft: 10,
  },
  tncText: {
    ...theme.viewStyles.text('M', 13, '#02475B', 1, 20, 0.35),
    marginBottom: 15,
  },
  arrowStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
});
