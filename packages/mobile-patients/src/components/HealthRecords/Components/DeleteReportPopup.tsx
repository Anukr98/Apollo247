import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Overlay, OverlayProps } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface DeleteReportPopupProps extends Omit<OverlayProps, 'children' | 'isVisible'> {
  onPressClose: () => void;
  onPressOK: () => void;
  deleteRecordText: string;
}

export const DeleteReportPopup: React.FC<DeleteReportPopupProps> = (props) => {
  const { onPressClose, onPressOK, deleteRecordText, ...overlayProps } = props;

  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIconViewStyle}>
        <TouchableOpacity onPress={onPressClose}>
          <CrossPopup style={styles.crossIconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Overlay
      isVisible
      windowBackgroundColor={'rgba(0, 0, 0, 0.3)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.overlayStyle}
      {...overlayProps}
    >
      <View style={styles.overlayViewStyle}>
        <View style={styles.overlaySafeAreaViewStyle}>
          {renderCloseIcon()}
          <View style={styles.deleteReportPopupMainViewStyle}>
            <View style={styles.deleteReportViewStyle}>
              <Text style={styles.deleteReportTextStyle}>{string.common.delete_report_text}</Text>
            </View>
            <View style={styles.deleteMessageViewStyle}>
              <View style={styles.deleteReportMessageTextViewStyle}>
                <Text style={styles.deleteReportMessage1TextStyle}>
                  {string.common.delete_report_confirm_text.replace(
                    '{0}',
                    deleteRecordText || 'record'
                  )}
                </Text>
              </View>
              <View style={styles.buttonViewStyle}>
                <Button
                  title={string.cancel.toUpperCase()}
                  onPress={onPressClose}
                  style={styles.deleteReportButtonStyle}
                  titleTextStyle={styles.cancelBtnTextStyle}
                />
                <Button
                  title={'OK'}
                  onPress={onPressOK}
                  style={[styles.deleteReportButtonStyle, styles.okBtnStyle]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </Overlay>
  );
};

const { text } = theme.viewStyles;
const { BUTTON_BG, SHERPA_BLUE, WHITE, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    zIndex: 100,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
  },
  closeIconViewStyle: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  deleteReportPopupMainViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CARD_BG,
    overflow: 'hidden',
  },
  deleteReportViewStyle: {
    paddingVertical: 18,
    ...theme.viewStyles.cardViewStyle,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    marginBottom: 10,
    shadowOpacity: 0.2,
  },
  deleteReportTextStyle: {
    ...theme.viewStyles.text('M', 16, LIGHT_BLUE, 1, 21),
    textAlign: 'center',
  },
  deleteMessageViewStyle: { backgroundColor: theme.colors.CARD_BG },
  deleteReportMessageTextViewStyle: { paddingTop: 0, paddingHorizontal: 20, paddingBottom: 37 },
  deleteReportMessage1TextStyle: {
    ...text('M', 16, LIGHT_BLUE, 1, 20),
  },
  deleteReportButtonStyle: {
    width: '50%',
    alignSelf: 'center',
    backgroundColor: WHITE,
    marginBottom: 16,
    flex: 1,
  },
  cancelBtnTextStyle: { color: SHERPA_BLUE },
  okBtnStyle: { marginLeft: 20, backgroundColor: BUTTON_BG },
  buttonViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    flex: 1,
  },
  crossIconStyle: { marginRight: 1, width: 28, height: 28 },
});
