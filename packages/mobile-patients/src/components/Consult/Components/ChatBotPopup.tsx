import React, { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { Spinner } from '../../ui/Spinner';
import { apiBaseUrl } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

interface ChatBotPopupProps extends NavigationScreenProps {
  visiblity: boolean;
  appointmentId: string;
  onCloseClicked: (data: any) => void;
}

export const ChatBotPopup: React.FC<ChatBotPopupProps> = (props) => {
  const [visiblity, setVisiblity] = useState<boolean>(props.visiblity);
  const [loading, setLoading] = useState<boolean>(true);
  const uri = `${AppConfig.Configuration.PATIENT_VITALS}?appointmentId=${props.appointmentId}`;

  useEffect(() => {
    setVisiblity(props.visiblity);
  }, [props.visiblity]);

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
