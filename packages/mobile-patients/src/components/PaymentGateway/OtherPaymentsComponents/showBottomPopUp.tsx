import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  // Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GreyCrossIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
export interface ShowBottomPopUpProps {
  onDismissPopUp: () => void;
  childComponent: React.ReactNode;
  paymentMode: string;
  UPIapps: any;
  savedCards: any;
}

export const ShowBottomPopUp: React.FC<ShowBottomPopUpProps> = (props) => {
  const { onDismissPopUp, childComponent, paymentMode, UPIapps, savedCards } = props;

  const getHeader = () => {
    switch (paymentMode) {
      case 'COD':
        return 'PAY ON DELIVERY';
      case 'CARD':
        return !!savedCards?.length ? 'SAVED CARDS' : 'NEW DEBIT/CREDIT CARD';
      case 'WALLET':
        return 'WALLETS';
      case 'CRED':
        return 'CRED PAY';
      case 'UPI':
        return !!UPIapps?.length ? 'UPI APPS' : 'VPA ID';
      case 'FEATURED_BANKS':
        return 'POPULAR BANKS';
      case 'UPICOLLECT':
        return 'ENTER YOUR UPI ID';
      case 'NEWCARD':
        return 'NEW DEBIT/CREDIT CARD';
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerCont}>
        <Text style={styles.header}>{getHeader()}</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => onDismissPopUp()}>
          <GreyCrossIcon style={{ height: 20, width: 20 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContainer = () => {
    return (
      <TouchableWithoutFeedback onPress={() => onDismissPopUp()}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.popUpContainer}>
              {renderHeader()}
              {childComponent}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {
        <Modal
          isVisible={true}
          style={{ marginHorizontal: 0, marginBottom: 0 }}
          backdropColor="rgba(0,0,0,0.75)"
          avoidKeyboard={false}
          animationOut={'slideOutDown'}
          animationOutTiming={500}
        >
          {Platform.OS == 'ios' ? (
            paymentMode == 'NEWCARD' ? (
              <KeyboardAwareScrollView
                keyboardShouldPersistTaps={'always'}
                contentContainerStyle={{ flexGrow: 1 }}
                extraHeight={325}
              >
                {renderContainer()}
              </KeyboardAwareScrollView>
            ) : (
              renderContainer()
            )
          ) : (
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps={'always'}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {renderContainer()}
            </KeyboardAwareScrollView>
          )}
        </Modal>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popUpContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 16,
    width: '100%',
  },
  headerCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  header: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 16,
    color: '#01475B',
  },
});
