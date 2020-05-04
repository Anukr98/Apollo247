import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Mascot } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  helpView: {
    width: '100%',
    // height: 212,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needhelpbuttonStyles: {
    backgroundColor: 'white',
    height: 50,
    width: 120,
    marginTop: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
  },
  titleBtnStyles: {
    ...theme.viewStyles.text('M', 16, '#0087ba', 1, undefined, -0.36),
    // color: theme.colors.SKY_BLUE,
  },
  mascotImageStyle: {
    height: 80,
    width: 80,
  },
});

export interface NeedHelpAssistantProps {
  containerStyle?: StyleProp<ViewStyle>;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  onNeedHelpPress?: () => void;
}

export const NeedHelpAssistant: React.FC<NeedHelpAssistantProps> = (props) => {
  const showNeed = () => {
    CommonLogEvent(AppRoutes.MobileHelp, 'MobileHelp_clicked');
    props.onNeedHelpPress && props.onNeedHelpPress();
    props.navigation && props.navigation.navigate(AppRoutes.MobileHelp);
  };
  return (
    <View style={[styles.helpView, props.containerStyle]}>
      <Mascot style={styles.mascotImageStyle} />
      <Button
        onPress={() => showNeed()}
        title="Customer Care"
        style={styles.needhelpbuttonStyles}
        titleTextStyle={styles.titleBtnStyles}
        displayThorn={true}
      />
    </View>
  );
};
