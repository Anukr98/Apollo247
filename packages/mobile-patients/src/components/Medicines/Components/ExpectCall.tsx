import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Clipboard, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Copy, CallRingIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Snackbar } from 'react-native-paper';

export interface ExpectCallProps {}

export const ExpectCall: React.FC<ExpectCallProps> = (props) => {
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [highlightComponent, setHighlightComponent] = useState<boolean>(true);
  const phoneNumber = '040 48212890';

  useEffect(() => {
    setTimeout(() => {
      setHighlightComponent(false);
    }, 700);
  }, []);

  const renderMsg = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.flexRow}>
          <Text style={styles.headerTxt}>Expect a Call from</Text>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={copyToClipboard}>
            <Text style={theme.viewStyles.text('B', 15, '#01475B', 1, 18)}>{phoneNumber}</Text>
            <Copy style={styles.iconStyle} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTxt}>that’s our pharmacist!</Text>
      </View>
    );
  };

  const copyToClipboard = () => {
    Clipboard.setString(phoneNumber);
    setSnackbarState(true);
  };

  return (
    <View style={[styles.card, highlightComponent ? styles.highlightedCard : {}]}>
      <CallRingIcon style={styles.apollo247Icon} />
      {renderMsg()}
      <Snackbar
        style={styles.snackBarStyle}
        visible={snackbarState}
        onDismiss={() => {
          setSnackbarState(false);
        }}
        duration={1000}
      >
        Number Copied
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
    borderRadius: 5,
    paddingVertical: 9,
    flexDirection: 'row',
    borderColor: '#02475B',
    borderWidth: 0.5,
    alignItems: 'center',
  },
  highlightedCard: {
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    ...theme.viewStyles.shadowStyle,
    shadowOpacity: 0.7,
    shadowRadius: 20,
    backgroundColor: '#EDF9EC',
  },
  apollo247Icon: {
    marginHorizontal: 10,
    marginRight: 10,
    height: 30,
    width: 30,
  },
  headerTxt: {
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 18,
    color: '#01475B',
    paddingRight: 5,
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  snackBarStyle: {
    position: 'absolute',
    zIndex: 1001,
    bottom: -30,
    backgroundColor: theme.colors.light_label,
  },
  flexRow: {
    flexDirection: 'row',
  },
});
