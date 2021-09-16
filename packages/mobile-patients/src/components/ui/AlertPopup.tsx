import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

interface AlertPopupProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  onContinue: () => void;
  leftButton?: string | '';
  rightButton?: string | '';
  showCloseIcon?: boolean;
}

export const AlertPopup: React.FC<AlertPopupProps> = (props) => {
  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIcon}>
        <TouchableOpacity onPress={() => props.onDismiss()}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.row}>
        <Button
          title={props.leftButton}
          titleTextStyle={[styles.btnTxt, { color: colors.APP_YELLOW }]}
          style={styles.cancelBtn}
          onPress={() => {
            props.onDismiss();
          }}
        />
        <Button
          title={props.rightButton}
          titleTextStyle={styles.btnTxt}
          style={styles.continueBtn}
          onPress={() => {
            props.onContinue();
          }}
        />
      </View>
    );
  };

  return (
    <Overlay
      onRequestClose={() => props.onDismiss()}
      isVisible={props.visible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={styles.overlayStyle}
    >
      <View>
        {props.showCloseIcon ? renderCloseIcon() : null}
        <View style={styles.mainView}>
          <Text style={styles.title}>{props.title}</Text>
          {renderButtons()}
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '88.88%',
    height: '88.88%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.ASTRONAUT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelBtn: {
    backgroundColor: 'white',
    width: '45%',
  },
  continueBtn: {
    width: '45%',
  },
  btnTxt: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
    position: 'absolute',
    top: -45,
  },
});

AlertPopup.defaultProps = {
  leftButton: 'GO BACK',
  rightButton: 'CONTINUE',
  showCloseIcon: true,
};
