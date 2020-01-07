import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';

export interface AphOverlayProps {
  heading: string;
  isVisible: boolean;
  onClose: () => void;
  loading?: boolean;
  headingViewStyle?: StyleProp<ViewStyle>;
  headingTextStyle?: StyleProp<TextStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
}

export const AphOverlay: React.FC<AphOverlayProps> = (props) => {
  const renderCloseIcon = () => {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: 'white',
          marginBottom: 16,
          marginRight: 2,
          borderRadius: 14,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => props.onClose()}>
          <Remove style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            zIndex: 1,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: '100%',
          },
          props.headingViewStyle,
        ]}
      >
        <Text
          style={[
            {
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.LIGHT_BLUE,
            },
            props.headingTextStyle,
          ]}
        >
          {props.heading}
        </Text>
      </View>
    );
  };

  // const keyboardAvoidingViewProps =
  //   Platform.OS == 'ios' ? { behavior: 'padding', keyboardVerticalOffset: 35 } : {};

  return (
    <Overlay
      onRequestClose={props.onClose}
      isVisible={props.isVisible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={[
        {
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
        },
        props.overlayStyle,
      ]}
    >
      <View
        style={{
          flexGrow: 1,
          backgroundColor: 'transparent',
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}
        >
          {renderCloseIcon()}
          {renderHeader()}
          <KeyboardAvoidingView style={{ flex: 1 }}>
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            >
              {props.children}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        {props.loading && <Spinner />}
      </View>
    </Overlay>
  );
};
