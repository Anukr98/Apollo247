import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import HTML from 'react-native-render-html';
import { Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';

interface ConsultPackageTnCProps {
  tncText: string;
}

const styles = StyleSheet.create({
  tncContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    marginVertical: 24,
    marginHorizontal: 5,
  },

  tncTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginBottom: 5,
  },
  tnc: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE),
    opacity: 0.8,
  },
  tncAccordianIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 16,
    marginTop: 16,
  },
  banner: { width: '100%', height: 139, borderRadius: 5 },
});

export const ConsultPackageTnc: React.FC<ConsultPackageTnCProps> = (props) => {
  let tnc = props.tncText || '';
  const [isTncCollapsed, setTncCollapsed] = useState<boolean>(true);

  return (
    <View style={styles.tncContainer}>
      <Text style={styles.tncTitle}>Terms and Conditions</Text>
      {isTncCollapsed ? null : (
        <HTML
          html={tnc || ''}
          baseFontStyle={styles.tnc}
          ignoredStyles={[
            'line-height',
            'margin-bottom',
            'color',
            'text-align',
            'font-size',
            'font-family',
          ]}
        />
      )}

      {isTncCollapsed ? (
        <TouchableOpacity
          style={styles.tncAccordianIcon}
          onPress={() => {
            setTncCollapsed(!isTncCollapsed);
          }}
        >
          <Down />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.tncAccordianIcon}
          onPress={() => {
            setTncCollapsed(!isTncCollapsed);
          }}
        >
          <Up />
        </TouchableOpacity>
      )}
    </View>
  );
};
