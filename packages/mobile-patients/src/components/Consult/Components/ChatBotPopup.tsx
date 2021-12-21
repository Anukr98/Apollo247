import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { Spinner } from '../../ui/Spinner';

interface ChatBotPopupProps extends NavigationScreenProps {
  visiblity: boolean;
  appointmentId: string;
  onCloseClicked: () => void;
}

export const ChatBotPopup: React.FC<ChatBotPopupProps> = (props) => {
  const [visiblity, setVisiblity] = useState<boolean>(props.visiblity);
  const [loading, setLoading] = useState<boolean>(true);
  const uri = `https://qa6patients.apollo247.com/patient-vitals?appointmentId=${props.appointmentId}`;

  useEffect(() => {
    setVisiblity(props.visiblity);
  }, [props.visiblity]);

  return (
    <Modal
      animationType={'none'}
      transparent={false}
      visible={visiblity}
      onRequestClose={() => {}}
      onDismiss={() => {}}
    >
      <View style={styles.webView}>
        <WebView
          onLoadEnd={() => setLoading(false)}
          source={{ uri }}
          onMessage={(event) => {
            const { data } = event.nativeEvent;
            console.log({ data });

            JSON.parse(data)?.endAssesment && props.onCloseClicked();
          }}
        />
      </View>
      {loading && <Spinner />}
    </Modal>
  );
};

const styles = StyleSheet.create({
  webView: {
    paddingTop: 100,
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
});
