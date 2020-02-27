import BottomButtonsStyles from '@aph/mobile-doctors/src/components/ui/BottomButtons.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import React from 'react';
import { StyleProp, TextStyle, TouchableOpacityProps, View, ViewStyle } from 'react-native';

const styles = BottomButtonsStyles;
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
