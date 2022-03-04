import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

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
      title={'Oops!'}
      description={'There is no internet. Please check your internet connection.'}
      onPressBack={props.onClickClose}
    >
      <View style={{ height: 60, alignItems: 'flex-end' }}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.gotItStyles}
          onPress={() => {
            props.onClickClose();
          }}
        >
          <Text style={styles.gotItTextStyles}>OK, GOT IT</Text>
        </TouchableOpacity>
      </View>
    </BottomPopUp>
  );
};
