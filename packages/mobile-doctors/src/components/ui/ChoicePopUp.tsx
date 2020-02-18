import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
// const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  popUPContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 5,
    elevation: 500,
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: 0,
    marginBottom: 8,
  },
  headerIconStyle: {
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  mainContainer: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 20,
    maxHeight: '85%',
  },
});

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
