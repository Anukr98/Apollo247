import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getAsyncStorageValues } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface ChatBotPopupProps extends NavigationScreenProps {
  visiblity: boolean;
  appointmentId: string;
  onCloseClicked: (data: any) => void;
}

export const ChatBotPopup: React.FC<ChatBotPopupProps> = (props) => {
  const [visiblity, setVisiblity] = useState<boolean>(props.visiblity);
  const [loading, setLoading] = useState<boolean>(true);
  const [uri, setUri] = useState<string>('');

  useEffect(() => {
    setVisiblity(props.visiblity);
  }, [props.visiblity]);

  useEffect(() => {
    const setWebViewUri = async () => {
      const [loginToken, phoneNumber] = await getAsyncStorageValues();
      let token = JSON.parse(loginToken);
      const uri = `${AppConfig.Configuration.PATIENT_VITALS}?utm_token=${token}&utm_mobile_number=${phoneNumber}&appointmentId=${props.appointmentId}`;
      setUri(uri);
    };
    setWebViewUri();
  }, []);

  return (
    <Modal animationType={'none'} transparent={false} visible={visiblity}>
      <WebView
        onLoadEnd={() => setLoading(false)}
        source={{ uri }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent?.data);
          data?.endAssesment && props.onCloseClicked(data?.msgData);
        }}
      />
      {loading && <Spinner />}
    </Modal>
  );
};
