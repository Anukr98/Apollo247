import { BottomPopUp } from '@aph/mobile-doctors/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { UIElementsProviderStyles } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider.styles';
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
  isAlertVisible: boolean;
  setLoading: ((isLoading: boolean) => void) | null;
  showAphAlert: ((params: AphAlertParams) => void) | null;
  hideAphAlert: (() => void) | null;
  showPopup: (params: PopUpParams) => void;
  hidePopup: () => void;
  showNeedHelp: boolean;
  setShowNeedHelp: (show: boolean) => void;
  showFloatingCotainer: (params: FloatingContainerParams) => void;
  hideFloatingContainer: () => void;
}

export const UIElementsContext = createContext<UIElementsContextProps>({
  loading: false,
  isAlertVisible: false,
  setLoading: null,
  showAphAlert: null,
  hideAphAlert: null,
  showPopup: (params) => {},
  hidePopup: () => {},
  showNeedHelp: false,
  setShowNeedHelp: (show) => {},
  showFloatingCotainer: (params: FloatingContainerParams) => {},
  hideFloatingContainer: () => {},
});

export type AphAlertCTAs = {
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

type PopUpParams = {
  title?: string;
  description?: string;
  okText?: string;
  unDismissable?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  descriptionTextStyle?: StyleProp<TextStyle>;
  okTextStyle?: StyleProp<TextStyle>;
  okContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  mainStyle?: StyleProp<ViewStyle>;
  popUpPointerStyle?: StyleProp<ViewStyle>;
  onPressOk?: () => void;
  icon?: React.ReactNode;
  hideOk?: boolean;
  timer?: number;
};

type FloatingContainerParams = {
  child?: React.ReactNode;
  mainContainerStyle?: StyleProp<ViewStyle>;
  backHandleEnabled?: boolean;
  unDismissable?: boolean;
  customBack?: () => void;
};

export const UIElementsProvider: React.FC = (props) => {
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertParams, setAlertParams] = useState<AphAlertParams>({});
  const [showNeedHelp, setShowNeedHelp] = useState<boolean>(false);
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [popUpData, setPopUpData] = useState<PopUpParams>({});
  const [floatingContainer, setFloatingContainer] = useState<boolean>(false);
  const [floatingValue, setFloatingValue] = useState<FloatingContainerParams>({});

  useEffect(() => {
    if (isAlertVisible || loading || isPopUpVisible || floatingValue.backHandleEnabled) {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    }
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [isAlertVisible, loading, isPopUpVisible, floatingValue]);

  const handleBack = async () => {
    console.log('handleBack Called');
    if (!alertParams.unDismissable) {
      // setLoading(false);
      hideAphAlert();
    }
    if (!popUpData.unDismissable) {
      hidePopup();
    }
    if (!floatingValue.unDismissable) {
      if (floatingValue.customBack) {
        floatingValue.customBack();
      } else {
        hideFloatingContainer();
      }
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
  const renderPopUp = () => {
    const {
      title,
      description,
      okText,
      unDismissable,
      titleStyle,
      descriptionTextStyle,
      okTextStyle,
      okContainerStyle,
      style,
      onPressOk,
      popUpPointerStyle,
      icon,
      hideOk,
      timer,
      mainStyle,
    } = popUpData;
    if (timer) {
      setTimeout(() => {
        hidePopup();
      }, timer * 1000);
    }
    return (
      isPopUpVisible && (
        <View style={[styles.popUpContainer, mainStyle]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => (unDismissable ? null : hidePopup())}
          >
            <View style={[styles.popUpMainContainer, style]}>
              {icon ? icon : null}
              <View style={[styles.popUpPointer, popUpPointerStyle]} />
              <View style={{ flex: 1 }}>
                {title && <Text style={[styles.popUpTitleText, titleStyle]}>{title}</Text>}
                {description && (
                  <Text style={[styles.popUpDescriptionText, descriptionTextStyle]}>
                    {description}
                  </Text>
                )}
                {!hideOk ? (
                  <TouchableOpacity
                    style={[styles.okContainer, okContainerStyle]}
                    activeOpacity={1}
                    onPress={() => (onPressOk ? onPressOk() : hidePopup())}
                  >
                    <Text style={[styles.okText, okTextStyle]}>{okText ? okText : 'OKAY'}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    );
  };

  const showPopup = (params: PopUpParams) => {
    setPopUpData(params);
    setIsPopUpVisible(true);
  };

  const hidePopup = () => {
    setIsPopUpVisible(false);
    setPopUpData({});
  };

  const renderFloatingContainer = () => {
    if (floatingContainer) {
      const { child, mainContainerStyle } = floatingValue;
      return <View style={mainContainerStyle}>{child}</View>;
    }
  };

  const showFloatingCotainer = (params: FloatingContainerParams) => {
    setFloatingValue(params);
    setFloatingContainer(true);
  };

  const hideFloatingContainer = () => {
    setFloatingContainer(false);
    setFloatingValue({});
  };

  return (
    <UIElementsContext.Provider
      value={{
        loading,
        setLoading,
        isAlertVisible,
        showAphAlert,
        hideAphAlert,
        showPopup,
        hidePopup,
        showNeedHelp,
        setShowNeedHelp,
        showFloatingCotainer,
        hideFloatingContainer,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} pointerEvents={loading ? 'none' : 'auto'}>
          {props.children}
          {renderNeedHelp()}
          {renderLoading()}
          {renderPopUp()}
          {renderFloatingContainer()}
        </View>
        {renderAphAlert()}
      </View>
    </UIElementsContext.Provider>
  );
};

export const useUIElements = () => useContext<UIElementsContextProps>(UIElementsContext);
