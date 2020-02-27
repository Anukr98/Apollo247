import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import ChoicePopUpStyles from '@aph/mobile-doctors/src/components/ui/ChoicePopUp.styles';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
const { width, height } = Dimensions.get('window');

const styles = ChoicePopUpStyles;

export interface ChoicePopUpProps {
  onClose: () => void;
  headingText?: string;
  headingStyle?: StyleProp<TextStyle>;
  CTAs?: {
    title: string;
    variant?: 'white' | 'orange' | 'green';
    onPress: () => void;
    titleStyle?: StyleProp<TextStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
}
export const ChoicePopUp: React.FC<ChoicePopUpProps> = (props) => {
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

  return (
    <View style={styles.popUPContainer}>
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
              style={styles.headerContainer}
            >
              <Remove style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.mainContainer}>
            {props.headingText && (
              <Text
                style={[
                  theme.viewStyles.text('SB', 20, theme.colors.SHARP_BLUE),
                  { marginBottom: 20 },
                  props.headingStyle,
                ]}
              >
                {props.headingText}
              </Text>
            )}
            {props.CTAs &&
              props.CTAs.map((i) => (
                <Button
                  title={i.title}
                  variant={i.variant}
                  style={[{ borderRadius: 5, marginVertical: 10 }, i.buttonStyle]}
                  titleTextStyle={[i.titleStyle]}
                  buttonIcon={i.icon}
                  disabled={i.disabled}
                  onPress={() => i.onPress()}
                />
              ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
