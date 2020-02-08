import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';

const styles = StyleSheet.create({
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
  footerButtonsContainer: {
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#fc9916',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  buttonsaveStyle: {
    width: '45%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
  },
});
//const renderButtonsView = () => {

export interface BottomButtonProps {
  style?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  whiteButtontitle?: string;
  yellowButtontitle?: string;
  onPress?: TouchableOpacityProps['onPress'];
  disabledOrange?: boolean;
  variant?: 'white' | 'orange';
  buttonIcon?: React.ReactNode;
  cancelFun?: TouchableOpacityProps['onPress'];
  successFun?: TouchableOpacityProps['onPress'];
  footerContainerStyle?: StyleProp<TextStyle>;
  viewStyles?: StyleProp<ViewStyle>;
}

export const BottomButtons: React.FC<BottomButtonProps> = (props) => {
  const { whiteButtontitle, yellowButtontitle, cancelFun, successFun } = props;
  return (
    <View style={[{ backgroundColor: '#ffffff' }, props.viewStyles]}>
      <View style={[styles.footerButtonsContainer]}>
        <Button
          title={whiteButtontitle}
          titleTextStyle={styles.buttonTextStyle}
          variant="white"
          style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          onPress={cancelFun}
        />
        <Button
          title={yellowButtontitle}
          disabled={props.disabledOrange}
          variant="orange"
          style={styles.buttonendStyle}
          onPress={successFun}
          //   onPress={() => delegateNumberUpdate(phoneNumber)}
        />
      </View>
    </View>
  );
};
