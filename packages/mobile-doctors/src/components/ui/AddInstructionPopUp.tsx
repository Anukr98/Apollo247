import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  BackHandler,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const { width, height } = Dimensions.get('window');

export interface AddInstructionPopUpProps {
  onClose: () => void;
  data?: string;
  onDone?: (value: string) => void;
}
export const AddInstructionPopUp: React.FC<AddInstructionPopUpProps> = (props) => {
  const [value, setValue] = useState<string>(props.data || '');

  const handleBack = async () => {
    props.onClose();
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderHeader = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: width - 60,
            flexDirection: 'row',
          },
        ]}
      >
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          {strings.smartPrescr.fav_advice}
        </Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View
        style={[
          theme.viewStyles.cardContainer,
          {
            width: '100%',
            flexDirection: 'row',
            padding: 16,
            borderBottomEndRadius: 10,
            borderBottomStartRadius: 10,
          },
        ]}
      >
        <Button
          title={strings.buttons.cancel}
          variant={'white'}
          onPress={() => props.onClose()}
          style={{ width: (width - 110) / 2, marginRight: 16 }}
        />
        <Button
          title={strings.smartPrescr.add_advice}
          onPress={() => {
            if (value) {
              props.onDone && props.onDone(value);
            }
            props.onClose();
          }}
          style={{ width: (width - 110) / 2 }}
        />
      </View>
    );
  };

  const renderInput = () => {
    return (
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder={strings.smartPrescr.fav_advice_placeholder}
          textAlignVertical={'top'}
          placeholderTextColor={theme.colors.placeholderTextColor}
          style={{
            borderWidth: 2,
            borderRadius: 10,
            height: 80,
            paddingLeft: 12,
            paddingRight: 12,
            paddingBottom: 12,
            paddingTop: 12,
            borderColor: theme.colors.APP_GREEN,
            ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
          }}
          multiline={true}
          value={value}
          onChangeText={(value) => setValue(value)}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
        />
      </View>
    );
  };
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 5,
        elevation: 500,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <View
          style={{
            paddingHorizontal: 30,
          }}
        >
          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.onClose();
              }}
              style={{
                marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
                backgroundColor: 'white',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                marginRight: 0,
                marginBottom: 8,
              }}
            >
              <Remove style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              borderRadius: 10,
              maxHeight: '85%',
            }}
          >
            {renderHeader()}
            <ScrollView bounces={false}>{renderInput()}</ScrollView>
            {renderButtons()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
