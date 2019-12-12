import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
  Keyboard,
} from 'react-native';

const styles = StyleSheet.create({
  okButtonStyle: {
    paddingHorizontal: 25,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  okButtonTextStyle: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface UIElementsContextProps {
  loading: boolean;
  setLoading: ((isLoading: boolean) => void) | null;
  showAphAlert: ((params: AphAlertParams) => void) | null;
  hideAphAlert: (() => void) | null;
}

export const UIElementsContext = createContext<UIElementsContextProps>({
  loading: false,
  setLoading: null,
  showAphAlert: null,
  hideAphAlert: null,
});

type AphAlertParams = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  unDismissable?: boolean;
  style?: StyleProp<ViewStyle>;
  onPressOk?: () => void;
};

export const UIElementsProvider: React.FC = (props) => {
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [alertParams, setAlertParams] = useState<AphAlertParams>({});

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
          {alertParams.children || renderOkButton}
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

  return (
    <UIElementsContext.Provider
      value={{
        loading,
        setLoading,
        showAphAlert,
        hideAphAlert,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }} pointerEvents={loading ? 'none' : 'auto'}>
          {props.children}
          {renderLoading()}
        </View>
        {renderAphAlert()}
      </View>
    </UIElementsContext.Provider>
  );
};

export const useUIElements = () => useContext<UIElementsContextProps>(UIElementsContext);
