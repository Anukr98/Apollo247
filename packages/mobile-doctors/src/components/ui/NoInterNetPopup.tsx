import { BottomPopUp } from '@aph/mobile-doctors/src/components/ui/BottomPopUp';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface NoInterNetPopupProps {
  onClickClose: () => void;
}

export const NoInterNetPopup: React.FC<NoInterNetPopupProps> = (props) => {
  return (
    <BottomPopUp
      title={strings.alerts.oops}
      description={strings.alerts.no_internet}
      onPressBack={props.onClickClose}
    >
      <View style={{ height: 60, alignItems: 'flex-end' }}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.gotItStyles}
          onPress={() => {
            props.onClickClose();
          }}
        >
          <Text style={styles.gotItTextStyles}>{strings.buttons.ok_got_it}</Text>
        </TouchableOpacity>
      </View>
    </BottomPopUp>
  );
};
