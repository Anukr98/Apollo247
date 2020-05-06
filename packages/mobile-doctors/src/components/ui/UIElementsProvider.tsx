import { BottomPopUp } from '@aph/mobile-doctors/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import UIElementsProviderStyles from '@aph/mobile-doctors/src/components/ui/UIElementsProvider.styles';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const styles = UIElementsProviderStyles;

export interface UIElementsContextProps {
  loading: boolean;
  setLoading: ((isLoading: boolean) => void) | null;
  showAphAlert: ((params: AphAlertParams) => void) | null;
  hideAphAlert: (() => void) | null;
  showNeedHelp: boolean;
  setShowNeedHelp: (show: boolean) => void;
}

export const UIElementsContext = createContext<UIElementsContextProps>({
  loading: false,
  setLoading: null,
  showAphAlert: null,
  hideAphAlert: null,
  showNeedHelp: false,
  setShowNeedHelp: (show) => {},
});

type AphAlertCTAs = {
  text: string;
  onPress: () => void;
  type?: 'orange-button' | 'white-button' | 'orange-link';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type AphAlertParams = {
  title?: string;
  description?: string;
  CTAs?: AphAlertCTAs[];
  ctaContainerStyle?: StyleProp<ViewStyle>;
  // Note: CTAs will be rendered at end of the popup.
  // If CTAs are passed, `OK, GOT IT` will not be rendered.
  children?: React.ReactNode;
  unDismissable?: boolean;
  style?: StyleProp<ViewStyle>;
  onPressOk?: () => void;
};

export const UIElementsProvider: React.FC = (props) => {
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertParams, setAlertParams] = useState<AphAlertParams>({});
  const [showNeedHelp, setShowNeedHelp] = useState<boolean>(false);

  useEffect(() => {
    if (isAlertVisible || loading) {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    }
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [isAlertVisible, loading]);

  const handleBack = async () => {
    console.log('handleBack Called');
    if (!alertParams.unDismissable) {
      // setLoading(false);
      hideAphAlert();
    }
    return true;
  };

  const renderLoading = () => {
    return loading && <Spinner />;
  };

  const renderAphAlert = () => {
    const renderOkButton = (
      <TouchableOpacity
        style={styles.okButtonStyle}
        onPress={() => {
          if (alertParams.onPressOk) {
            alertParams.onPressOk();
          } else {
            hideAphAlert();
          }
        }}
      >
        <Text style={styles.okButtonTextStyle}>OK, GOT IT</Text>
      </TouchableOpacity>
    );

    const renderCTAs = () =>
      !!g(alertParams, 'CTAs', 'length') && (
        <View style={[styles.aphAlertCtaViewStyle, alertParams.ctaContainerStyle]}>
          {alertParams.CTAs!.map((item, index, array) =>
            item.type == 'orange-link' ? (
              <Text
                onPress={item.onPress}
                style={[
                  styles.ctaOrangeTextStyle,
                  { marginRight: index == array.length - 1 ? 0 : 16 },
                ]}
              >
                {item.text}
              </Text>
            ) : (
              <Button
                style={[
                  item.type == 'white-button'
                    ? styles.ctaWhiteButtonViewStyle
                    : styles.ctaOrangeButtonViewStyle,
                  { marginRight: index == array.length - 1 ? 0 : 16 },
                  item.style,
                ]}
                titleTextStyle={[
                  item.type == 'white-button' && styles.ctaOrangeTextStyle,
                  item.textStyle,
                ]}
                title={item.text}
                onPress={item.onPress}
              />
            )
          )}
        </View>
      );

    return (
      isAlertVisible && (
        <BottomPopUp
          title={alertParams.title}
          description={alertParams.description}
          style={alertParams.style}
          onPressBack={() => {
            if (!alertParams.unDismissable) {
              hideAphAlert();
            }
          }}
        >
          {alertParams.children || (g(alertParams, 'CTAs', 'length') ? null : renderOkButton)}
          {renderCTAs()}
        </BottomPopUp>
      )
    );
  };

  const showAphAlert = (params: AphAlertParams) => {
    Keyboard.dismiss();
    setAlertParams(params);
    setAlertVisible(true);
  };

  const hideAphAlert = () => {
    setAlertVisible(false);
    setAlertParams({});
  };
  const renderNeedHelp = () => {
    return showNeedHelp && <NeedHelpCard onPress={() => setShowNeedHelp(false)} />;
  };
  return (
    <UIElementsContext.Provider
      value={{
        loading,
        setLoading,
        showAphAlert,
        hideAphAlert,
        showNeedHelp,
        setShowNeedHelp,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} pointerEvents={loading ? 'none' : 'auto'}>
          {props.children}
          {renderNeedHelp()}
          {renderLoading()}
        </View>
        {renderAphAlert()}
      </View>
    </UIElementsContext.Provider>
  );
};

export const useUIElements = () => useContext<UIElementsContextProps>(UIElementsContext);
