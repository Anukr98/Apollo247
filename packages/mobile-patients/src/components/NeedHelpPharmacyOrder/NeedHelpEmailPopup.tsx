import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GrayEditIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Overlay, OverlayProps } from 'react-native-elements';

export interface NeedHelpEmailPopupProps extends Omit<OverlayProps, 'children' | 'isVisible'> {
  onPressSendORConfirm: (email: string) => void;
}

export const NeedHelpEmailPopup: React.FC<NeedHelpEmailPopupProps> = (props) => {
  const { onPressSendORConfirm, ...overlayProps } = props;
  const { currentPatient } = useAllCurrentPatients();
  const [email, setEmail] = useState<string>(currentPatient?.emailAddress || '');
  const [emailValidation, setEmailValidation] = useState<boolean>(
    currentPatient?.emailAddress ? true : false
  );
  const [isFocused, setFocused] = useState<boolean>(false);
  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
  };

  const renderEmailField = () => {
    return (
      <View>
        <Text style={styles.email}>
          {currentPatient?.emailAddress
            ? 'Please confirm your email id '
            : 'Please enter your email id (Mandatory)'}
        </Text>
        <TextInputComponent
          placeholder={'Enter email id'}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text: string) => _setEmail(text)}
          icon={
            !isFocused && currentPatient?.emailAddress ? (
              <GrayEditIcon style={styles.editIcon} />
            ) : null
          }
          inputStyle={styles.emailInput}
          conatinerstyles={styles.emailInputContainer}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!emailValidation && email ? (
          <Text style={styles.errorTextStyle}>{'Please enter your valid email address'}</Text>
        ) : null}
      </View>
    );
  };

  const onPressConfirmOrSend = () => {
    if (!emailValidation) {
      return;
    }
    onPressSendORConfirm(email);
  };

  return (
    <Overlay
      isVisible
      windowBackgroundColor={'rgba(0, 0, 0, 0.3)'}
      containerStyle={{ marginBottom: 0 }}
      overlayStyle={styles.overlayStyle}
      {...overlayProps}
    >
      <View style={styles.popupMainViewStyle}>
        {renderEmailField()}
        <Text style={styles.doneTextStyle} onPress={onPressConfirmOrSend}>
          {currentPatient?.emailAddress ? 'CONFIRM' : 'DONE'}
        </Text>
      </View>
    </Overlay>
  );
};

const { text } = theme.viewStyles;
const { LIGHT_BLUE, SKY_BLUE, BUTTON_BG, INPUT_FAILURE_TEXT } = theme.colors;
const styles = StyleSheet.create({
  overlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    width: 'auto',
    maxWidth: '90%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  popupMainViewStyle: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CARD_BG,
    overflow: 'hidden',
    paddingBottom: 25,
  },
  email: {
    ...text('M', 14, LIGHT_BLUE, 1, 18.2),
    marginTop: 26,
    marginBottom: 6,
  },
  contentContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  editIcon: { height: 25, width: 25, resizeMode: 'contain' },
  emailInput: { paddingBottom: 5, color: SKY_BLUE },
  emailInputContainer: { marginBottom: 0 },
  doneTextStyle: {
    ...text('B', 13, BUTTON_BG, 1, 16.9),
    textAlign: 'right',
    paddingLeft: 10,
    marginTop: 10,
  },
  errorTextStyle: {
    ...text('M', 13, INPUT_FAILURE_TEXT, 1, 16.9),
  },
});
