import React from 'react';
import { Modal, View, Text, Linking, StyleSheet } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

interface UpdateAppPopupProps extends NavigationScreenProps {
  depricatedAppData: any;
}

export const UpdateAppPopup: React.FC<UpdateAppPopupProps> = (props) => {
  const { depricatedAppData } = props;

  return (
    <Modal animationType={'none'} transparent={true} visible={!!depricatedAppData}>
      <View style={styles.updatePopupView}>
        <View style={styles.updatePopupSubView}>
          <View style={styles.updateInfoContainer}>
            <Text style={{ ...theme.viewStyles.text('M', 15, theme.colors.BLACK_COLOR) }}>
              Update your app
            </Text>
            <Text style={styles.updateMessage}>
              {depricatedAppData?.data?.isAppVersionDeprecated?.message}
            </Text>
          </View>
          <Button
            style={styles.button}
            title={'Update now'}
            onPress={() => {
              Linking.openURL(
                depricatedAppData?.data?.isAppVersionDeprecated?.redirectURI
              ).catch((err) => {});
            }}
          />
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  updatePopupView: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  updatePopupSubView: {
    width: '90%',
    height: 200,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
  },
  updateInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  updateMessage: {
    ...theme.viewStyles.text('M', 12, theme.colors.BLACK_COLOR),
    padding: 20,
    textAlign: 'center',
  },
  button: {
    width: 200,
    alignSelf: 'center',
  }
});
