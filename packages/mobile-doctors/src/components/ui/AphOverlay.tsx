import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { ReactNode, useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-navigation';

export interface AphOverlayProps {
  heading?: string;
  isVisible: boolean;
  onClose: () => void;
  loading?: boolean;
  headingViewStyle?: StyleProp<ViewStyle>;
  headingTextStyle?: StyleProp<TextStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  customHeader?: ReactNode;
}

export const AphOverlay: React.FC<AphOverlayProps> = (props) => {
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

  const renderCloseIcon = () => {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: '#ffffff',
          marginBottom: 16,
          marginRight: 2,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => props.onClose()}>
          <Remove style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    const { leftIcon, customHeader } = props;
    if (customHeader) {
      return customHeader;
    }
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            zIndex: 1,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: 'hidden',
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 18,
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal: 20,
          },
          props.headingViewStyle,
        ]}
      >
        <View>
          <TouchableOpacity onPress={() => props.onClose()}>
            {leftIcon ? leftIcon : props.leftIcon}
          </TouchableOpacity>
        </View>
        <Text
          style={[
            {
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.LIGHT_BLUE,
              textAlign: 'center',
              marginHorizontal: 20,
            },
            props.headingTextStyle,
          ]}
          numberOfLines={1}
        >
          {props.heading}
        </Text>
        <View></View>
      </View>
    );
  };

  return (
    <View
      style={[
        {
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
        props.overlayStyle,
      ]}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          marginHorizontal: 30,
        }}
      >
        {renderCloseIcon()}
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              overflow: 'hidden',
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
            }}
            stickyHeaderIndices={props.heading ? [0] : undefined}
          >
            {(props.heading || props.customHeader) && renderHeader()}

            {props.children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {props.loading && <Spinner />}
    </View>
  );
};
