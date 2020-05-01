import styles from '@aph/mobile-doctors/src/components/ui/AddInstructionPopUp.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

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
      <View style={styles.headerContainer}>
        <Text style={styles.headeText}>{strings.smartPrescr.fav_advice}</Text>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonView}>
        <Button
          title={strings.buttons.cancel}
          variant={'white'}
          onPress={() => props.onClose()}
          style={{ width: (width - 110) / 2, marginRight: 16 }}
        />
        <Button
          title={props.data ? strings.smartPrescr.update_advice : strings.smartPrescr.add_advice}
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
          style={styles.inputStyles}
          multiline={true}
          value={value}
          onChangeText={(value) => setValue(value)}
          selectionColor={theme.colors.INPUT_CURSOR_COLOR}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainView}>
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
              style={styles.touchableStyles}
            >
              <Remove style={styles.removeIconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.dataView}>
            {renderHeader()}
            <ScrollView bounces={false}>{renderInput()}</ScrollView>
            {renderButtons()}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
