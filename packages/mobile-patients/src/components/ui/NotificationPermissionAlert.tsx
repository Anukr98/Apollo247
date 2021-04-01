import React from 'react';
import {
  Dimensions,
  Linking,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  View,
} from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface NotificationPermissionAlertProps {
  onPressOutside: () => void;
  onButtonPress: () => void;
}

export const NotificationPermissionAlert: React.FC<NotificationPermissionAlertProps> = (props) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        props.onPressOutside();
      }}
      style={{}}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback>
          <View style={styles.alertCard}>
            <View style={styles.headerCont}>
              <Text style={styles.headerText}>Allow Notifications</Text>
            </View>
            <View style={styles.childCont}>
              <Text style={styles.MsgText} numberOfLines={3}>
                Please allow Apollo 247 to send notifications. Without this permission, doctor will
                not be able to call you.
              </Text>
              <Button
                title={'Allow'}
                style={styles.button}
                titleTextStyle={{ color: 'white', lineHeight: 24, marginVertical: 8 }}
                onPress={() => {
                  props.onButtonPress();
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.3)',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  alertCard: {
    borderRadius: 10,
    width: 0.88 * windowWidth,
    height: 200,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  headerText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.LIGHT_BLUE,
    marginVertical: 18,
    textAlign: 'center',
  },
  childCont: {
    backgroundColor: theme.colors.CARD_BG,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  MsgText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginVertical: 20,
    marginHorizontal: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    marginBottom: 20,
    width: 150,
  },
  headerCont: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
});
