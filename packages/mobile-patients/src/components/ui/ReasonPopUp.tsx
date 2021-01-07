import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
  View,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DropdownGreen, CrossPopup, BackArrow } from '@aph/mobile-patients/src/components/ui/Icons';
import { Overlay } from 'react-native-elements';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

const styles = StyleSheet.create({
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  dropDownView: {
    margin: 0,
  },
  popUpHeadingStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  popUpHeadingTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
  },
  reasonForCancelStyle: {
    marginBottom: 12,
    color: '#02475B',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popUpMainView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  skipOptionTouch: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 50,
    marginBottom: 16,
  },
  skipText: { ...theme.viewStyles.yellowTextStyle, textAlign: 'center' },
});

export interface ReasonPopUpProps {
  style?: StyleProp<ViewStyle>;
  onPressSubmit: (selectedReason: string, comment: string) => void;
  cancelVisible: boolean;
  popUpHeadingStyle?: StyleProp<ViewStyle>;
  popUpHeadingTextStyle?: StyleProp<TextStyle>;
  headingText: string;
  reasonForCancelText: string;
  reasonForCancelStyle?: StyleProp<TextStyle>;
  dropDownOptions: string[];
  onPressCross: () => void;
  otherReasonText?: string;
  buttonText?: string;
  optionPlaceholderText?: string;
  commentsLabel?: string;
  commentsPlaceholderText?: string;
  othersPlaceholderText?: string;
  submitOthersWithoutComment?: boolean;
  showSkip?: boolean;
}

export const ReasonPopUp: React.FC<ReasonPopUpProps> = (props: ReasonPopUpProps) => {
  const [isCancelVisible, setCancelVisible] = useState<boolean>(props.cancelVisible);
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');

  const goBackPress = () => {
    setComment('');
    setSelectedReason('');
  };

  const renderReasonForCancelPopUp = () => {
    const optionsDropdown = overlayDropdown && (
      <Overlay
        onBackdropPress={() => setOverlayDropdown(false)}
        isVisible={overlayDropdown}
        overlayStyle={styles.dropdownOverlayStyle}
      >
        <DropDown
          cardContainer={styles.dropDownView}
          options={props.dropDownOptions.map(
            (options, i) =>
              ({
                onPress: () => {
                  setSelectedReason(options!);
                  setOverlayDropdown(false);
                },
                optionText: options,
              } as Option)
          )}
        />
      </Overlay>
    );

    const heading = (
      <View
        style={[
          props.popUpHeadingStyle,
          styles.popUpHeadingStyle,
          {
            flexDirection: selectedReason == props.otherReasonText ? 'row' : 'column',
          },
        ]}
      >
        {selectedReason == props.otherReasonText ? (
          <TouchableOpacity onPress={() => goBackPress()}>
            <BackArrow />
          </TouchableOpacity>
        ) : null}
        <Text
          style={[
            props.popUpHeadingTextStyle,
            styles.popUpHeadingTextStyle,
            { marginHorizontal: selectedReason == props.otherReasonText ? '30%' : 0 },
          ]}
        >
          {props.headingText}
        </Text>
      </View>
    );

    const content = (
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[props.reasonForCancelStyle, styles.reasonForCancelStyle]}>
          {props.reasonForCancelText}
        </Text>
        {selectedReason != props.otherReasonText ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setOverlayDropdown(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[
                  {
                    flex: 0.9,
                    ...theme.fonts.IBMPlexSansMedium(18),
                    color: theme.colors.SHERPA_BLUE,
                  },
                  selectedReason ? {} : { opacity: 0.3 },
                ]}
                numberOfLines={1}
              >
                {selectedReason || props.optionPlaceholderText}
              </Text>
              <View style={{ flex: 0.1 }}>
                <DropdownGreen style={{ alignSelf: 'flex-end' }} />
              </View>
            </View>
            <View
              style={{
                marginTop: 5,
                backgroundColor: '#00b38e',
                height: 2,
              }}
            />
          </TouchableOpacity>
        ) : (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              setComment(text);
            }}
            placeholder={props.othersPlaceholderText}
          />
        )}
        {selectedReason != props.otherReasonText ? (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              setComment(text);
            }}
            labelStyle={[props.reasonForCancelStyle, styles.reasonForCancelStyle]}
            label={props.commentsLabel}
            placeholder={props.commentsPlaceholderText}
          />
        ) : null}
      </View>
    );

    const bottomButton = (
      <Button
        style={{ margin: 16, marginTop: 32, width: 'auto' }}
        onPress={() => {
          props.onPressSubmit(selectedReason, comment);
        }}
        disabled={!!!selectedReason}
        title={props.buttonText}
      />
    );

    const skipOption = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => props.onPressSubmit('', '')}
        style={styles.skipOptionTouch}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>
    );

    return (
      isCancelVisible && (
        <View style={{ marginHorizontal: 20 }}>
          <TouchableOpacity
            style={{ marginTop: 80, alignSelf: 'flex-end' }}
            onPress={props.onPressCross}
          >
            <CrossPopup />
          </TouchableOpacity>
          <View style={{ height: 16 }} />
          <View style={styles.popUpMainView}>
            {optionsDropdown}
            {heading}
            {content}
            {bottomButton}
            {props.showSkip ? skipOption : null}
          </View>
        </View>
      )
    );
  };

  return <View>{renderReasonForCancelPopUp()}</View>;
};

ReasonPopUp.defaultProps = {
  cancelVisible: false,
  headingText: 'Cancel Order',
  reasonForCancelText: 'Why are you cancelling this?',
  reasonForCancelStyle: styles.reasonForCancelStyle,
  popUpHeadingStyle: styles.popUpHeadingStyle,
  popUpHeadingTextStyle: styles.popUpHeadingTextStyle,
  otherReasonText: 'Others (Please specify)',
  buttonText: 'SUBMIT REQUEST',
  optionPlaceholderText: 'Select reason for cancelling',
  commentsLabel: 'Add Comments (Optional)',
  commentsPlaceholderText: 'Enter your comments here…',
  othersPlaceholderText: 'Write your reason',
  submitOthersWithoutComment: false,
  showSkip: false,
};
